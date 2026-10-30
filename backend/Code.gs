/**
 * InvitaPro · Backend en Google Apps Script + Google Sheets (costo cero).
 *
 * Instalación (detalle en README.md):
 *  1. Creá una planilla nueva en Google Sheets → Extensiones → Apps Script.
 *  2. Pegá este archivo completo en Code.gs y guardá.
 *  3. Ejecutá una vez la función `setup` (te pide permisos: aceptá). Crea las hojas y un TOKEN ADMIN
 *     que queda anotado en la hoja "Config" (guardalo, lo usa creador.html).
 *  4. Implementar → Nueva implementación → Tipo: Aplicación web → Ejecutar como: Yo → Acceso: Cualquier persona.
 *  5. Copiá la URL que termina en /exec y pegala en config.js (appsScriptUrl).
 *
 * El navegador envía POST con cuerpo URL-encoded (petición "simple", sin preflight CORS).
 * La lista de invitados vive solo en la planilla, nunca en el repositorio público.
 */

var HOJAS = {
  Eventos:    ['slug', 'tokenAnfitrion', 'tokenAdmin', 'tokenPuerta', 'nombre', 'creado'],
  Invitados:  ['evento', 'codigo', 'nombre', 'telefono', 'cupos', 'grupo', 'mesa', 'creado'],
  Respuestas: ['evento', 'codigo', 'nombre', 'asiste', 'cantidad', 'acompanantes', 'restricciones', 'mensaje', 'cancion', 'actualizado', 'creado'],
  Mensajes:   ['evento', 'codigo', 'nombre', 'mensaje', 'aprobado', 'fecha'],
  Canciones:  ['evento', 'codigo', 'nombre', 'cancion', 'fecha'],
  Checkin:    ['evento', 'codigo', 'nombre', 'personas', 'fecha', 'puerta'],
  Pedidos:    ['id', 'nombre', 'telefono', 'tipo', 'fecha', 'json', 'recibido'],
  Config:     ['clave', 'valor']
};

function setup() {
  var ss = SpreadsheetApp.getActive();
  Object.keys(HOJAS).forEach(function (n) {
    var sh = ss.getSheetByName(n) || ss.insertSheet(n);
    if (sh.getLastRow() === 0) { sh.appendRow(HOJAS[n]); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HOJAS[n].length).setFontWeight('bold'); }
  });
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('ADMIN_TOKEN')) {
    var t = Utilities.getUuid().replace(/-/g, '');
    props.setProperty('ADMIN_TOKEN', t);
    ss.getSheetByName('Config').appendRow(['ADMIN_TOKEN (pegalo en creador.html)', t]);
  }
  var def = ss.getSheetByName('Sheet1') || ss.getSheetByName('Hoja 1');
  if (def && ss.getSheets().length > 1 && def.getLastRow() === 0) ss.deleteSheet(def);
  return 'Listo. Token admin en la hoja Config.';
}

// ---------- Entrada ----------
function doGet(e) { return handle_(e); }
function doPost(e) { return handle_(e); }

function handle_(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.website) return out_({ ok: true }); // honeypot: bots completan este campo
    var fn = ACTIONS[p.action];
    if (!fn) throw new Error('Acción desconocida');
    return out_(fn(p));
  } catch (err) {
    return out_({ ok: false, error: String(err.message || err) });
  }
}

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// ---------- Utilidades de hoja ----------
function sheet_(n) { return SpreadsheetApp.getActive().getSheetByName(n); }
function rows_(n) {
  var sh = sheet_(n), v = sh.getDataRange().getValues(), h = v.shift();
  return v.map(function (r, i) { var o = { _row: i + 2 }; h.forEach(function (k, j) { o[k] = r[j]; }); return o; });
}
function append_(n, o) { sheet_(n).appendRow(HOJAS[n].map(function (k) { return o[k] === undefined ? '' : o[k]; })); }
function update_(n, row, o) {
  var h = HOJAS[n]; sheet_(n).getRange(row, 1, 1, h.length).setValues([h.map(function (k) { return o[k] === undefined ? '' : o[k]; })]);
}
function clean_(s, max) { return String(s == null ? '' : s).replace(/[\u0000-\u001f]/g, ' ').replace(/^[=+\-@]/, "'$&").trim().slice(0, max || 200); }
function req_(p, k) { if (!p[k]) throw new Error('Falta ' + k); return p[k]; }
function now_() { return Utilities.formatDate(new Date(), 'America/Asuncion', "yyyy-MM-dd'T'HH:mm:ss'-03:00'"); }

function eventRow_(slug) { return rows_('Eventos').filter(function (r) { return r.slug === slug; })[0]; }
function isAdmin_(p, ev) {
  var t = p.k || p.token || '', master = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN');
  return !!t && (t === master || (ev && ev.tokenAdmin && t === ev.tokenAdmin));
}
function authHost_(p) {
  var ev = eventRow_(req_(p, 'evento'));
  var t = p.k || p.token || '';
  if (isAdmin_(p, ev)) return ev || {};
  if (!ev || !t || (t !== String(ev.tokenAnfitrion) && t !== String(ev.tokenPuerta))) throw new Error('Token inválido');
  return ev;
}
function guestBy_(evento, codigo) {
  return rows_('Invitados').filter(function (r) { return r.evento === evento && String(r.codigo) === String(codigo); })[0];
}
function lock_(fn) {
  var l = LockService.getScriptLock(); l.waitLock(15000);
  try { return fn(); } finally { l.releaseLock(); }
}

// ---------- Acciones ----------
var ACTIONS = {
  // Datos públicos de un invitado (solo nombre, cupos, grupo, mesa) + su respuesta previa
  guest: function (p) {
    var g = guestBy_(req_(p, 'evento'), req_(p, 'codigo'));
    if (!g) throw new Error('Código no encontrado');
    var r = rows_('Respuestas').filter(function (x) { return x.evento === p.evento && String(x.codigo) === String(p.codigo); })[0];
    return { ok: true, guest: { codigo: g.codigo, nombre: g.nombre, cupos: g.cupos, grupo: g.grupo, mesa: g.mesa },
      respuesta: r ? { nombre: r.nombre, asiste: r.asiste, cantidad: r.cantidad, acompanantes: r.acompanantes, restricciones: r.restricciones, mensaje: r.mensaje, cancion: r.cancion, codigo: r.codigo } : null };
  },

  // Crear o actualizar respuesta (sin duplicados por código)
  rsvp: function (p) {
    return lock_(function () {
      var evento = clean_(req_(p, 'evento'), 80), nombre = clean_(req_(p, 'nombre'), 120);
      var asiste = p.asiste === 'no' ? 'no' : 'si', codigo = clean_(p.codigo, 40);
      var cantidad = Math.max(0, parseInt(p.cantidad, 10) || 0);
      if (codigo && !/^libre-/.test(codigo)) {
        var g = guestBy_(evento, codigo); if (!g) throw new Error('Código no encontrado');
        cantidad = Math.min(cantidad, parseInt(g.cupos, 10) || 1);
      } else {
        if (!eventRow_(evento)) throw new Error('Evento no encontrado');
        codigo = codigo || ('libre-' + Utilities.getUuid().slice(0, 8));
        cantidad = Math.min(cantidad, 10);
      }
      if (asiste === 'no') cantidad = 0;
      var o = { evento: evento, codigo: codigo, nombre: nombre, asiste: asiste, cantidad: cantidad,
        acompanantes: clean_(p.acompanantes, 500), restricciones: clean_(p.restricciones, 300), mensaje: clean_(p.mensaje, 500),
        cancion: clean_(p.cancion, 150), actualizado: now_() };
      var prev = rows_('Respuestas').filter(function (r) { return r.evento === evento && String(r.codigo) === codigo; })[0];
      if (prev) { o.creado = prev.creado; update_('Respuestas', prev._row, o); } else { o.creado = o.actualizado; append_('Respuestas', o); }
      if (o.mensaje) {
        var pm = rows_('Mensajes').filter(function (r) { return r.evento === evento && String(r.codigo) === codigo; })[0];
        var m = { evento: evento, codigo: codigo, nombre: nombre, mensaje: o.mensaje, aprobado: pm ? pm.aprobado : 'SI', fecha: now_() };
        if (pm) update_('Mensajes', pm._row, m); else append_('Mensajes', m);
      }
      if (o.cancion) {
        var pc = rows_('Canciones').filter(function (r) { return r.evento === evento && String(r.codigo) === codigo; })[0];
        var c = { evento: evento, codigo: codigo, nombre: nombre, cancion: o.cancion, fecha: now_() };
        if (pc) update_('Canciones', pc._row, c); else append_('Canciones', c);
      }
      return { ok: true, codigo: codigo };
    });
  },

  // Mensajes visibles (aprobado = SI). Para ocultar uno, poné NO en la columna "aprobado".
  messages: function (p) {
    var ev = req_(p, 'evento');
    var ms = rows_('Mensajes').filter(function (r) { return r.evento === ev && String(r.aprobado).toUpperCase() !== 'NO'; })
      .reverse().slice(0, 60).map(function (r) { return { nombre: r.nombre, mensaje: r.mensaje, fecha: r.fecha }; });
    return { ok: true, mensajes: ms };
  },

  // Panel del anfitrión (token de anfitrión)
  stats: function (p) {
    authHost_(p);
    var ev = p.evento;
    var resp = {}; rows_('Respuestas').forEach(function (r) { if (r.evento === ev) resp[String(r.codigo)] = r; });
    var chk = {}; rows_('Checkin').forEach(function (r) { if (r.evento === ev) chk[String(r.codigo)] = { fecha: r.fecha, personas: r.personas }; });
    var lista = rows_('Invitados').filter(function (g) { return g.evento === ev; }).map(function (g) {
      var r = resp[String(g.codigo)]; delete resp[String(g.codigo)];
      return { codigo: g.codigo, nombre: g.nombre, telefono: g.telefono, cupos: g.cupos, grupo: g.grupo, mesa: g.mesa, respuesta: r ? strip_(r) : null, checkin: chk[String(g.codigo)] || null };
    });
    Object.keys(resp).forEach(function (k) { var r = resp[k]; lista.push({ codigo: r.codigo, nombre: r.nombre, telefono: '', cupos: r.cantidad, grupo: 'Sin código', respuesta: strip_(r), checkin: null }); });
    var mensajes = rows_('Mensajes').filter(function (r) { return r.evento === ev; }).reverse().map(function (r) { return { nombre: r.nombre, mensaje: r.mensaje, fecha: r.fecha, aprobado: r.aprobado }; });
    return { ok: true, lista: lista, mensajes: mensajes };
  },

  // Alta masiva de invitados (token admin). invitados = JSON [{codigo,nombre,telefono,cupos,grupo,mesa}]
  addGuests: function (p) {
    return lock_(function () {
      var evento = clean_(req_(p, 'evento'), 80), ev = eventRow_(evento);
      if (!isAdmin_(p, ev)) throw new Error('Token admin inválido');
      if (!ev) {
        append_('Eventos', { slug: evento, tokenAnfitrion: clean_(p.tokenAnfitrion || Utilities.getUuid().replace(/-/g, ''), 60), tokenAdmin: '', tokenPuerta: clean_(p.tokenPuerta, 60), nombre: clean_(p.nombre, 120), creado: now_() });
      } else if (p.tokenAnfitrion && !ev.tokenAnfitrion) {
        ev.tokenAnfitrion = clean_(p.tokenAnfitrion, 60); update_('Eventos', ev._row, ev);
      }
      var list = JSON.parse(p.invitados || '[]'); if (!Array.isArray(list)) throw new Error('Formato inválido');
      var existing = {}; rows_('Invitados').forEach(function (r) { if (r.evento === evento) existing[String(r.codigo)] = r; });
      var nuevos = 0, act = 0;
      list.slice(0, 1500).forEach(function (g) {
        var o = { evento: evento, codigo: clean_(g.codigo, 20), nombre: clean_(g.nombre, 120), telefono: clean_(g.telefono, 30), cupos: Math.max(1, parseInt(g.cupos, 10) || 1), grupo: clean_(g.grupo, 60), mesa: clean_(g.mesa, 20), creado: now_() };
        if (!o.codigo || !o.nombre) return;
        var prev = existing[o.codigo];
        if (prev) { o.creado = prev.creado; update_('Invitados', prev._row, o); act++; } else { append_('Invitados', o); nuevos++; }
      });
      return { ok: true, nuevos: nuevos, actualizados: act };
    });
  },

  // Check-in en la puerta (token de anfitrión o de puerta)
  checkin: function (p) {
    return lock_(function () {
      authHost_(p);
      var g = guestBy_(p.evento, req_(p, 'codigo')); if (!g) throw new Error('Código no encontrado');
      var prev = rows_('Checkin').filter(function (r) { return r.evento === p.evento && String(r.codigo) === String(g.codigo); })[0];
      var r = rows_('Respuestas').filter(function (x) { return x.evento === p.evento && String(x.codigo) === String(g.codigo); })[0];
      var personas = parseInt(p.personas, 10) || (r && r.asiste === 'si' ? parseInt(r.cantidad, 10) : 0) || g.cupos;
      if (!prev && p.consultar !== '1') append_('Checkin', { evento: p.evento, codigo: g.codigo, nombre: g.nombre, personas: personas, fecha: now_(), puerta: clean_(p.puerta, 40) });
      return { ok: true, yaIngreso: !!prev, checkin: prev ? { fecha: prev.fecha, personas: prev.personas } : { fecha: now_(), personas: personas },
        guest: { codigo: g.codigo, nombre: g.nombre, cupos: g.cupos, grupo: g.grupo, mesa: g.mesa }, respuesta: r ? strip_(r) : null };
    });
  },

  // Pedido enviado por un cliente desde el diseñador (creador.html?modo=cliente)
  pedido: function (p) {
    return lock_(function () {
      var json = String(p.json || ''); if (json.length > 49000) throw new Error('Diseño demasiado grande');
      JSON.parse(json);
      var id = 'P-' + Utilities.getUuid().slice(0, 5).toUpperCase();
      append_('Pedidos', { id: id, nombre: clean_(p.nombre, 120), telefono: clean_(p.telefono, 30), tipo: clean_(p.tipo, 30), fecha: now_(), json: json, recibido: '' });
      return { ok: true, id: id };
    });
  }
};

function strip_(r) { return { nombre: r.nombre, asiste: r.asiste, cantidad: r.cantidad, acompanantes: r.acompanantes, restricciones: r.restricciones, mensaje: r.mensaje, cancion: r.cancion, fecha: r.actualizado, codigo: r.codigo }; }
