/* InvitaPro · Check-in en la puerta (checkin.html?e=<slug>&k=<token>) */
(function () {
  const { $, esc, qs, api, toast, feats, fold } = window.IP;
  const slug = qs.get("e"), k = qs.get("k") || "";
  let ev, lista = [], stream = null, detector = null, busy = false, last = "", lastAt = 0, canvas, ctx;

  async function init() {
    try {
      ev = await IP.loadEvent(slug); api.setEvent(ev);
      if (!feats(ev).has("checkin")) throw new Error("El check-in con QR está incluido en el plan VIP.");
      $("#title").textContent = ev.festejados.nombres;
      await loadList(); setInterval(loadList, 45000);
    } catch (e) { $("#app").innerHTML = `<div class="gate"><div><h1>Check-in</h1><p class="muted">${esc(e.message)}</p></div></div>`; return; }
    $("#startBtn").onclick = startCam;
    $("#q").oninput = search;
  }

  async function loadList() {
    try { const r = await api.call("stats", { evento: slug, k }); lista = r.lista || []; counter(); search(); } catch (e) { toast(e.message); }
  }
  function counter() {
    const inn = lista.filter(g => g.checkin), p = inn.reduce((a, g) => a + (+g.checkin.personas || 0), 0);
    const exp = lista.reduce((a, g) => a + (g.respuesta && g.respuesta.asiste === "si" ? +g.respuesta.cantidad || 0 : 0), 0);
    $("#cnt").textContent = `${p} / ${exp} personas`;
  }

  async function startCam() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      const v = $("#video"); v.srcObject = stream; await v.play();
      $(".start").hidden = true; $(".scan").hidden = false;
      if ("BarcodeDetector" in window) { try { const f = await BarcodeDetector.getSupportedFormats(); if (f.includes("qr_code")) detector = new BarcodeDetector({ formats: ["qr_code"] }); } catch (e) {} }
      if (!detector) await loadJsQR();
      loop();
    } catch (e) { toast("No se pudo abrir la cámara. Usá la búsqueda manual.", 4000); }
  }
  function loadJsQR() { return new Promise((res, rej) => { if (window.jsQR) return res(); const s = document.createElement("script"); s.src = "vendor/jsQR.min.js"; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }

  async function loop() {
    const v = $("#video");
    if (!stream) return;
    if (v.readyState >= 2 && !busy) {
      let text = null;
      try {
        if (detector) { const c = await detector.detect(v); if (c[0]) text = c[0].rawValue; }
        else {
          if (!canvas) { canvas = document.createElement("canvas"); ctx = canvas.getContext("2d", { willReadFrequently: true }); }
          const s = 480, w = v.videoWidth, h = v.videoHeight, m = Math.min(w, h); canvas.width = canvas.height = s;
          ctx.drawImage(v, (w - m) / 2, (h - m) / 2, m, m, 0, 0, s, s);
          const r = window.jsQR(ctx.getImageData(0, 0, s, s).data, s, s, { inversionAttempts: "dontInvert" }); if (r) text = r.data;
        }
      } catch (e) {}
      if (text && !(text === last && Date.now() - lastAt < 4000)) { last = text; lastAt = Date.now(); handle(text); }
    }
    setTimeout(() => requestAnimationFrame(loop), 180);
  }

  function parse(text) {
    const m = String(text).match(/^IP\|([^|]+)\|(.+)$/); if (m) return { slug: m[1], codigo: m[2] };
    try { const u = new URL(text); return { slug: u.searchParams.get("e"), codigo: u.searchParams.get("g") }; } catch (e) {}
    return { slug, codigo: String(text).trim() };
  }

  async function handle(text) {
    const p = parse(text);
    if (p.slug && p.slug !== slug) return show("err", "QR de otro evento", "Este código no pertenece a esta fiesta.");
    await mark(p.codigo);
  }

  async function mark(codigo) {
    if (busy) return; busy = true;
    try {
      const r = await api.call("checkin", { evento: slug, k, codigo });
      const g = r.guest, rs = r.respuesta, conf = rs && rs.asiste === "si" ? +rs.cantidad : null;
      const meta = [g.grupo && esc(g.grupo), `${conf != null ? conf : g.cupos} ${(conf != null ? conf : +g.cupos) === 1 ? "persona" : "personas"}`, ev.mesas && g.mesa && "Mesa " + esc(g.mesa), !rs ? "Sin confirmar" : rs.asiste === "no" ? "Había dicho que no" : ""].filter(Boolean);
      if (r.yaIngreso) { show("warn", g.nombre, "Ya ingresó a las " + new Date(r.checkin.fecha).toLocaleTimeString("es-PY", { timeZone: IP.TZ, hour: "2-digit", minute: "2-digit", hour12: false }), meta); buzz([80, 60, 80]); }
      else { show("ok", g.nombre, "¡Bienvenidos!", meta); buzz(120); }
      const L = lista.find(x => String(x.codigo) === String(g.codigo)); if (L) L.checkin = r.checkin; counter(); search();
    } catch (e) { show("err", "No encontrado", esc(e.message)); buzz([200, 80, 200]); }
    finally { setTimeout(() => busy = false, 1200); }
  }

  function show(kind, title, sub, meta) {
    $("#result").innerHTML = `<div class="result ${kind}"><div style="font-size:2em">${kind === "ok" ? "✓" : kind === "warn" ? "!" : "×"}</div><h2>${esc(title)}</h2><p style="margin:0">${sub}</p>${meta && meta.length ? `<div class="meta">${meta.map(m => `<span>${m}</span>`).join("")}</div>` : ""}</div>`;
  }
  function buzz(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} }

  function search() {
    const q = fold(($("#q").value || "").trim()), box = $("#list");
    if (!q) { box.innerHTML = `<p class="counter">Escribí al menos 2 letras para buscar.</p>`; return; }
    if (q.length < 2) return;
    const R = lista.filter(g => fold(g.nombre).includes(q) || fold(g.codigo) === q).slice(0, 12);
    box.innerHTML = R.map(g => `<button type="button" data-c="${esc(g.codigo)}"><span><b>${esc(g.nombre)}</b><br><small class="muted">${esc(g.grupo || "")} · ${esc(g.cupos)} cupos</small></span>
      <span class="pill ${g.checkin ? "in" : g.respuesta && g.respuesta.asiste === "si" ? "si" : "pend"}">${g.checkin ? "Ingresó" : "Marcar ingreso"}</span></button>`).join("") || `<p class="counter">Sin resultados.</p>`;
    box.querySelectorAll("button").forEach(b => b.onclick = () => mark(b.dataset.c));
  }

  init();
})();
