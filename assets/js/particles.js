/* InvitaPro · Partículas livianas en canvas (pausa fuera de pantalla y respeta prefers-reduced-motion). */
(function () {
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const R = (a, b) => a + Math.random() * (b - a);

  const TYPES = {
    petalos:  { n: 22, make: (w, h) => ({ x: R(0, w), y: R(-h, 0), s: R(6, 12), vy: R(.35, .9), vx: R(-.3, .3), r: R(0, 6.28), vr: R(-.02, .02), sw: R(0, 6.28) }),
      draw(c, p, col) { c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = col.accent; c.globalAlpha = .55;
        c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(p.s, -p.s, p.s * 1.6, p.s * .6, 0, p.s * 1.2); c.bezierCurveTo(-p.s * .6, p.s * .6, -p.s * .4, -p.s * .2, 0, 0); c.fill(); c.restore(); } },
    hojas:    { n: 16, make: (w, h) => ({ x: R(0, w), y: R(-h, 0), s: R(7, 13), vy: R(.3, .7), vx: R(-.2, .3), r: R(0, 6.28), vr: R(-.015, .015), sw: R(0, 6.28) }),
      draw(c, p, col) { c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = col.primary; c.globalAlpha = .35;
        c.beginPath(); c.ellipse(0, 0, p.s * .4, p.s, 0, 0, 6.28); c.fill(); c.strokeStyle = col.bg; c.globalAlpha = .4; c.beginPath(); c.moveTo(0, -p.s); c.lineTo(0, p.s); c.stroke(); c.restore(); } },
    brillos:  { n: 38, make: (w, h) => ({ x: R(0, w), y: R(0, h), s: R(1, 3.2), t: R(0, 6.28), vt: R(.02, .06), vy: R(-.15, -.03), vx: 0 }),
      draw(c, p, col) { const a = (Math.sin(p.t) + 1) / 2; c.save(); c.globalAlpha = a * .9; c.fillStyle = col.accent; c.translate(p.x, p.y);
        const s = p.s * (1 + a); c.beginPath(); c.moveTo(0, -s * 2); c.lineTo(s * .4, -s * .4); c.lineTo(s * 2, 0); c.lineTo(s * .4, s * .4); c.lineTo(0, s * 2); c.lineTo(-s * .4, s * .4); c.lineTo(-s * 2, 0); c.lineTo(-s * .4, -s * .4); c.fill(); c.restore(); } },
    confeti:  { n: 40, make: (w, h) => ({ x: R(0, w), y: R(-h, 0), s: R(4, 8), vy: R(.8, 1.6), vx: R(-.4, .4), r: R(0, 6.28), vr: R(-.08, .08), k: (Math.random() * 3) | 0, sw: R(0, 6.28) }),
      draw(c, p, col) { c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.globalAlpha = .75; c.fillStyle = [col.primary, col.accent, col.text][p.k];
        c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2 * Math.abs(Math.cos(p.r * 2)) + 1); c.restore(); } },
    globos:   { n: 9, make: (w, h) => ({ x: R(0, w), y: R(h, h * 2), s: R(14, 24), vy: R(-.9, -.4), vx: 0, sw: R(0, 6.28), k: (Math.random() * 2) | 0 }),
      draw(c, p, col) { c.save(); c.translate(p.x + Math.sin(p.sw) * 6, p.y); c.globalAlpha = .5; c.fillStyle = p.k ? col.primary : col.accent;
        c.beginPath(); c.ellipse(0, 0, p.s * .82, p.s, 0, 0, 6.28); c.fill(); c.globalAlpha = .35; c.strokeStyle = col.text; c.beginPath(); c.moveTo(0, p.s); c.quadraticCurveTo(6, p.s * 1.8, 0, p.s * 2.6); c.stroke();
        c.globalAlpha = .4; c.fillStyle = "#fff"; c.beginPath(); c.ellipse(-p.s * .3, -p.s * .35, p.s * .15, p.s * .25, -.5, 0, 6.28); c.fill(); c.restore(); } },
    burbujas: { n: 18, make: (w, h) => ({ x: R(0, w), y: R(h, h * 2), s: R(4, 14), vy: R(-.6, -.2), vx: 0, sw: R(0, 6.28) }),
      draw(c, p, col) { c.save(); c.globalAlpha = .45; c.strokeStyle = col.primary; c.lineWidth = 1.2; c.beginPath(); c.arc(p.x + Math.sin(p.sw) * 8, p.y, p.s, 0, 6.28); c.stroke();
        c.globalAlpha = .5; c.fillStyle = "#fff"; c.beginPath(); c.arc(p.x + Math.sin(p.sw) * 8 - p.s * .35, p.y - p.s * .35, p.s * .2, 0, 6.28); c.fill(); c.restore(); } },
    nieve:    { n: 50, make: (w, h) => ({ x: R(0, w), y: R(-h, 0), s: R(1.2, 3.6), vy: R(.3, 1), vx: R(-.2, .2), sw: R(0, 6.28) }),
      draw(c, p, col) { c.globalAlpha = .75; c.fillStyle = col.dark ? "#ffffff" : col.accent; c.beginPath(); c.arc(p.x + Math.sin(p.sw) * 4, p.y, p.s, 0, 6.28); c.fill(); } },
    neon:     { n: 26, make: (w, h) => ({ x: R(0, w), y: R(0, h), s: R(1.5, 3.5), t: R(0, 6.28), vt: R(.02, .05), vy: R(-.3, -.08), vx: R(-.1, .1), k: Math.random() < .5 }),
      draw(c, p, col) { const a = (Math.sin(p.t) + 1) / 2; c.save(); c.globalAlpha = .4 + a * .6; c.shadowBlur = 14; const k = p.k ? col.primary : col.accent;
        c.shadowColor = k; c.fillStyle = k; c.beginPath(); c.arc(p.x, p.y, p.s, 0, 6.28); c.fill(); c.restore(); } },
    polvo:    { n: 28, make: (w, h) => ({ x: R(0, w), y: R(0, h), s: R(.6, 1.6), vy: R(-.12, -.03), vx: R(-.05, .05), t: R(0, 6.28), vt: .01 }),
      draw(c, p, col) { c.globalAlpha = .25 + .2 * Math.sin(p.t); c.fillStyle = col.muted; c.beginPath(); c.arc(p.x, p.y, p.s, 0, 6.28); c.fill(); } }
  };

  // Crea un efecto dentro de un canvas. Devuelve { stop, burst }.
  function start(canvas, type, colors) {
    const T = TYPES[type]; if (!T || !canvas) return { stop() {}, burst() {} };
    const c = canvas.getContext("2d"); let w, h, dpr, parts = [], raf = 0, visible = true, running = true;
    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2); w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const count = Math.round(T.n * Math.min(1, (w * h) / (390 * 800)) + T.n * .3);
    for (let i = 0; i < count; i++) { const p = T.make(w, h); if (type !== "globos" && type !== "burbujas") p.y = R(0, h); parts.push(p); }
    if (reduce()) { c.clearRect(0, 0, w, h); parts.forEach(p => T.draw(c, p, colors)); c.globalAlpha = 1; return { stop() {}, burst() {} }; }
    function step() {
      raf = 0; if (!running || !visible || document.hidden) return;
      c.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y += p.vy; p.x += (p.vx || 0); if (p.vr) p.r += p.vr; if (p.vt) p.t += p.vt; if (p.sw !== undefined) { p.sw += .02; p.x += Math.sin(p.sw) * .25; }
        if (p.y > h + 30 || p.y < -60 || p.x < -40 || p.x > w + 40) {
          Object.assign(p, T.make(w, h));
          if (p.vy > 0) p.y = -20; else if (p.vy < 0 && (type === "globos" || type === "burbujas")) p.y = h + 30; else { p.y = R(0, h); }
          if (p.burst) parts.splice(parts.indexOf(p), 1);
        }
        T.draw(c, p, colors);
      }
      c.globalAlpha = 1; raf = requestAnimationFrame(step);
    }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(step); });
    io.observe(canvas);
    addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", () => { if (!document.hidden && !raf) raf = requestAnimationFrame(step); });
    raf = requestAnimationFrame(step);
    return {
      stop() { running = false; cancelAnimationFrame(raf); io.disconnect(); c.clearRect(0, 0, w, h); },
      burst(n) { const B = TYPES.confeti; for (let i = 0; i < (n || 60); i++) { const p = B.make(w, h); p.y = R(-40, h * .3); p.burst = true; parts.push(Object.assign(p, { vy: R(1, 2.4) })); } }
    };
  }

  // Lluvia de confeti a pantalla completa (celebración tras confirmar)
  function celebrate(colors) {
    if (reduce()) return;
    const cv = document.createElement("canvas"); cv.className = "fx-celebrate"; cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv); const fx = start(cv, "confeti", colors); fx.burst(90);
    setTimeout(() => { fx.stop(); cv.remove(); }, 4200);
  }

  window.IPFx = { start, celebrate, TYPES: Object.keys(TYPES) };
})();
