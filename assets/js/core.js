/* InvitaPro · Núcleo compartido: datos del evento, planes, API (Apps Script o modo demo), utilidades. */
(function () {
  const CFG = window.INVITAPRO_CONFIG || {};
  const TZ = "America/Asuncion";
  const qs = new URLSearchParams(location.search);

  // ---------- Utilidades ----------
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slugify = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const fold = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const gs = (n) => "Gs. " + Number(n || 0).toLocaleString("es-PY");
  const telPY = (t) => { let d = String(t || "").replace(/\D/g, ""); if (!d) return ""; if (d.startsWith("0")) d = "595" + d.slice(1); else if (!d.startsWith("595") && d.length <= 10) d = "595" + d; return d; };
  const wa = (tel, text) => "https://wa.me/" + telPY(tel) + "?text=" + encodeURIComponent(text || "");
  const code = (n) => { const A = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; let s = ""; const r = crypto.getRandomValues(new Uint32Array(n || 6)); r.forEach(x => s += A[x % A.length]); return s; };
  const token = () => code(20);
  const fmtFecha = (d, o) => new Date(d).toLocaleDateString("es-PY", Object.assign({ timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" }, o || {}));
  const fmtHora = (d) => new Date(d).toLocaleTimeString("es-PY", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
  const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const base = () => (CFG.baseUrl || (location.origin + location.pathname.replace(/[^/]*$/, ""))).replace(/\/?$/, "/");

  function toast(msg, ms) {
    let t = $("#ip-toast"); if (!t) { t = document.createElement("div"); t.id = "ip-toast"; t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), ms || 2600);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); } catch (e) { const a = document.createElement("textarea"); a.value = text; document.body.appendChild(a); a.select(); document.execCommand("copy"); a.remove(); }
    toast("Copiado ✓");
  }
  function download(name, content, type) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: type || "text/plain;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function csv(rows) {
    const q = (v) => { v = v == null ? "" : String(v); return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    return "﻿" + rows.map(r => r.map(q).join(",")).join("\n");
  }
  function qrSvg(text, opts) {
    if (!window.qrcode) return "";
    const q = qrcode(0, (opts && opts.ecc) || "M"); q.addData(unescape(encodeURIComponent(text)), "Byte"); q.make();
    const n = q.getModuleCount(), m = 2; let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`;
    return `<svg viewBox="0 0 ${n + m * 2} ${n + m * 2}" shape-rendering="crispEdges" role="img" aria-label="${esc((opts && opts.label) || "Código QR")}"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="${(opts && opts.color) || "#111"}"/></svg>`;
  }

  // ---------- Planes y funciones ----------
  const BASICO = ["portada", "cuenta", "mapa", "itinerario", "vestimenta", "rsvpWhatsapp", "compartir"];
  const PRO = BASICO.concat(["personalizado", "rsvpPlanilla", "galeria", "regalos", "acompanantes", "restricciones", "padrinos", "historia", "fotos"]);
  const VIP = PRO.concat(["panel", "checkin", "mensajes", "canciones", "recordatorios", "sinMarca", "qrIngreso"]);
  const PLANES = { basico: BASICO, pro: PRO, vip: VIP };
  const FUNCIONES = {
    portada: "Portada", cuenta: "Cuenta regresiva", mapa: "Mapa y lugares", itinerario: "Itinerario", vestimenta: "Código de vestimenta",
    rsvpWhatsapp: "Confirmación por WhatsApp", compartir: "Botón compartir", personalizado: "Invitados personalizados", rsvpPlanilla: "RSVP en planilla",
    galeria: "Galería", regalos: "Regalos", acompanantes: "Lista de acompañantes", restricciones: "Restricciones alimentarias", padrinos: "Padrinos y familia",
    historia: "Nuestra historia", fotos: "Subí tus fotos", panel: "Panel del anfitrión", checkin: "Check-in con QR", qrIngreso: "QR personal de ingreso",
    mensajes: "Libro de mensajes", canciones: "Canciones sugeridas", recordatorios: "Recordatorios a pendientes", sinMarca: "Sin marca InvitaPro", mesas: "Mesas asignadas"
  };
  function feats(ev) {
    const set = new Set(PLANES[ev.plan] || PLANES.basico);
    Object.entries(ev.funciones || {}).forEach(([k, v]) => v ? set.add(k) : set.delete(k));
    return set;
  }

  // ---------- Carga del evento ----------
  async function loadEvent(slug) {
    if (!slug) throw new Error("Falta el evento (?e=)");
    const r = await fetch("eventos/" + encodeURIComponent(slug) + ".json", { cache: "no-cache" });
    if (!r.ok) throw new Error("No encontramos esta invitación.");
    const ev = await r.json(); ev.slug = ev.slug || slug; return ev;
  }

  // ---------- API ----------
  const demo = !CFG.appsScriptUrl;
  const LS = {
    get(k, d) { try { return JSON.parse(localStorage.getItem("ip:" + k)) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("ip:" + k, JSON.stringify(v)); } catch (e) {} }
  };

  async function remote(action, data) {
    const body = new URLSearchParams(Object.assign({ action }, data || {}));
    const r = await fetch(CFG.appsScriptUrl, { method: "POST", body, redirect: "follow" });
    const j = await r.json(); if (!j.ok) throw new Error(j.error || "Error del servidor"); return j;
  }

  // Implementación local (modo demo): invitados de prueba en el JSON + respuestas en localStorage.
  const local = {
    _ev: null,
    guests(slug) { return ((this._ev && this._ev.slug === slug && this._ev.demo_invitados) || []).concat(LS.get("guests:" + slug, [])); },
    resp(slug) { return LS.get("resp:" + slug, {}); },
    async guest({ evento, codigo }) { const g = this.guests(evento).find(x => x.codigo === codigo); if (!g) throw new Error("Código no encontrado"); return { ok: true, guest: g, respuesta: this.resp(evento)[codigo] || null }; },
    async rsvp(d) {
      const all = this.resp(d.evento); const key = d.codigo || ("libre-" + (slugify(d.nombre) || code()));
      all[key] = Object.assign({}, d, { codigo: key, fecha: new Date().toISOString() }); LS.set("resp:" + d.evento, all);
      if (d.mensaje) { const m = LS.get("msgs:" + d.evento, []); m.unshift({ nombre: d.nombre, mensaje: d.mensaje, fecha: new Date().toISOString() }); LS.set("msgs:" + d.evento, m); }
      return { ok: true, codigo: key };
    },
    async messages({ evento }) { return { ok: true, mensajes: LS.get("msgs:" + evento, []).concat((this._ev && this._ev.demo_mensajes) || []) }; },
    async stats({ evento }) {
      const resp = this.resp(evento), gs = this.guests(evento);
      const extra = Object.values(resp).filter(r => !gs.find(g => g.codigo === r.codigo)).map(r => ({ codigo: r.codigo, nombre: r.nombre, cupos: r.cantidad, grupo: "Sin código", telefono: "" }));
      const lista = gs.concat(extra).map(g => Object.assign({}, g, { respuesta: resp[g.codigo] || null, checkin: LS.get("chk:" + evento, {})[g.codigo] || null }));
      return { ok: true, lista, mensajes: LS.get("msgs:" + evento, []).concat((this._ev && this._ev.demo_mensajes) || []) };
    },
    async addGuests({ evento, invitados }) { const cur = LS.get("guests:" + evento, []); JSON.parse(invitados).forEach(g => { if (!cur.find(x => x.codigo === g.codigo)) cur.push(g); }); LS.set("guests:" + evento, cur); return { ok: true, total: cur.length }; },
    async checkin({ evento, codigo, personas }) {
      const g = this.guests(evento).find(x => x.codigo === codigo); if (!g) throw new Error("Código no encontrado");
      const chk = LS.get("chk:" + evento, {}); const prev = chk[codigo];
      const r = this.resp(evento)[codigo];
      if (!prev) { chk[codigo] = { fecha: new Date().toISOString(), personas: +personas || (r && r.asiste === "si" ? +r.cantidad : +g.cupos) }; LS.set("chk:" + evento, chk); }
      return { ok: true, guest: g, yaIngreso: !!prev, checkin: chk[codigo], respuesta: r || null };
    },
    async pedido(d) { const p = LS.get("pedidos", []); const id = "P-" + code(5); p.push(Object.assign({ id }, d)); LS.set("pedidos", p); return { ok: true, id }; }
  };

  // Los eventos marcados "demo": true siempre usan el modo local, aunque haya Apps Script configurado.
  const api = {
    demo,
    setEvent(ev) { local._ev = ev; if (ev && ev.demo) api.demo = true; },
    call(action, data) { return api.demo ? local[action](data || {}) : remote(action, data); }
  };

  // ---------- Calendario ----------
  function icsDate(d) { return new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
  function ics(ev, url) {
    const ini = ev.fecha, fin = ev.fin || new Date(new Date(ev.fecha).getTime() + 6 * 3600e3).toISOString();
    const lugar = (ev.lugares && ev.lugares[0]) ? ev.lugares[0].nombre + ", " + (ev.lugares[0].direccion || "") : "";
    const e = (s) => String(s || "").replace(/[,;\\]/g, m => "\\" + m).replace(/\n/g, "\\n");
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//InvitaPro//ES", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      "UID:" + ev.slug + "@invitapro", "DTSTAMP:" + icsDate(new Date()), "DTSTART:" + icsDate(ini), "DTEND:" + icsDate(fin),
      "SUMMARY:" + e(ev.titulo || ev.festejados.nombres), "LOCATION:" + e(lugar), "DESCRIPTION:" + e((ev.frase || "") + "\n" + (url || "")),
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:Recordatorio", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  }
  function gcal(ev, url) {
    const fin = ev.fin || new Date(new Date(ev.fecha).getTime() + 6 * 3600e3).toISOString();
    const lugar = (ev.lugares && ev.lugares[0]) ? ev.lugares[0].nombre + ", " + (ev.lugares[0].direccion || "") : "";
    return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(ev.titulo || ev.festejados.nombres) +
      "&dates=" + icsDate(ev.fecha) + "/" + icsDate(fin) + "&ctz=" + TZ + "&location=" + encodeURIComponent(lugar) + "&details=" + encodeURIComponent((ev.frase || "") + "\n" + (url || ""));
  }

  window.IP = { CFG, TZ, qs, $, $$, esc, fold, slugify, gs, telPY, wa, code, token, fmtFecha, fmtHora, cap, base, toast, copy, download, csv, qrSvg,
    PLANES, FUNCIONES, feats, loadEvent, api, LS, ics, gcal };
})();
