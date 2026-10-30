/* InvitaPro · 7 pantallas de apertura. El toque del invitado habilita la música. */
(function () {
  const { esc } = window.IP;

  function markup(type, ev, guestName) {
    const n = esc(ev.festejados.nombres), ini = esc(ev.festejados.iniciales || ev.festejados.nombres.replace(/[^A-ZÁÉÍÓÚÑ&]/g, "").slice(0, 3));
    const sub = guestName ? "Para " + esc(guestName) : "Tenés una invitación";
    const tipo = esc((window.IPThemes.TIPOS[ev.tipo] || "").toUpperCase());
    const emb = window.IPOrn.emblem(document.documentElement.dataset.motivo);
    const tap = `<div class="tap">Tocá para abrir</div>`;
    const media = ev.portada && (ev.portada.video || ev.portada.imagen);
    switch (type) {
      case "telon": return `<div class="curtain l"></div><div class="curtain r"></div><div class="valance"></div>
        <div class="center"><div class="op-sub">${sub}</div><div class="op-name">${n}</div><div class="op-sub">${tipo}</div></div>${tap}`;
      case "tarjeta": return `<div class="card3d"><div class="face inside"><div><div class="op-sub">${tipo}</div><div class="op-name">${n}</div></div></div>
        <div class="face front"><div><div class="emb">${emb}</div><div class="op-sub" style="color:inherit;opacity:.85">${sub}</div></div></div></div>${tap}`;
      case "libro": return `<div class="book"><div class="page"><div><div class="op-sub">${tipo}</div><div class="op-name">${n}</div><div class="op-sub">${sub}</div></div></div>
        <div class="cover"><span class="frame"></span><div><div class="op-name" style="font-size:2.6em">${ini}</div><div class="op-sub" style="color:inherit;opacity:.8">${tipo}</div></div></div></div>${tap}`;
      case "puertas": return `<div class="door l"><span class="emb-half">${emb}</span><span class="knob"></span></div><div class="door r"><span class="emb-half">${emb}</span><span class="knob"></span></div>
        <div class="center">${ini}</div>${tap}`;
      case "monograma": return `<div class="mono-ring">${emb}<div class="ini">${ini}</div></div><div class="ripple"></div>
        <div style="position:absolute;bottom:22%;text-align:center;left:0;right:0"><div class="op-sub">${sub}</div></div>${tap}`;
      case "media": return `<div class="bgm">${ev.portada && ev.portada.video ? `<video src="${esc(ev.portada.video)}" muted playsinline autoplay loop poster="${esc(ev.portada.imagen || "")}"></video>` : media ? `<img src="${esc(ev.portada.imagen)}" alt="">` : ""}</div>
        <div class="center"><div class="op-sub">${sub}</div><div class="op-name">${n}</div><div class="op-sub">${tipo}</div><div class="ring" aria-hidden="true">▶</div></div>${tap}`;
      default: return `<div class="env"><div class="back"></div><div class="letter-in"><div><div class="op-sub">${tipo}</div><div class="op-name" style="font-size:clamp(28px,8vw,42px)">${n}</div></div></div>
        <div class="front"></div><div class="flap"></div><div class="seal">${ini}</div></div>
        <div style="position:absolute;top:16%;left:0;right:0;text-align:center"><div class="op-sub">${sub}</div></div>${tap}`;
    }
  }

  // Muestra la apertura y resuelve cuando el invitado la toca.
  function show(type, ev, guestName) {
    return new Promise((resolve) => {
      type = window.IPThemes.APERTURAS[type] ? type : "sobre";
      const el = document.createElement("div");
      el.className = "opening op-" + type; el.setAttribute("role", "button"); el.setAttribute("tabindex", "0");
      el.setAttribute("aria-label", "Abrir invitación"); el.innerHTML = markup(type, ev, guestName);
      document.body.appendChild(el); document.body.classList.add("locked"); el.focus({ preventScroll: true });
      let used = false;
      const go = (e) => {
        if (used) return; if (e.type === "keydown" && !["Enter", " "].includes(e.key)) return; e.preventDefault(); used = true;
        el.classList.add("opened"); resolve("tap");
        setTimeout(() => { el.classList.add("fade"); document.body.classList.remove("locked"); }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900);
        setTimeout(() => el.remove(), 2800);
      };
      el.addEventListener("click", go); el.addEventListener("keydown", go);
    });
  }

  window.IPOpen = { show };
})();
