/* InvitaPro · Panel del anfitrión (panel.html?e=<slug>&k=<token>) */
(function () {
  const { $, $$, esc, qs, api, wa, fmtFecha, csv, download, toast, base, feats, fold } = window.IP;
  const slug = qs.get("e"), k = qs.get("k") || "";
  let ev, data = { lista: [], mensajes: [] }, filtro = { estado: "", grupo: "", q: "" };

  const estado = (g) => g.checkin ? "in" : !g.respuesta ? "pend" : g.respuesta.asiste === "no" ? "no" : "si";
  const ESTADO = { si: "Confirmado", no: "No asiste", pend: "Pendiente", in: "Ingresó" };

  async function init() {
    try {
      ev = await IP.loadEvent(slug); api.setEvent(ev);
      if (!feats(ev).has("panel")) throw new Error("El panel del anfitrión está incluido en el plan VIP.");
      if (!k && !api.demo) throw new Error("Falta el token de acceso en el link.");
      await refresh(); setInterval(refresh, 30000);
      document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
    } catch (e) { $("#app").innerHTML = `<div class="gate"><div><h1>Panel</h1><p class="muted">${esc(e.message)}</p></div></div>`; }
  }

  async function refresh() {
    try { data = await api.call("stats", { evento: slug, k }); draw(); $("#live").textContent = "Actualizado " + new Date().toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit", hour12: false }); }
    catch (e) { toast(e.message); if (!$(".kpis b")) $("#app").innerHTML = `<div class="gate"><div><h1>Sin acceso</h1><p class="muted">${esc(e.message)}</p></div></div>`; }
  }

  function totals() {
    const L = data.lista; const t = { invitados: L.length, cupos: 0, si: 0, no: 0, pend: 0, personas: 0, ingresaron: 0, personasIn: 0 };
    L.forEach(g => {
      t.cupos += +g.cupos || 0; const r = g.respuesta;
      if (!r) t.pend++; else if (r.asiste === "no") t.no++; else { t.si++; t.personas += +r.cantidad || 0; }
      if (g.checkin) { t.ingresaron++; t.personasIn += +g.checkin.personas || 0; }
    });
    return t;
  }

  function donut(t) {
    const parts = [["si", t.si, "#2f8f5b"], ["no", t.no, "#c0533e"], ["pend", t.pend, "#d4a72c"]], tot = Math.max(1, t.si + t.no + t.pend);
    let a = 0; const R = 54, C = 2 * Math.PI * R;
    const segs = parts.map(([kk, v, col]) => { const len = v / tot * C; const s = `<circle r="${R}" cx="70" cy="70" fill="none" stroke="${col}" stroke-width="20" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-a}" transform="rotate(-90 70 70)"><title>${ESTADO[kk]}: ${v}</title></circle>`; a += len; return s; }).join("");
    const pct = Math.round((t.si + t.no) / tot * 100);
    return `<div class="donut"><svg viewBox="0 0 140 140" role="img" aria-label="Respondieron ${pct}%"><circle r="${R}" cx="70" cy="70" fill="none" stroke="var(--bg2)" stroke-width="20"/>${segs}
      <text x="70" y="68" text-anchor="middle" font-size="26" font-weight="700" fill="currentColor">${pct}%</text><text x="70" y="88" text-anchor="middle" font-size="11" fill="currentColor" opacity=".6">respondieron</text></svg>
      <div class="legend"><div><i style="background:#2f8f5b"></i>Confirmados: <b>${t.si}</b></div><div><i style="background:#c0533e"></i>No asisten: <b>${t.no}</b></div><div><i style="background:#d4a72c"></i>Pendientes: <b>${t.pend}</b></div></div></div>`;
  }

  function diet() {
    const c = {}; data.lista.forEach(g => { const r = g.respuesta; if (r && r.asiste === "si" && r.restricciones) String(r.restricciones).split(",").map(s => s.trim()).filter(Boolean).forEach(s => c[s] = (c[s] || 0) + 1); });
    const e = Object.entries(c).sort((a, b) => b[1] - a[1]), max = Math.max(1, ...e.map(x => x[1]));
    return e.length ? `<div class="bars">${e.map(([n, v]) => `<div class="b"><span>${esc(n)}</span><b>${v}</b><i style="--w:${v / max * 100}%"></i></div>`).join("")}</div>` : `<p class="empty">Sin restricciones informadas.</p>`;
  }

  function rows() {
    const q = fold(filtro.q);
    return data.lista.filter(g => (!filtro.estado || estado(g) === filtro.estado) && (!filtro.grupo || g.grupo === filtro.grupo) && (!q || fold(g.nombre).includes(q)));
  }

  function table() {
    const R = rows();
    return R.length ? `<div class="scroll-x"><table class="table"><thead><tr><th>Invitado</th><th>Grupo</th><th>Estado</th><th>Personas</th><th>Detalle</th></tr></thead><tbody>
      ${R.map(g => { const r = g.respuesta || {}, s = estado(g); return `<tr><td><b>${esc(g.nombre)}</b>${g.telefono ? `<br><small class="muted">${esc(g.telefono)}</small>` : ""}</td><td>${esc(g.grupo || "—")}${ev.mesas && g.mesa ? `<br><small class="muted">Mesa ${esc(g.mesa)}</small>` : ""}</td>
        <td><span class="pill ${s}">${ESTADO[s]}</span></td><td>${r.asiste === "si" ? `${esc(r.cantidad)} / ${esc(g.cupos)}` : `— / ${esc(g.cupos)}`}</td>
        <td><small>${[r.acompanantes && "👥 " + esc(r.acompanantes), r.restricciones && "🍽 " + esc(r.restricciones), r.cancion && "🎵 " + esc(r.cancion)].filter(Boolean).join("<br>") || "—"}</small></td></tr>`; }).join("")}
      </tbody></table></div>` : `<p class="empty">No hay invitados con ese filtro.</p>`;
  }

  function draw() {
    const t = totals(), grupos = [...new Set(data.lista.map(g => g.grupo).filter(Boolean))].sort();
    const songs = data.lista.filter(g => g.respuesta && g.respuesta.cancion).map(g => ({ n: g.nombre, c: g.respuesta.cancion }));
    const keep = document.activeElement && document.activeElement.id;
    $("#app").innerHTML = `
      <p class="eyebrow" style="margin:6px 0 0">Panel del anfitrión</p>
      <h1>${esc(ev.festejados.nombres)}</h1>
      <p class="muted" style="text-transform:capitalize">${esc(fmtFecha(ev.fecha))}</p>
      ${api.demo ? `<p class="notice">Modo demo: estás viendo invitados de prueba y las respuestas guardadas en este navegador.</p>` : ""}
      <div class="kpis">
        <div class="kpi ok"><span>Confirmados</span><b>${t.si}</b></div>
        <div class="kpi no"><span>No asisten</span><b>${t.no}</b></div>
        <div class="kpi pend"><span>Pendientes</span><b>${t.pend}</b></div>
        <div class="kpi"><span>Personas</span><b>${t.personas}<small style="font-size:.4em;color:var(--muted)"> / ${t.cupos}</small></b></div>
        <div class="kpi"><span>Ingresaron</span><b>${t.personasIn}</b></div>
      </div>
      <div class="row" style="margin-bottom:14px">
        ${feats(ev).has("recordatorios") ? `<button class="btn sm wa" type="button" data-remind>Recordar a pendientes (${t.pend})</button>` : ""}
        <button class="btn sm ghost" type="button" data-csv>Exportar CSV</button>
        ${feats(ev).has("checkin") ? `<a class="btn sm ghost" href="checkin.html?e=${encodeURIComponent(slug)}&k=${encodeURIComponent(k)}">Abrir check-in</a>` : ""}
        <a class="btn sm ghost" href="invitacion.html?e=${encodeURIComponent(slug)}" target="_blank" rel="noopener">Ver invitación</a>
      </div>
      <div class="grid2">
        <section class="panel-card"><h2>Invitados</h2>
          <div class="filters">
            <input id="fq" type="search" placeholder="Buscar por nombre" value="${esc(filtro.q)}" aria-label="Buscar invitado">
            <select id="fe" aria-label="Filtrar por estado"><option value="">Todos los estados</option>${Object.entries(ESTADO).map(([kk, v]) => `<option value="${kk}" ${filtro.estado === kk ? "selected" : ""}>${v}</option>`).join("")}</select>
            <select id="fg" aria-label="Filtrar por grupo"><option value="">Todos los grupos</option>${grupos.map(g => `<option ${filtro.grupo === g ? "selected" : ""}>${esc(g)}</option>`).join("")}</select>
          </div><div id="tbl">${table()}</div></section>
        <div style="display:grid;gap:14px;align-content:start">
          <section class="panel-card"><h2>Respuestas</h2>${donut(t)}</section>
          <section class="panel-card"><h2>Restricciones alimentarias</h2>${diet()}</section>
          <section class="panel-card"><h2>Mensajes (${data.mensajes.length})</h2><div class="list-msg">${data.mensajes.map(m => `<div><p style="margin:0 0 4px">${esc(m.mensaje)}</p><small>— ${esc(m.nombre)}${String(m.aprobado).toUpperCase() === "NO" ? " · oculto" : ""}</small></div>`).join("") || `<p class="empty">Todavía no hay mensajes.</p>`}</div></section>
          <section class="panel-card"><h2>Canciones sugeridas (${songs.length})</h2><div class="list-msg">${songs.map(s => `<div>🎵 <b>${esc(s.c)}</b><br><small>${esc(s.n)}</small></div>`).join("") || `<p class="empty">Todavía no hay canciones.</p>`}</div></section>
        </div>
      </div>`;
    $("#app").removeAttribute("aria-busy");
    const upd = () => { $("#tbl").innerHTML = table(); };
    $("#fq").oninput = (e) => { filtro.q = e.target.value; upd(); };
    $("#fe").onchange = (e) => { filtro.estado = e.target.value; upd(); };
    $("#fg").onchange = (e) => { filtro.grupo = e.target.value; upd(); };
    if (keep === "fq") { const i = $("#fq"); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
    $("[data-csv]").onclick = exportCsv;
    const rb = $("[data-remind]"); if (rb) rb.onclick = remind;
  }

  function exportCsv() {
    const rowsOut = [["Nombre", "Teléfono", "Grupo", "Mesa", "Cupos", "Estado", "Personas", "Acompañantes", "Restricciones", "Canción", "Mensaje", "Ingresó"]];
    data.lista.forEach(g => { const r = g.respuesta || {}; rowsOut.push([g.nombre, g.telefono, g.grupo, g.mesa || "", g.cupos, ESTADO[estado(g)], r.cantidad || "", r.acompanantes || "", r.restricciones || "", r.cancion || "", r.mensaje || "", g.checkin ? g.checkin.fecha : ""]); });
    download(slug + "-invitados.csv", csv(rowsOut), "text/csv;charset=utf-8");
  }

  function remind() {
    const p = data.lista.filter(g => !g.respuesta && g.telefono);
    const tpl = localStorage.getItem("ip:remind:" + slug) || `Hola {nombre} 👋 Te recordamos confirmar tu asistencia a ${ev.festejados.nombres}. Es muy rápido desde tu invitación: {link} ¡Gracias!`;
    $("#dlg-t").textContent = `Recordar a pendientes (${p.length})`;
    const paint = (t) => p.map(g => { const link = base() + "invitacion.html?e=" + encodeURIComponent(slug) + "&g=" + encodeURIComponent(g.codigo); const msg = t.replace(/\{nombre\}/g, g.nombre).replace(/\{link\}/g, link);
      return `<div class="row" style="justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line)"><span><b>${esc(g.nombre)}</b><br><small class="muted">${esc(g.grupo || "")}</small></span><a class="btn sm wa" href="${esc(wa(g.telefono, msg))}" target="_blank" rel="noopener" onclick="this.classList.add('ghost');this.textContent='Enviado ✓'">WhatsApp</a></div>`; }).join("");
    $("#dlg-b").innerHTML = `<label class="field"><span>Mensaje (usá {nombre} y {link})</span><textarea id="rtpl">${esc(tpl)}</textarea></label><div id="rlist">${paint(tpl) || `<p class="empty">No hay pendientes con teléfono cargado. 🎉</p>`}</div>`;
    $("#rtpl").oninput = (e) => { localStorage.setItem("ip:remind:" + slug, e.target.value); $("#rlist").innerHTML = paint(e.target.value); };
    $("#dlg").showModal();
  }

  init();
})();
