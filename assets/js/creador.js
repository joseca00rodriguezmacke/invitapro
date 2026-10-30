/* InvitaPro · Creador (modo JC) y Diseñador guiado (creador.html?modo=cliente) */
(function () {
  const { $, $$, esc, qs, api, slugify, code, token, wa, csv, download, toast, copy, base, gs, PLANES, FUNCIONES, feats, LS, CFG } = window.IP;
  const { TEMAS, FUENTES, APERTURAS, TIPOS, tema } = window.IPThemes;
  const CLIENTE = qs.get("modo") === "cliente";
  const ICONOS = ["anillos", "iglesia", "copa", "cena", "musica", "torta", "camara", "estrella", "reloj", "birrete", "regalo", "auto"];
  const EFECTOS = { "": "Del tema", petalos: "Pétalos", hojas: "Hojas", brillos: "Brillos", confeti: "Confeti", globos: "Globos", burbujas: "Burbujas", nieve: "Nieve", neon: "Neón", polvo: "Polvo de luz" };
  const PRECIO = CFG.precios || {};
  const ADDONS = ["Tarjeta imprimible (PDF)", "Save the date", "Imagen para compartir", "Historia de Instagram animada"];

  const NUEVO = () => ({
    slug: "", plan: "pro", funciones: {}, tipo: "boda", mesas: false,
    tema: { id: "dorado", paleta: 0, tipografia: "", ornamento: "medio", apertura: "", efecto: "", particulas: true },
    textos: { nivel: "medio", eyebrow: "", secciones: {} },
    festejados: { nombres: "", iniciales: "" }, fecha: "", fin: "", frase: "", bienvenida: "",
    portada: { imagen: "", video: "" }, musica: { src: "" },
    historia: [], carta: { titulo: "", texto: "", firma: "" }, versiculo: { texto: "", cita: "" }, dedicatoria: "",
    itinerario: [], lugares: [], vestimenta: { codigo: "", descripcion: "", colores: [], evitar: [] },
    galeria: [], padrinos: [], regalos: { mensaje: "", cuentas: [], qr: "", lista: { texto: "", url: "" } },
    rsvp: { whatsapp: "", limite: "", maxLibre: 6 }, fotos: { subir: "", album: "" }
  });

  let ev = LS.get(CLIENTE ? "draft-cliente" : "draft", null) || NUEVO();
  let guests = [], imgMap = {}, step = 0, pvReady = false, pvGuest = false;

  // ---------- path helpers ----------
  const get = (o, p) => p.split(".").reduce((a, k) => a == null ? a : a[k], o);
  const set = (o, p, v) => { const ks = p.split("."); let a = o; ks.slice(0, -1).forEach((k, i) => { if (a[k] == null) a[k] = /^\d+$/.test(ks[i + 1]) ? [] : {}; a = a[k]; }); a[ks[ks.length - 1]] = v; };
  const toLocal = (iso) => { if (!iso) return ""; const d = new Date(iso); if (isNaN(d)) return ""; return new Date(d.getTime() - 3 * 3600e3).toISOString().slice(0, 16); };
  const fromLocal = (v) => v ? v + ":00-03:00" : "";

  // ---------- Esquema del formulario ----------
  const f = (k, l, t, o) => Object.assign({ k, l, t: t || "text" }, o || {});
  const SECCIONES = [
    { id: "evento", t: "El evento", sub: "Tipo, nombres y fecha", c: true, fields: [
      f("tipo", "Tipo de evento", "select", { opts: TIPOS }),
      f("festejados.nombres", "Nombres", "text", { ph: "Sofía & Mateo" }),
      f("festejados.iniciales", "Iniciales / monograma", "text", { ph: "S&M", half: true }),
      f("fecha", "Fecha y hora de inicio", "datetime", { half: true }),
      f("fin", "Hora de finalización (opcional)", "datetime", { half: true }),
      f("slug", "Identificador del link (slug)", "text", { ph: "se genera solo", jc: true, half: true }),
      f("frase", "Frase de portada", "textarea", { ph: "El amor es paciente, es bondadoso…" }),
      f("bienvenida", "Mensaje de bienvenida", "textarea", { ph: "Queremos compartir este día tan especial con vos." }),
      f("textos.eyebrow", "Texto sobre los nombres (opcional)", "text", { ph: "Nos casamos" })
    ] },
    { id: "diseno", t: "Diseño", sub: "Tema, colores, letras y apertura", c: true, custom: designUI },
    { id: "portada", t: "Portada y música", sub: "Foto, video y canción", c: true, fields: [
      f("portada.imagen", "Foto de portada", "img"),
      f("portada.video", "Video de portada (URL .mp4, opcional)", "text", { ph: "eventos/mi-evento/portada.mp4" }),
      f("musica.src", "Música de fondo (MP3)", "audio")
    ] },
    { id: "textos", t: "Textos", sub: "Historia, carta, versículo", c: true, custom: textLevelUI, fields: [
      f("historia", "Nuestra historia", "list", { add: "Agregar momento", fields: [f("fecha", "Año / fecha", "text", { half: true }), f("titulo", "Título", "text", { half: true }), f("texto", "Texto", "textarea"), f("imagen", "Foto (opcional)", "img")] }),
      f("carta.titulo", "Título de la carta", "text", { half: true }), f("carta.firma", "Firma", "text", { half: true }), f("carta.texto", "Carta", "textarea"),
      f("versiculo.texto", "Versículo o cita", "textarea"), f("versiculo.cita", "Referencia", "text", { ph: "1 Corintios 13:4" }),
      f("dedicatoria", "Dedicatoria", "textarea"), f("textos.gracias", "Mensaje de agradecimiento (después del evento)", "textarea")
    ] },
    { id: "lugares", t: "Lugares", sub: "Mapa, Waze y estacionamiento", c: true, fields: [
      f("lugares", "", "list", { add: "Agregar lugar", fields: [f("tipo", "Tipo", "text", { ph: "Ceremonia", half: true }), f("hora", "Hora", "text", { ph: "19:00", half: true }), f("nombre", "Nombre del lugar"), f("direccion", "Dirección"), f("query", "Búsqueda en el mapa (opcional)", "text", { ph: "Parroquia San Rafael, Asunción" }), f("estacionamiento", "Estacionamiento / indicaciones", "textarea")] })
    ] },
    { id: "itinerario", t: "Itinerario", sub: "Línea de tiempo del día", c: true, fields: [
      f("itinerario", "", "list", { add: "Agregar momento", fields: [f("hora", "Hora", "text", { ph: "20:30", half: true }), f("icono", "Ícono", "select", { opts: Object.fromEntries(ICONOS.map(i => [i, i])), half: true }), f("titulo", "Título"), f("descripcion", "Descripción", "text")] })
    ] },
    { id: "vestimenta", t: "Código de vestimenta", sub: "Con paleta de colores", c: true, fields: [
      f("vestimenta.codigo", "Código", "text", { ph: "Formal elegante" }), f("vestimenta.descripcion", "Descripción", "textarea"),
      f("vestimenta.colores", "Colores sugeridos", "list", { add: "Agregar color", fields: [f("hex", "Color", "color", { half: true }), f("nombre", "Nombre", "text", { half: true })] }),
      f("vestimenta.evitar", "Colores a evitar", "list", { add: "Agregar color", fields: [f("hex", "Color", "color", { half: true }), f("nombre", "Nombre", "text", { half: true })] })
    ] },
    { id: "galeria", t: "Galería y familia", sub: "Fotos, padres y padrinos", c: true, fields: [
      f("galeria", "Fotos", "list", { add: "Agregar foto", fields: [f("src", "Foto", "img"), f("alt", "Descripción", "text")] }),
      f("textos.padrinosTitulo", "Título de la sección familia", "text", { ph: "Padres y padrinos" }),
      f("padrinos", "Padres y padrinos", "list", { add: "Agregar", fields: [f("rol", "Rol", "text", { ph: "Padrinos", half: true }), f("nombres", "Nombres", "text", { half: true })] })
    ] },
    { id: "regalos", t: "Regalos", sub: "Cuentas, alias y lista", c: true, fields: [
      f("regalos.mensaje", "Mensaje", "textarea", { ph: "Tu presencia es nuestro mejor regalo…" }),
      f("regalos.cuentas", "Cuentas", "list", { add: "Agregar cuenta", fields: [f("banco", "Banco / billetera", "text", { half: true }), f("titular", "Titular", "text", { half: true }), f("alias", "Alias", "text", { half: true }), f("cuenta", "Nº de cuenta", "text", { half: true }), f("ci", "CI / RUC", "text", { half: true })] }),
      f("regalos.qr", "QR de pago (imagen, opcional)", "img"),
      f("regalos.lista.texto", "Texto del botón de lista externa", "text", { half: true }), f("regalos.lista.url", "Link de la lista", "text", { half: true })
    ] },
    { id: "rsvp", t: "Confirmación y fotos", sub: "WhatsApp, fecha límite, álbum", c: true, fields: [
      f("rsvp.whatsapp", "WhatsApp que recibe confirmaciones", "tel", { ph: "0981 123 456", half: true }), f("rsvp.limite", "Confirmar antes del", "date", { half: true }),
      f("rsvp.maxLibre", "Máx. personas (invitación sin código)", "number", { half: true }),
      f("fotos.subir", "Link para subir fotos (Google Fotos/Drive)", "text", { half: true }), f("fotos.album", "Link al álbum final (después del evento)", "text")
    ] },
    { id: "plan", t: "Plan y funciones", sub: "Básico · Pro · VIP", jc: true, custom: planUI },
    { id: "invitados", t: "Invitados", sub: "Pegá desde Excel y enviá por WhatsApp", jc: true, custom: guestsUI },
    { id: "publicar", t: "Publicar", sub: "JSON, links y extras", jc: true, custom: publishUI },
    { id: "enviar", t: "Elegí tu plan y enviá", sub: "Te respondemos por WhatsApp", cl: true, custom: sendUI }
  ].filter(s => CLIENTE ? (s.c || s.cl) : !s.cl);

  // ---------- Render de campos ----------
  function fieldHTML(fd, path) {
    const v = get(ev, path), id = "f-" + path.replace(/\./g, "-");
    if (fd.jc && CLIENTE) return "";
    const wrap = (inner) => `<label class="field"${fd.half ? "" : ' style="grid-column:1/-1"'}><span>${esc(fd.l)}</span>${inner}</label>`;
    switch (fd.t) {
      case "textarea": return wrap(`<textarea id="${id}" data-p="${path}" placeholder="${esc(fd.ph || "")}">${esc(v || "")}</textarea>`);
      case "select": return wrap(`<select id="${id}" data-p="${path}">${Object.entries(fd.opts).map(([k, l]) => `<option value="${esc(k)}" ${v === k ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>`);
      case "datetime": return wrap(`<input id="${id}" type="datetime-local" data-p="${path}" data-dt value="${esc(toLocal(v))}">`);
      case "color": return wrap(`<span class="row" style="flex-wrap:nowrap"><input type="color" data-p="${path}" value="${esc(v || "#c9a54a")}" style="width:56px;padding:4px;flex:none"><input type="text" data-p="${path}" value="${esc(v || "")}" placeholder="#c9a54a"></span>`);
      case "img": case "audio": return wrap(`<span class="imgf"><input id="${id}" type="text" data-p="${path}" value="${esc(v || "")}" placeholder="${fd.t === "img" ? "URL o eventos/slug/foto.jpg" : "URL o eventos/slug/musica.mp3"}">
        <label class="btn sm ghost">Elegir<input type="file" accept="${fd.t === "img" ? "image/*" : "audio/*"}" data-file="${path}" hidden></label></span>`);
      case "list": {
        const arr = Array.isArray(v) ? v : [];
        return `<div style="grid-column:1/-1" data-list="${path}">${fd.l ? `<div class="label" style="margin:.4rem 0">${esc(fd.l)}</div>` : ""}
          ${arr.map((_, i) => `<div class="rep"><button type="button" class="rm" data-rm="${path}.${i}" aria-label="Quitar">×</button><span class="mv"><button type="button" data-up="${path}.${i}" aria-label="Subir">↑</button></span>
            <div class="g2">${fd.fields.map(sf => fieldHTML(sf, `${path}.${i}.${sf.k}`)).join("")}</div></div>`).join("")}
          <button type="button" class="btn sm soft" data-add="${path}">+ ${esc(fd.add)}</button></div>`;
      }
      default: return wrap(`<input id="${id}" type="${fd.t === "tel" ? "tel" : fd.t === "number" ? "number" : fd.t === "date" ? "date" : "text"}" data-p="${path}" value="${esc(v == null ? "" : v)}" placeholder="${esc(fd.ph || "")}">`);
    }
  }
  // ---------- UI personalizadas ----------
  function designUI() {
    const t = tema(ev.tema.id);
    return `<div class="label" style="margin-bottom:8px">Tema (${TEMAS.length})</div>
      <div class="themes">${TEMAS.map(x => { const p0 = x.paletas[0]; return `<button type="button" class="th" data-theme="${x.id}" aria-pressed="${x.id === ev.tema.id}">
        <span class="sw" style="background:linear-gradient(135deg,${p0.bg},${p0.bg2});color:${p0.primary}">${IPOrn.corner(x.motivo)}<b style="color:${p0.primary}">Aa</b></span>
        <span class="nm">${esc(x.nombre)}</span></button>`; }).join("")}</div>
      <div class="label" style="margin:16px 0 8px">Paleta</div>
      <div class="pals">${t.paletas.map((p, i) => `<button type="button" class="pal" data-pal="${i}" aria-pressed="${(ev.tema.paleta | 0) === i}"><i style="background:${p.bg}"></i><i style="background:${p.primary}"></i><i style="background:${p.accent}"></i><span>${esc(p.nombre)}</span></button>`).join("")}</div>
      <div class="g2" style="margin-top:16px">
        <label class="field"><span>Tipografía</span><select data-p="tema.tipografia"><option value="">Sugerida del tema (${esc(FUENTES[t.fuentes[0]].nombre)})</option>${Object.entries(FUENTES).map(([k, v]) => `<option value="${k}" ${ev.tema.tipografia === k ? "selected" : ""}>${esc(v.nombre)} — ${esc(v.display)} + ${esc(v.body)}</option>`).join("")}</select></label>
        <label class="field"><span>Efecto de partículas</span><select data-p="tema.efecto">${Object.entries(EFECTOS).map(([k, v]) => `<option value="${k}" ${(ev.tema.efecto || "") === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
      </div>
      <div class="label" style="margin:4px 0 8px">Ornamentos</div>
      <div class="seg" role="group">${["minimo", "medio", "rico"].map(o => `<button type="button" data-orn="${o}" aria-pressed="${ev.tema.ornamento === o}">${{ minimo: "Mínimos", medio: "Medios", rico: "Ricos" }[o]}</button>`).join("")}</div>
      <div class="label" style="margin:16px 0 8px">Apertura</div>
      <div class="opts">${Object.entries(Object.assign({ "": "Sugerida del tema" }, APERTURAS, { ninguna: "Sin apertura" })).map(([k, v]) => `<button type="button" class="opt" data-ap="${k}" aria-pressed="${(ev.tema.apertura || "") === k}">${esc(v)}</button>`).join("")}</div>`;
  }
  function textLevelUI() {
    return `<div class="label" style="margin-bottom:8px">Cantidad de texto</div>
      <div class="seg" role="group" style="margin-bottom:6px">${[["basico", "Básico"], ["medio", "Medio"], ["completo", "Completo"]].map(([k, l]) => `<button type="button" data-lvl="${k}" aria-pressed="${ev.textos.nivel === k}">${l}</button>`).join("")}</div>
      <p class="muted" style="font-size:.85em">Básico: frase y bienvenida. Medio: + historia (3 momentos) y frases por sección. Completo: + carta, versículo y dedicatoria.</p>`;
  }
  function planUI() {
    const F = feats(ev);
    return `<div class="plans">${["basico", "pro", "vip"].map(p => `<button type="button" class="plan" data-plan="${p}" aria-pressed="${ev.plan === p}"><b>${{ basico: "Básico", pro: "Pro", vip: "VIP" }[p]}</b><span class="pr">${gs(PRECIO[p])}</span></button>`).join("")}</div>
      <div class="label" style="margin:16px 0 8px">Funciones (las marcadas con borde punteado difieren del plan)</div>
      <div class="feats">${Object.entries(FUNCIONES).map(([k, l]) => { const ov = k in (ev.funciones || {}); return `<label class="${ov ? "ov" : ""}"><input type="checkbox" data-feat="${k}" ${F.has(k) ? "checked" : ""}> ${esc(l)}</label>`; }).join("")}</div>
      <label class="feats" style="margin-top:10px"><label><input type="checkbox" data-mesas ${ev.mesas ? "checked" : ""}> Mostrar mesa asignada en ticket y check-in</label></label>
      <button type="button" class="btn sm ghost" data-resetfeat style="margin-top:10px">Volver a las funciones del plan</button>`;
  }

  const tokens = () => { const all = LS.get("tokens", {}); const s = ev.slug || "_"; if (!all[s]) { all[s] = { host: token(), puerta: token() }; LS.set("tokens", all); } return all[s]; };
  const inviteLink = (c) => base() + (LS.get("useShort", false) ? `i/${ev.slug}/?g=` : `invitacion.html?e=${encodeURIComponent(ev.slug)}&g=`) + encodeURIComponent(c);

  function guestsUI() {
    guests = LS.get("guests:" + ev.slug, guests);
    const tpl = LS.get("tpl", "¡Hola {nombre}! 💌 Te invitamos a celebrar con nosotros. Abrí tu invitación personal acá: {link}");
    return `<p class="muted" style="font-size:.9em">Copiá desde Excel las columnas <b>Nombre · Teléfono · Cupos · Grupo</b>${ev.mesas ? " · Mesa" : ""} y pegalas acá (una fila por invitado).</p>
      <textarea id="paste" placeholder="Familia Gómez&#9;0981 111 222&#9;4&#9;Novia"></textarea>
      <div class="row" style="margin:10px 0 16px"><button type="button" class="btn sm" data-import>Importar</button><button type="button" class="btn sm ghost" data-clearg>Vaciar lista</button></div>
      <label class="field"><span>Mensaje de WhatsApp ({nombre} y {link})</span><textarea data-tpl>${esc(tpl)}</textarea></label>
      ${guests.length ? `<div class="row" style="margin-bottom:10px"><span class="chip">${guests.length} invitados · ${guests.reduce((a, g) => a + (+g.cupos || 0), 0)} cupos</span><span class="sp" style="flex:1"></span>
        <button type="button" class="btn sm" data-sendsheet>Enviar a la planilla</button><button type="button" class="btn sm ghost" data-gcsv>Descargar CSV</button></div>
      <div class="scroll-x"><table class="table gtable"><thead><tr><th>Invitado</th><th>Cupos</th><th>Código</th><th></th></tr></thead><tbody>
      ${guests.map((g, i) => { const msg = tpl.replace(/\{nombre\}/g, g.nombre).replace(/\{link\}/g, inviteLink(g.codigo)); return `<tr><td><b>${esc(g.nombre)}</b><br><small class="muted">${esc(g.grupo || "")} ${esc(g.telefono || "")}</small></td><td>${esc(g.cupos)}</td><td><code>${esc(g.codigo)}</code></td>
        <td style="white-space:nowrap"><button type="button" class="btn sm ghost" data-copylink="${i}">Link</button> ${g.telefono ? `<a class="btn sm wa" href="${esc(wa(g.telefono, msg))}" target="_blank" rel="noopener" onclick="this.classList.add('ghost')">WhatsApp</a>` : ""}</td></tr>`; }).join("")}
      </tbody></table></div>` : `<p class="empty">Todavía no hay invitados.</p>`}`;
  }

  function publishUI() {
    const t = tokens(), s = encodeURIComponent(ev.slug || "mi-evento");
    const L = [["Invitación", `${base()}invitacion.html?e=${s}`], ["Link corto (con build.js)", `${base()}i/${s}/`], ["Panel del anfitrión", `${base()}panel.html?e=${s}&k=${t.host}`], ["Check-in (puerta)", `${base()}checkin.html?e=${s}&k=${t.puerta}`]];
    return `<div class="row" style="margin-bottom:14px"><button type="button" class="btn" data-dljson>Descargar ${esc(ev.slug || "evento")}.json</button>
        <label class="btn ghost">Abrir JSON<input type="file" accept="application/json" data-openjson hidden></label>
        <button type="button" class="btn ghost" data-loadslug>Cargar evento publicado</button><button type="button" class="btn ghost" data-new>Nuevo evento</button></div>
      <p class="muted" style="font-size:.88em">Guardá el JSON en <code>/eventos/</code> y las fotos en <code>/eventos/${esc(ev.slug || "slug")}/</code>. Después: <code>node build.js</code> y subí los cambios.</p>
      <div class="links">${L.map(([n, u]) => `<div class="row"><span><b>${n}</b><br><code>${esc(u)}</code></span><button type="button" class="btn sm ghost" data-cp="${esc(u)}">Copiar</button></div>`).join("")}</div>
      <p class="muted" style="font-size:.85em;margin-top:10px">Los tokens del panel y la puerta se guardan en este navegador y viajan a la planilla al “Enviar a la planilla”. No se publican en el repo.</p>
      <div class="label" style="margin:14px 0 8px">Token admin de la planilla</div>
      <input type="text" data-admintoken value="${esc(LS.get("adminToken", ""))}" placeholder="Lo encontrás en la hoja Config">
      <div class="row" style="margin-top:14px"><a class="btn soft" href="extras.html?draft=1" target="_blank" rel="noopener">✨ Extras: PDF, save the date, historia</a></div>`;
  }

  function sendUI() {
    const sel = LS.get("addons", []);
    return `<div class="plans">${["basico", "pro", "vip"].map(p => `<button type="button" class="plan" data-plan="${p}" aria-pressed="${ev.plan === p}"><b>${{ basico: "Básico", pro: "Pro", vip: "VIP" }[p]}</b><span class="pr">${gs(PRECIO[p])}</span>
      <ul>${{ basico: ["Portada y cuenta regresiva", "Mapa e itinerario", "Confirmación por WhatsApp"], pro: ["Todo lo del Básico", "Invitados con nombre y cupos", "Galería, regalos y RSVP en planilla"], vip: ["Todo lo del Pro", "Panel en vivo y check-in con QR", "Mensajes, canciones, sin marca"] }[p].map(x => `<li>${x}</li>`).join("")}</ul></button>`).join("")}</div>
      <div class="label" style="margin:16px 0 8px">Extras (${gs(PRECIO.addon)} c/u)</div>
      <div class="feats">${ADDONS.map(a => `<label><input type="checkbox" data-addon="${esc(a)}" ${sel.includes(a) ? "checked" : ""}> ${esc(a)}</label>`).join("")}</div>
      <div class="g2" style="margin-top:16px"><label class="field"><span>Tu nombre</span><input type="text" data-cli="nombre" value="${esc(LS.get("cli", {}).nombre || "")}" autocomplete="name"></label>
      <label class="field"><span>Tu WhatsApp</span><input type="tel" data-cli="telefono" value="${esc(LS.get("cli", {}).telefono || "")}" autocomplete="tel"></label></div>
      <p class="notice">Total estimado: <b data-total>${gs(total())}</b>. Las fotos y la música elegidas desde tu teléfono no viajan en el diseño: mandalas por WhatsApp después de enviar.</p>`;
  }
  const total = () => (PRECIO[ev.plan] || 0) + LS.get("addons", []).length * (PRECIO.addon || 0);

  // ---------- Pintar editor ----------
  function paint() {
    $("#modeChip").textContent = CLIENTE ? "Diseñá tu invitación" : "Creador";
    const secHTML = (s, i) => `${s.custom ? s.custom() : ""}${s.fields ? `<div class="g2">${s.fields.map(fd => fieldHTML(fd, fd.k)).join("")}</div>` : ""}`;
    if (CLIENTE) {
      const s = SECCIONES[step];
      $("#editor").innerHTML = `<p class="eyebrow">Paso ${step + 1} de ${SECCIONES.length}</p><h1>${esc(s.t)}</h1><p class="muted">${esc(s.sub)}</p>
        <div class="steps">${SECCIONES.map((_, i) => `<i class="${i <= step ? "on" : ""}"></i>`).join("")}</div>
        <div class="panel-card">${secHTML(s, step)}</div>
        <div class="navbar">${step ? `<button type="button" class="btn ghost" data-prev>Atrás</button>` : ""}${step < SECCIONES.length - 1 ? `<button type="button" class="btn" data-next>Siguiente</button>` : `<button type="button" class="btn wa" data-send>Enviar mi diseño por WhatsApp</button>`}</div>`;
    } else {
      const open = $$("#editor details[open]").map(d => d.dataset.id);
      $("#editor").innerHTML = `<h1>Creador de invitaciones</h1><p class="muted">Completá, mirá la vista previa y descargá el JSON. ${api.demo ? "<b>Modo demo</b>: sin Apps Script configurado." : ""}</p>
        ${SECCIONES.map((s, i) => `<details class="acc" data-id="${s.id}" ${open.includes(s.id) || (!open.length && i === 0) ? "open" : ""}><summary><span class="n">${i + 1}</span>${esc(s.t)}<small>${esc(s.sub)}</small></summary><div class="body">${secHTML(s, i)}</div></details>`).join("")}`;
    }
  }

  // ---------- Vista previa ----------
  let pvT = 0;
  function preview(abrir) {
    clearTimeout(pvT);
    pvT = setTimeout(() => {
      const fr = $("#pv"); if (!pvReady || !fr.contentWindow) return;
      let data = JSON.parse(JSON.stringify(ev));
      if (!data.festejados.nombres) data.festejados.nombres = "Sofía & Mateo";
      if (!data.fecha) data.fecha = new Date(Date.now() + 60 * 864e5).toISOString();
      let s = JSON.stringify(data); Object.entries(imgMap).forEach(([k, u]) => { s = s.split(JSON.stringify(k)).join(JSON.stringify(u)); }); data = JSON.parse(s);
      const guest = pvGuest ? { codigo: "DEMO01", nombre: "Familia Gómez", cupos: 4, grupo: "Familia", mesa: "7" } : null;
      fr.contentWindow.postMessage({ type: "ip-preview", ev: data, abrir: !!abrir, guest }, "*");
    }, abrir ? 0 : 220);
  }
  addEventListener("message", (m) => { if (m.data && m.data.type === "ip-ready") { pvReady = true; preview(); } });

  const save = () => LS.set(CLIENTE ? "draft-cliente" : "draft", ev);
  const autoSlug = () => ev.slug || slugify(ev.tipo + "-" + (ev.festejados.nombres || "evento").replace(/&/g, " y ")) + (ev.fecha ? "-" + ev.fecha.slice(0, 4) : "");
  // "Sofía & Mateo" → "S&M"; "Valentina" → "V"
  const initials = (v) => { const parts = String(v).split(/\s*(?:&|\sy\s)\s*/i).filter(Boolean); return parts.length > 1 ? parts.slice(0, 2).map(x => x.trim()[0].toUpperCase()).join("&") : (parts[0] || "").split(/\s+/).slice(0, 2).map(x => x[0].toUpperCase()).join(""); };

  // ---------- Eventos ----------
  function bind() {
    const E = $("#editor");
    E.addEventListener("input", (e) => {
      const el = e.target, p = el.dataset.p;
      if (p) {
        let v = el.value; if (el.dataset.dt !== undefined) v = fromLocal(v); if (el.type === "number") v = v === "" ? "" : +v;
        set(ev, p, v);
        if (el.type === "color") { const tx = el.parentElement.querySelector('input[type=text]'); if (tx) tx.value = v; }
        if (p === "festejados.nombres" && !ev.festejados.inicialesManual) { ev.festejados.iniciales = initials(v); const ini = $("#f-festejados-iniciales"); if (ini) ini.value = ev.festejados.iniciales; }
        if (p === "festejados.iniciales") ev.festejados.inicialesManual = true;
        save(); preview();
      }
      if (el.dataset.tpl !== undefined) { LS.set("tpl", el.value); }
      if (el.dataset.admintoken !== undefined) LS.set("adminToken", el.value.trim());
      if (el.dataset.cli) { const c = LS.get("cli", {}); c[el.dataset.cli] = el.value; LS.set("cli", c); }
    });
    E.addEventListener("change", async (e) => {
      const el = e.target;
      if (el.dataset.p && el.tagName === "SELECT") { if (el.dataset.p === "tipo" || el.dataset.p === "tema.tipografia") paint(); }
      if (el.dataset.tpl !== undefined) paint();
      if (el.dataset.file) {
        const file = el.files[0]; if (!file) return;
        const path = CLIENTE ? "local:" + file.name : `eventos/${autoSlug()}/${file.name}`;
        imgMap[path] = URL.createObjectURL(file); set(ev, el.dataset.file, path); save(); paint(); preview();
        if (!CLIENTE) toast(`Copiá ${file.name} en eventos/${autoSlug()}/`, 4000);
      }
      if (el.dataset.feat) {
        const k = el.dataset.feat, inPlan = (PLANES[ev.plan] || []).includes(k); ev.funciones = ev.funciones || {};
        if (el.checked === inPlan) delete ev.funciones[k]; else ev.funciones[k] = el.checked; save(); paint(); preview();
      }
      if (el.dataset.mesas !== undefined) { ev.mesas = el.checked; save(); preview(); }
      if (el.dataset.addon) { const a = new Set(LS.get("addons", [])); el.checked ? a.add(el.dataset.addon) : a.delete(el.dataset.addon); LS.set("addons", [...a]); const t = $("[data-total]"); if (t) t.textContent = gs(total()); }
      if (el.dataset.openjson !== undefined) { try { ev = Object.assign(NUEVO(), JSON.parse(await el.files[0].text())); save(); paint(); preview(); toast("Evento cargado"); } catch (err) { toast("JSON inválido"); } }
    });
    E.addEventListener("click", async (e) => {
      const b = e.target.closest("button"); if (!b) return; const d = b.dataset;
      if (d.theme) { ev.tema.id = d.theme; ev.tema.paleta = 0; ev.tema.tipografia = ""; ev.tema.apertura = ""; ev.tema.efecto = ""; save(); paint(); preview(); }
      else if (d.pal) { ev.tema.paleta = +d.pal; save(); paint(); preview(); }
      else if (d.orn) { ev.tema.ornamento = d.orn; save(); paint(); preview(); }
      else if (d.ap !== undefined) { ev.tema.apertura = d.ap; save(); paint(); preview(d.ap !== "ninguna"); }
      else if (d.lvl) { ev.textos.nivel = d.lvl; save(); paint(); preview(); }
      else if (d.plan) { ev.plan = d.plan; save(); paint(); preview(); }
      else if (d.resetfeat !== undefined) { ev.funciones = {}; save(); paint(); preview(); }
      else if (d.add) { const arr = get(ev, d.add) || []; arr.push({}); set(ev, d.add, arr); save(); paint(); preview(); }
      else if (d.rm) { const ps = d.rm.split("."), i = +ps.pop(), arr = get(ev, ps.join(".")); arr.splice(i, 1); save(); paint(); preview(); }
      else if (d.up) { const ps = d.up.split("."), i = +ps.pop(), arr = get(ev, ps.join(".")); if (i > 0) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; save(); paint(); preview(); } }
      else if (d.next !== undefined) { step = Math.min(SECCIONES.length - 1, step + 1); paint(); scrollTo({ top: 0, behavior: "smooth" }); }
      else if (d.prev !== undefined) { step = Math.max(0, step - 1); paint(); scrollTo({ top: 0, behavior: "smooth" }); }
      else if (d.import !== undefined) importGuests();
      else if (d.clearg !== undefined) { if (confirm("¿Vaciar la lista de invitados de este evento?")) { guests = []; LS.set("guests:" + ev.slug, guests); paint(); } }
      else if (d.copylink) copy(inviteLink(guests[+d.copylink].codigo));
      else if (d.gcsv !== undefined) download(ev.slug + "-links.csv", csv([["Nombre", "Teléfono", "Cupos", "Grupo", "Mesa", "Código", "Link"]].concat(guests.map(g => [g.nombre, g.telefono, g.cupos, g.grupo, g.mesa || "", g.codigo, inviteLink(g.codigo)]))), "text/csv;charset=utf-8");
      else if (d.sendsheet !== undefined) sendSheet(b);
      else if (d.dljson !== undefined) dlJson();
      else if (d.cp) copy(d.cp);
      else if (d.new !== undefined) { if (confirm("¿Empezar un evento nuevo? El actual queda en tu JSON descargado.")) { ev = NUEVO(); guests = []; save(); paint(); preview(); } }
      else if (d.loadslug !== undefined) { const s = prompt("Slug del evento (ej: boda-sofia-y-mateo)"); if (s) { try { ev = Object.assign(NUEVO(), await IP.loadEvent(s)); save(); paint(); preview(); toast("Evento cargado"); } catch (err) { toast(err.message); } } }
      else if (d.send !== undefined) sendOrder(b);
    });
  }

  function importGuests() {
    if (!ev.slug) { ev.slug = autoSlug(); save(); }
    const txt = $("#paste").value.trim(); if (!txt) return toast("Pegá filas desde Excel");
    const seen = new Set(guests.map(g => g.codigo)); let n = 0;
    txt.split(/\r?\n/).forEach(line => {
      const c = line.split(/\t|;|,(?=\s*\d|\s*$)/).map(s => s.trim()); if (!c[0] || /^nombre$/i.test(c[0])) return;
      let cod; do { cod = code(6); } while (seen.has(cod)); seen.add(cod);
      guests.push({ codigo: cod, nombre: c[0], telefono: c[1] || "", cupos: Math.max(1, parseInt(c[2], 10) || 1), grupo: c[3] || "", mesa: c[4] || "" }); n++;
    });
    LS.set("guests:" + ev.slug, guests); toast(`${n} invitados importados`); paint();
  }

  async function sendSheet(btn) {
    const t = tokens();
    if (!api.demo && !LS.get("adminToken", "")) { toast("Cargá el token admin en la sección Publicar", 4000); return; }
    btn.disabled = true; btn.textContent = "Enviando…";
    try {
      const r = await api.call("addGuests", { evento: ev.slug, k: LS.get("adminToken", ""), tokenAnfitrion: t.host, tokenPuerta: t.puerta, nombre: ev.festejados.nombres, invitados: JSON.stringify(guests) });
      toast(api.demo ? "Guardado en modo demo (este navegador)" : `Listo: ${r.nuevos} nuevos, ${r.actualizados} actualizados`, 4000);
    } catch (e) { toast(e.message, 4000); }
    btn.disabled = false; btn.textContent = "Enviar a la planilla";
  }

  function dlJson() {
    ev.slug = autoSlug(); save();
    const out = JSON.parse(JSON.stringify(ev)); delete out.festejados.inicialesManual;
    download(ev.slug + ".json", JSON.stringify(out, null, 2), "application/json"); paint();
  }

  async function sendOrder(btn) {
    const cli = LS.get("cli", {});
    if (!cli.nombre || !cli.telefono) { toast("Completá tu nombre y WhatsApp"); return; }
    btn.disabled = true;
    const data = JSON.parse(JSON.stringify(ev)); ev.slug = autoSlug();
    let id = "";
    try { const r = await api.call("pedido", { nombre: cli.nombre, telefono: cli.telefono, tipo: ev.tipo, json: JSON.stringify(data) }); id = r.id; } catch (e) { console.warn(e); }
    if (api.demo || !id) download("mi-invitacion.json", JSON.stringify(data, null, 2), "application/json");
    const t = tema(ev.tema.id), add = LS.get("addons", []);
    const msg = `¡Hola! Soy ${cli.nombre}. Diseñé mi invitación en InvitaPro ✨${id ? `\nPedido: ${id}` : "\n(Te adjunto el archivo de mi diseño)"}\nEvento: ${TIPOS[ev.tipo]} · ${ev.festejados.nombres}\nFecha: ${ev.fecha ? IP.fmtFecha(ev.fecha) : "a definir"}\nEstilo: ${t.nombre} · ${t.paletas[ev.tema.paleta | 0].nombre}\nPlan: ${ev.plan.toUpperCase()}${add.length ? `\nExtras: ${add.join(", ")}` : ""}\nTotal estimado: ${gs(total())}`;
    open(wa(CFG.whatsappVentas, msg), "_blank"); btn.disabled = false;
  }

  // ---------- Inicio ----------
  if (CLIENTE) { $("#pvGuest").hidden = true; document.title = "Diseñá tu invitación · InvitaPro"; }
  paint(); bind();
  $("#pvOpen").onclick = () => preview(true);
  $("#pvGuest").onclick = (e) => { pvGuest = !pvGuest; e.target.textContent = pvGuest ? "Ver sin invitado" : "Ver como invitado"; preview(); };
  $("#pvToggle").onclick = (e) => { const s = $("#studio").classList.toggle("show-preview"); e.target.textContent = s ? "Editar" : "Vista previa"; if (s) preview(); };
})();
