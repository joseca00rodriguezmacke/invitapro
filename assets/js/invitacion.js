/* InvitaPro · Plantilla de invitación (invitacion.html?e=<slug>&g=<codigo>) */
(function () {
  const { $, $$, esc, qs, api, feats, fmtFecha, fmtHora, cap, wa, toast, copy, download, qrSvg, ics, gcal, LS, base } = window.IP;

  const I = {
    anillos: '<circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="M7 6l2-3h2l1 3"/>',
    iglesia: '<path d="M12 2v4M10 4h4M5 21V11l7-5 7 5v10M9 21v-5a3 3 0 016 0v5"/>',
    copa: '<path d="M8 3h8l-1 7a3 3 0 01-6 0zM12 13v7M8 21h8"/>',
    cena: '<path d="M4 3v8a2 2 0 002 2v8M8 3v8M6 3v5M16 3c-2 0-3 3-3 6s1 4 3 4v8"/>',
    musica: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    torta: '<path d="M4 21h16M5 21v-7h14v7M8 14v-3h8v3M12 11V8M12 5.5v.5"/>',
    camara: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    estrella: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
    reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    birrete: '<path d="M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5M22 9v6"/>',
    regalo: '<path d="M3 9h18v4H3zM5 13v8h14v-8M12 9v12M12 9c-2-4-6-4-6-1s6 1 6 1 6 2 6-1-4-3-6 1"/>',
    pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0114 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    auto: '<path d="M5 16h14M6 16l1.5-5h9L18 16M5 16v3M19 16v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
    wa: '<path d="M3 21l1.6-4.6A8.5 8.5 0 1112 20.5a8.6 8.6 0 01-4.3-1.1z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a4 4 0 01-2.3-2.3l.8-1-1-2z"/>',
    vol: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/>',
    mute: '<path d="M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6"/>',
    foto: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>'
  };
  const icon = (n, cls) => `<svg class="${cls || "icon"}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || I.estrella}</svg>`;

  const EYEBROW = { boda: "Nos casamos", xv: "Mis XV años", cumple: "¡Estás invitado a mi cumple!", bautismo: "Mi bautismo", comunion: "Mi primera comunión", babyshower: "Baby shower", graduacion: "Nos graduamos", corporativo: "Te invitamos", aniversario: "Celebramos nuestro aniversario" };
  const NIVEL = { basico: 1, medio: 2, completo: 3 };
  const RESTRICCIONES = ["Vegetariano", "Vegano", "Celíaco (sin TACC)", "Diabético", "Sin lactosa", "Alergias"];

  let ev, F, guest = null, resp = null, freeName = "", fx = null, theme, audio = null, lvl = 3;
  const isPreview = qs.get("preview") === "1";

  // ---------- Arranque ----------
  async function init() {
    try {
      if (isPreview) {
        addEventListener("message", async (m) => {
          if (!m.data || m.data.type !== "ip-preview") return;
          ev = m.data.ev; guest = m.data.guest || null; resp = null; freeName = "";
          const y = scrollY; render(true); if (!m.data.abrir) scrollTo(0, y);
          if (m.data.abrir) { scrollTo(0, 0); await IPOpen.show((ev.tema && ev.tema.apertura) || theme.tema.apertura, ev, guest && guest.nombre); startMusic(); revealHero(); }
        });
        parent.postMessage({ type: "ip-ready" }, "*");
        return;
      }
      ev = await IP.loadEvent(qs.get("e") || window.IP_EVENT_SLUG);
      api.setEvent(ev);
      F = feats(ev);
      const g = qs.get("g");
      if (g && F.has("personalizado")) {
        try { const r = await api.call("guest", { evento: ev.slug, codigo: g }); guest = r.guest; resp = r.respuesta; }
        catch (e) { console.warn(e.message); }
      }
      if (!guest) { const saved = LS.get("rsvp:" + ev.slug); if (saved) resp = saved; freeName = LS.get("name:" + ev.slug, ""); }
      render(false);
      const who = guest ? guest.nombre : freeName;
      const apertura = ev.tema && ev.tema.apertura;
      if (apertura !== "ninguna") {
        await IPOpen.show(apertura || theme.tema.apertura, ev, who);
        startMusic();
      }
      revealHero();
    } catch (e) {
      $("#app").innerHTML = `<div class="err"><div><h1>Ups</h1><p class="muted">${esc(e.message)}</p><a class="btn" href="./">Volver</a></div></div>`;
      console.error(e);
    }
  }

  function render(preview) {
    F = feats(ev); lvl = NIVEL[(ev.textos && ev.textos.nivel) || "completo"] || 3;
    if (fx) fx.stop();
    theme = IPThemes.aplicar(ev.tema || {});
    document.documentElement.style.setProperty("--emblem", `url("data:image/svg+xml,${encodeURIComponent(IPOrn.emblem(theme.tema.motivo).replace("currentColor", "#000").replace(/currentColor/g, "#000"))}")`);
    document.title = ev.festejados.nombres + " · " + (IPThemes.TIPOS[ev.tipo] || "Invitación");
    const app = $("#app");
    app.innerHTML = [hero(), welcome(), countdown(), story(), letter(), timeline(), places(), dress(), gallery(), people(), gifts(), rsvp(), wall(), photos(), footer()].join("");
    app.removeAttribute("aria-busy");
    dock(); music(); bind(); observe();
    if (window.IPFx && ev.tema && ev.tema.particulas !== false) fx = IPFx.start($(".hero canvas.fx"), (ev.tema && ev.tema.efecto) || theme.tema.particulas, theme.paleta);
    if (preview) { revealHero(); $$(".reveal").forEach(el => el.classList.add("in")); }
    if (api.demo && !preview && !$(".demo-badge")) document.body.insertAdjacentHTML("beforeend", `<div class="demo-badge" title="Sin Apps Script configurado: las respuestas se guardan en este navegador">Modo demo</div>`);
    loadWall();
  }

  // ---------- Secciones ----------
  const head = (eyebrow, title, sub) => `<header class="sec-head reveal"><div class="eyebrow">${esc(eyebrow)}</div><h2>${esc(title)}</h2>${IPOrn.divider(theme.tema.motivo)}${sub && lvl >= 2 ? `<p>${esc(sub)}</p>` : ""}</header>`;
  const S = (k) => (ev.textos && ev.textos.secciones && ev.textos.secciones[k]) || "";
  const past = () => Date.now() > new Date(ev.fin || new Date(new Date(ev.fecha).getTime() + 8 * 3600e3)).getTime();

  function hero() {
    const m = theme.tema.motivo, p = ev.portada || {};
    const media = p.video ? `<video src="${esc(p.video)}" autoplay muted loop playsinline poster="${esc(p.imagen || "")}"></video>` : p.imagen ? `<img src="${esc(p.imagen)}" alt="" fetchpriority="high">` : "";
    const nm = esc(ev.festejados.nombres).replace(/\s(&amp;|y)\s/, ' <span class="amp">$1</span> ');
    const d = new Date(ev.fecha);
    const dateTxt = `${cap(d.toLocaleDateString("es-PY", { timeZone: IP.TZ, weekday: "long" }))}<span class="sep"></span>${d.toLocaleDateString("es-PY", { timeZone: IP.TZ, day: "numeric", month: "long", year: "numeric" })}`;
    return `<section class="hero ${media ? "has-media" : ""}" id="inicio" aria-label="Portada">
      ${media ? `<div class="hero-media">${media}</div>` : ""}<canvas class="fx" aria-hidden="true"></canvas>
      ${["tl", "tr", "bl", "br"].map(c => IPOrn.corner(m).replace('class="orn-corner"', `class="orn-corner ${c}"`)).join("")}
      <div class="hero-inner hero-in" style="visibility:hidden">
        <div class="eyebrow">${esc((ev.textos && ev.textos.eyebrow) || EYEBROW[ev.tipo] || "")}</div>
        <h1 class="names">${nm}</h1>
        ${IPOrn.divider(m)}
        <div class="hero-date">${dateTxt}</div>
        ${ev.frase ? `<p class="hero-phrase">${esc(ev.frase)}</p>` : ""}
      </div>
      <div class="scroll-hint" aria-hidden="true"></div>
    </section>`;
  }
  function revealHero() { const h = $(".hero-in"); if (h) { h.style.visibility = ""; h.classList.remove("hero-in"); void h.offsetWidth; h.classList.add("hero-in"); } }

  function welcome() {
    const bienvenida = ev.bienvenida || "Queremos compartir este día tan especial con vos.";
    if (guest) {
      const c = +guest.cupos || 1;
      const seats = c === 1 ? "Reservamos <b>1</b> lugar para vos" : `Reservamos <b>${c}</b> lugares para ustedes`;
      const verb = c === 1 ? "te esperamos" : "los esperamos";
      return `<section class="sec" id="bienvenida"><div class="wrap"><div class="card welcome reveal">
        <div class="eyebrow">Invitación personal</div>
        <div class="who">${esc(guest.nombre)}</div>
        <p class="lead">${esc(cap(verb))}. ${esc(bienvenida)}</p>
        <div class="seats">${icon("estrella")}<span>${seats}</span></div>
      </div></div></section>`;
    }
    return `<section class="sec" id="bienvenida"><div class="wrap"><div class="card welcome reveal">
      <div class="eyebrow">Bienvenidos</div>
      ${freeName ? `<div class="who">${esc(freeName)}</div>` : ""}
      <p class="lead">${esc(bienvenida)}</p>
      ${freeName ? "" : `<form class="name-ask" data-name-form><label class="sr-only" for="fn">Tu nombre</label><input id="fn" type="text" placeholder="Escribí tu nombre" autocomplete="name" required><button class="btn">Listo</button></form>`}
    </div></div></section>`;
  }

  function countdown() {
    if (!F.has("cuenta")) return "";
    if (past()) {
      const album = ev.fotos && ev.fotos.album;
      return `<section class="sec" id="cuenta"><div class="wrap thanks reveal"><div class="big">¡Gracias!</div>
        <p class="lead">${esc((ev.textos && ev.textos.gracias) || "Gracias por ser parte de este día inolvidable.")}</p>
        ${album ? `<a class="btn" href="${esc(album)}" target="_blank" rel="noopener">${icon("foto")} Ver las fotos</a>` : ""}</div></div></section>`;
    }
    return `<section class="sec alt" id="cuenta"><div class="wrap">${head("Falta muy poco", "Cuenta regresiva", S("cuenta"))}
      <div class="countdown reveal" role="timer" aria-live="off" data-cd>
        <div><b data-u="d">00</b><span>Días</span></div><div><b data-u="h">00</b><span>Horas</span></div><div><b data-u="m">00</b><span>Min</span></div><div><b data-u="s">00</b><span>Seg</span></div>
      </div>
      <p class="cd-date reveal"><span class="cd-cap">${esc(fmtFecha(ev.fecha))}</span> · ${esc(fmtHora(ev.fecha))} h</p>
      <div class="row center reveal"><a class="btn ghost sm" href="${esc(gcal(ev, location.href))}" target="_blank" rel="noopener">${icon("cal")} Agendar</a></div>
    </div></section>`;
  }

  function story() {
    if (!F.has("historia") || lvl < 2 || !(ev.historia && ev.historia.length)) return "";
    const items = lvl === 2 ? ev.historia.slice(0, 3) : ev.historia;
    return `<section class="sec" id="historia"><div class="wrap">${head("Así empezó todo", (ev.textos && ev.textos.historiaTitulo) || "Nuestra historia", S("historia"))}
      <div class="story">${items.map(h => `<article class="reveal"><div class="yr">${esc(h.fecha)}</div><div><h3>${esc(h.titulo)}</h3><p class="muted">${esc(h.texto)}</p>${h.imagen ? `<img src="${esc(h.imagen)}" alt="${esc(h.titulo)}" loading="lazy">` : ""}</div></article>`).join("")}</div>
    </div></section>`;
  }

  function letter() {
    if (lvl < 3) return "";
    let out = "";
    if (ev.carta && ev.carta.texto) out += `<section class="sec alt" id="carta"><div class="wrap">${head("Unas palabras", ev.carta.titulo || "Para vos", "")}
      <div class="card reveal letter">${esc(ev.carta.texto)}${ev.carta.firma ? `<span class="sign">${esc(ev.carta.firma)}</span>` : ""}</div></div></section>`;
    if (ev.versiculo && ev.versiculo.texto) out += `<section class="sec" id="versiculo"><div class="wrap"><blockquote class="verse reveal">${esc(ev.versiculo.texto)}<cite>${esc(ev.versiculo.cita || "")}</cite></blockquote></div></section>`;
    if (ev.dedicatoria) out += `<section class="sec" id="dedicatoria"><div class="wrap"><p class="lead reveal">${esc(ev.dedicatoria)}</p></div></section>`;
    return out;
  }

  function timeline() {
    if (!F.has("itinerario") || !(ev.itinerario && ev.itinerario.length)) return "";
    return `<section class="sec alt" id="itinerario"><div class="wrap">${head("El gran día", "Itinerario", S("itinerario"))}
      <ol class="timeline ${ev.itinerario.length > 3 ? "zig" : ""}">${ev.itinerario.map(it => `<li class="reveal"><div class="ico">${icon(it.icono || "estrella")}</div>
        <div class="body"><time>${esc(it.hora)}</time><h3>${esc(it.titulo)}</h3>${it.descripcion ? `<p>${esc(it.descripcion)}</p>` : ""}</div></li>`).join("")}</ol>
    </div></section>`;
  }

  function places() {
    if (!F.has("mapa") || !(ev.lugares && ev.lugares.length)) return "";
    return `<section class="sec" id="lugares"><div class="wrap">${head("Dónde", ev.lugares.length > 1 ? "Los lugares" : "El lugar", S("lugares"))}
      <div class="places">${ev.lugares.map((l, i) => {
        const q = l.lat && l.lng ? `${l.lat},${l.lng}` : (l.query || `${l.nombre}, ${l.direccion || ""}`);
        const gm = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
        const wz = l.lat && l.lng ? `https://waze.com/ul?ll=${l.lat},${l.lng}&navigate=yes` : "https://waze.com/ul?q=" + encodeURIComponent(q) + "&navigate=yes";
        return `<article class="card place reveal">
          <div class="map" data-map="${esc("https://www.google.com/maps?q=" + encodeURIComponent(q) + "&z=15&output=embed")}"><button type="button" aria-label="Mostrar mapa de ${esc(l.nombre)}">${icon("pin")}&nbsp;Ver mapa</button></div>
          <div class="body"><div class="kind">${esc(l.tipo || (i ? "Recepción" : "Ceremonia"))}${l.hora ? " · " + esc(l.hora) : ""}</div>
            <h3>${esc(l.nombre)}</h3><p class="addr">${esc(l.direccion || "")}</p>
            ${l.estacionamiento ? `<div class="park">${icon("auto")}<span>${esc(l.estacionamiento)}</span></div>` : ""}
            <div class="row"><a class="btn sm" href="${esc(gm)}" target="_blank" rel="noopener">${icon("pin")} Google Maps</a><a class="btn sm ghost" href="${esc(wz)}" target="_blank" rel="noopener">Waze</a></div>
          </div></article>`;
      }).join("")}</div></div></section>`;
  }

  function dress() {
    const v = ev.vestimenta; if (!F.has("vestimenta") || !v || !v.codigo) return "";
    return `<section class="sec alt" id="vestimenta"><div class="wrap dress">${head("Dress code", "Código de vestimenta", S("vestimenta"))}
      <div class="card reveal"><div class="code">${esc(v.codigo)}</div>${v.descripcion ? `<p class="muted">${esc(v.descripcion)}</p>` : ""}
      ${v.colores && v.colores.length ? `<div class="label">Paleta sugerida</div><div class="swatches">${v.colores.map(c => `<div class="swatch"><i style="background:${esc(c.hex || c)}"></i>${esc(c.nombre || "")}</div>`).join("")}</div>` : ""}
      ${v.evitar && v.evitar.length ? `<div class="label" style="margin-top:1rem">Por favor evitá</div><div class="swatches">${v.evitar.map(c => `<div class="swatch no"><i style="background:${esc(c.hex || c)}"></i>${esc(c.nombre || "")}</div>`).join("")}</div>` : ""}
      </div></div></section>`;
  }

  function gallery() {
    if (!F.has("galeria") || !(ev.galeria && ev.galeria.length)) return "";
    return `<section class="sec" id="galeria"><div class="wrap">${head("Momentos", "Galería", S("galeria"))}
      <div class="gallery reveal">${ev.galeria.map((g, i) => `<button type="button" data-lb="${i}" aria-label="Ampliar foto ${i + 1}"><img src="${esc(g.src || g)}" alt="${esc(g.alt || "Foto " + (i + 1))}" loading="lazy" decoding="async" width="${g.w || 600}" height="${g.h || 800}" onload="this.classList.add('loaded')"></button>`).join("")}</div>
    </div></section>`;
  }

  function people() {
    if (!F.has("padrinos") || !(ev.padrinos && ev.padrinos.length)) return "";
    return `<section class="sec alt" id="padrinos"><div class="wrap">${head("Con la bendición de", (ev.textos && ev.textos.padrinosTitulo) || "Padres y padrinos", S("padrinos"))}
      <div class="people">${ev.padrinos.map(p => `<div class="reveal"><small>${esc(p.rol)}</small><b>${esc(p.nombres)}</b></div>`).join("")}</div></div></section>`;
  }

  function gifts() {
    const r = ev.regalos; if (!F.has("regalos") || !r) return "";
    const line = (k, v) => v ? `<div class="line"><div><span>${esc(k)}</span><br><b>${esc(v)}</b></div><button class="copy" type="button" data-copy="${esc(v)}">Copiar</button></div>` : "";
    return `<section class="sec" id="regalos"><div class="wrap">${head("Regalos", (r.titulo || "Mesa de regalos"), "")}
      ${r.mensaje ? `<p class="lead reveal" style="margin-bottom:1.4rem">${esc(r.mensaje)}</p>` : ""}
      <div class="gifts">${(r.cuentas || []).map(c => `<div class="card acct reveal"><div class="bank">${icon("regalo")} ${esc(c.banco)}</div>
        ${line("Titular", c.titular)}${line("Alias", c.alias)}${line("Cuenta", c.cuenta)}${line("CI / RUC", c.ci)}</div>`).join("")}
      ${r.qr ? `<div class="card reveal center"><div class="label">QR de pago</div><img class="payqr" src="${esc(r.qr)}" alt="Código QR de pago" loading="lazy"></div>` : ""}
      ${r.lista && r.lista.url ? `<a class="btn ghost block reveal" href="${esc(r.lista.url)}" target="_blank" rel="noopener">${icon("regalo")} ${esc(r.lista.texto || "Ver lista de regalos")}</a>` : ""}
      </div></div></section>`;
  }

  function maxSeats() { return guest ? Math.max(1, +guest.cupos || 1) : ((ev.rsvp && ev.rsvp.maxLibre) || 6); }

  function rsvp() {
    const lim = ev.rsvp && ev.rsvp.limite;
    const inner = resp ? ticket() : form();
    return `<section class="sec alt" id="rsvp"><div class="wrap">${head("RSVP", "Confirmá tu asistencia", S("rsvp"))}
      ${lim && !resp ? `<p class="deadline reveal">Por favor confirmá antes del <b>${esc(fmtFecha(lim + "T12:00:00-03:00", { weekday: undefined }))}</b></p>` : ""}
      <div id="rsvp-box">${inner}</div></div></section>`;
  }

  function form() {
    const max = maxSeats(), def = resp ? +resp.cantidad || max : max, prev = resp || {};
    const name = guest ? guest.nombre : (prev.nombre || freeName);
    return `<form class="rsvp-form reveal" data-rsvp novalidate><div class="card">
      ${guest ? `<p class="center" style="margin-bottom:1rem"><b>${esc(guest.nombre)}</b></p>` : `<label class="field"><span>Nombre y apellido</span><input name="nombre" type="text" required autocomplete="name" value="${esc(name)}"></label>`}
      <fieldset class="field" style="border:0;padding:0;margin:0 0 1rem"><legend class="label" style="margin-bottom:.4em">¿Vas a asistir?</legend>
        <div class="choice"><label><input type="radio" name="asiste" value="si" ${prev.asiste !== "no" ? "checked" : ""}>¡Sí, voy!</label><label><input type="radio" name="asiste" value="no" ${prev.asiste === "no" ? "checked" : ""}>No podré</label></div></fieldset>
      <div data-yes>
        ${max > 1 ? `<div class="field"><span>¿Cuántas personas? ${guest ? `<small class="muted">(máximo ${max})</small>` : ""}</span>
          <div class="stepper"><button type="button" data-step="-1" aria-label="Menos">−</button><output name="cantidadOut" aria-live="polite">${def}</output><button type="button" data-step="1" aria-label="Más">+</button></div>
          <input type="hidden" name="cantidad" value="${def}"></div>` : `<input type="hidden" name="cantidad" value="1">`}
        ${F.has("acompanantes") && max > 1 ? `<div class="field"><span>Nombres de quienes vienen</span><div class="companions" data-comp></div></div>` : ""}
        ${F.has("restricciones") ? `<fieldset class="field" style="border:0;padding:0;margin:0 0 1rem"><legend class="label" style="margin-bottom:.4em">Restricciones alimentarias</legend>
          <div class="row">${RESTRICCIONES.map(r => `<label class="chip" style="cursor:pointer"><input type="checkbox" name="restr" value="${esc(r)}" ${(prev.restricciones || "").includes(r) ? "checked" : ""}> ${esc(r)}</label>`).join("")}</div>
          <input type="text" name="restrOtro" placeholder="Detalle (opcional)" style="margin-top:.6rem" value=""></fieldset>` : ""}
        ${F.has("canciones") ? `<label class="field"><span>Una canción que no puede faltar 🎶</span><input name="cancion" type="text" placeholder="Artista – canción" value="${esc(prev.cancion || "")}"></label>` : ""}
      </div>
      <label class="field"><span>${F.has("mensajes") ? "Un mensaje para " + esc(ev.festejados.nombres) : "Mensaje (opcional)"}</span><textarea name="mensaje" maxlength="500" placeholder="Escribí algo lindo…">${esc(prev.mensaje || "")}</textarea></label>
      <label class="hp" aria-hidden="true">No completar<input name="website" tabindex="-1" autocomplete="off"></label>
      <button class="btn block" type="submit">${icon("check")} Enviar confirmación</button>
      ${resp ? `<button class="btn ghost block" type="button" data-cancel style="margin-top:.6rem">Cancelar cambios</button>` : ""}
      <p class="form-note">${F.has("rsvpPlanilla") ? "Tu respuesta llega directo a los anfitriones." : "Se abrirá WhatsApp con tu confirmación lista para enviar."}</p>
    </div></form>`;
  }

  function waText(r) {
    const n = r.nombre || (guest && guest.nombre) || "";
    let t = r.asiste === "si" ? `¡Hola! Soy ${n} y confirmo mi asistencia a ${ev.festejados.nombres} 🎉\nPersonas: ${r.cantidad}` : `¡Hola! Soy ${n}. Lamentablemente no podré asistir a ${ev.festejados.nombres}. ¡Les deseo lo mejor!`;
    if (r.acompanantes) t += `\nAcompañantes: ${r.acompanantes}`;
    if (r.restricciones) t += `\nRestricciones: ${r.restricciones}`;
    if (r.mensaje) t += `\nMensaje: ${r.mensaje}`;
    return t;
  }

  function ticket() {
    const r = resp, yes = r.asiste === "si", codigo = (guest && guest.codigo) || r.codigo;
    const showQr = yes && F.has("qrIngreso") && guest && codigo;
    const phone = ev.rsvp && ev.rsvp.whatsapp;
    return `<div class="ticket reveal in">
      <div class="top"><svg class="check-anim" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><circle cx="32" cy="32" r="25"/><path d="M21 33l7 7 15-16"/></svg>
        <h3>${yes ? "¡Te esperamos!" : "¡Gracias por avisar!"}</h3><p>${esc(r.nombre || (guest && guest.nombre) || "")}</p></div>
      <div class="cut"></div>
      <div class="bot">
        <span class="status">${yes ? `Confirmado · ${r.cantidad} ${+r.cantidad === 1 ? "persona" : "personas"}` : "No asistirá"}</span>
        ${showQr ? `<div class="qr">${qrSvg("IP|" + ev.slug + "|" + codigo, { label: "QR de ingreso" })}</div><div class="code">${esc(codigo)}</div><p class="muted" style="font-size:.85em">Mostrá este QR en la entrada${ev.mesas && guest.mesa ? ` · <b>Mesa ${esc(guest.mesa)}</b>` : ""}</p>` : yes ? `<p class="muted">${esc(fmtFecha(ev.fecha))} · ${esc(fmtHora(ev.fecha))} h</p>` : `<p class="muted">Vamos a extrañarte.</p>`}
        <div class="actions">
          ${yes ? `<div class="row center"><button class="btn sm" type="button" data-ics>${icon("cal")} Calendario (.ics)</button><a class="btn sm ghost" href="${esc(gcal(ev, location.href))}" target="_blank" rel="noopener">Google Calendar</a></div>` : ""}
          ${phone && F.has("rsvpWhatsapp") ? `<a class="btn wa ghost block" href="${esc(wa(phone, waText(r)))}" target="_blank" rel="noopener">${icon("wa")} Avisar por WhatsApp</a>` : ""}
          <button class="btn ghost block" type="button" data-change>${icon("edit")} Cambiar mi respuesta</button>
        </div>
      </div></div>`;
  }

  function wall() {
    if (!F.has("mensajes")) return "";
    return `<section class="sec" id="mensajes"><div class="wrap">${head("Con cariño", "Libro de mensajes", S("mensajes"))}
      <div class="wall" data-wall><div class="skel" style="height:90px"></div><div class="skel" style="height:90px"></div></div></div></section>`;
  }
  async function loadWall() {
    const w = $("[data-wall]"); if (!w) return;
    try {
      const r = await api.call("messages", { evento: ev.slug }); const ms = (r.mensajes || []).slice(0, 30);
      w.innerHTML = ms.length ? ms.map(m => `<blockquote class="reveal in"><p>${esc(m.mensaje)}</p><footer>— ${esc(m.nombre)}</footer></blockquote>`).join("") : `<p class="center muted">Sé el primero en dejar un mensaje al confirmar ✨</p>`;
    } catch (e) { w.innerHTML = `<p class="center muted">No pudimos cargar los mensajes.</p>`; }
  }

  function photos() {
    const has = F.has("fotos") && ev.fotos && ev.fotos.subir;
    if (!has && !F.has("compartir")) return "";
    return `<section class="sec alt" id="fotos"><div class="wrap center">${head("Compartí", has ? "Tus fotos" : "Compartí la invitación", has ? (S("fotos") || "Subí las fotos que saques en la fiesta a nuestro álbum compartido.") : "")}
      <div class="row center reveal">${has ? `<a class="btn" href="${esc(ev.fotos.subir)}" target="_blank" rel="noopener">${icon("camara")} Subí tus fotos</a>` : ""}
      ${F.has("compartir") ? `<button class="btn ghost" type="button" data-share>${icon("share")} Compartir</button>` : ""}</div></div></section>`;
  }

  function footer() {
    const C = IP.CFG, txt = `Hola, vi la invitación de ${ev.festejados.nombres} y quiero una para mi evento ✨`;
    return `<footer class="foot"><div class="mono">${esc(ev.festejados.iniciales || "")}</div>
      <p style="margin-top:.6rem">${esc(fmtFecha(ev.fecha, { weekday: undefined }))}</p>
      ${F.has("sinMarca") ? "" : `<a class="credit" href="${esc(wa(C.whatsappVentas, txt))}" target="_blank" rel="noopener">Hecho con ♥ por <b>${esc(C.marca || "InvitaPro")}</b> · Pedí la tuya</a>`}
    </footer>`;
  }

  // ---------- Dock, música, interacción ----------
  function dock() {
    let d = $(".dock"); if (d) d.remove();
    const label = resp ? "Ver mi confirmación" : "Confirmar asistencia";
    document.body.insertAdjacentHTML("beforeend", `<nav class="dock" aria-label="Acciones rápidas">
      <a class="ib" href="#lugares" aria-label="Ver ubicación">${icon("pin")}</a>
      <a class="btn" href="#rsvp">${icon("check")} ${label}</a>
      ${F.has("compartir") ? `<button class="ib" type="button" data-share aria-label="Compartir invitación">${icon("share")}</button>` : ""}
    </nav>`);
    d = $(".dock");
    const hero = $(".hero");
    new IntersectionObserver(([e]) => d.classList.toggle("show", !e.isIntersecting), { threshold: .35 }).observe(hero);
    if (isPreview) d.classList.add("show");
  }

  function music() {
    let b = $(".music"); if (b) b.remove();
    if (!ev.musica || !ev.musica.src) return;
    document.body.insertAdjacentHTML("beforeend", `<button class="music" type="button" aria-label="Silenciar música" aria-pressed="false"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span></button>`);
    b = $(".music");
    b.onclick = () => {
      if (!audio) return startMusic();
      if (audio.paused) { audio.play(); b.classList.remove("muted"); b.setAttribute("aria-label", "Silenciar música"); b.setAttribute("aria-pressed", "false"); }
      else { audio.pause(); b.classList.add("muted"); b.setAttribute("aria-label", "Activar música"); b.setAttribute("aria-pressed", "true"); }
    };
  }
  function startMusic() {
    const b = $(".music"); if (!b || !ev.musica || !ev.musica.src) return;
    b.classList.add("on");
    if (!audio) { audio = new Audio(ev.musica.src); audio.loop = true; audio.volume = 0; }
    audio.play().then(() => { let v = 0; const t = setInterval(() => { v = Math.min(.55, v + .03); audio.volume = v; if (v >= .55) clearInterval(t); }, 120); }).catch(() => b.classList.add("muted"));
  }

  function observe() {
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal:not(.in)").forEach(el => io.observe(el));
    const mio = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { loadMap(e.target); mio.unobserve(e.target); } }), { rootMargin: "200px" });
    $$("[data-map]").forEach(m => mio.observe(m));
  }
  function loadMap(m) { if (m.querySelector("iframe")) return; m.innerHTML = `<iframe src="${m.dataset.map}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Mapa"></iframe>`; }

  function share() {
    const url = location.href.split("&g=")[0].split("?g=")[0], data = { title: document.title, text: `Te comparto la invitación de ${ev.festejados.nombres}`, url };
    if (navigator.share) navigator.share(data).catch(() => {}); else copy(url);
  }

  function updateCompanions(form) {
    const box = $("[data-comp]", form); if (!box) return;
    const n = +form.cantidad.value, prev = ((resp && resp.acompanantes) || "").split(";").map(s => s.trim());
    const cur = $$("input", box).map(i => i.value);
    box.innerHTML = Array.from({ length: Math.max(0, n - 1) }, (_, i) => `<input type="text" name="comp" placeholder="Acompañante ${i + 1}" aria-label="Nombre del acompañante ${i + 1}" value="${esc(cur[i] || prev[i] || "")}">`).join("") || `<p class="muted" style="margin:0;font-size:.9em">Solo vos 😊</p>`;
  }

  function bind() {
    const app = $("#app");
    app.onclick = async (e) => {
      const t = e.target.closest("button, a"); if (!t) return;
      if (t.dataset.copy) copy(t.dataset.copy);
      else if (t.hasAttribute("data-share")) share();
      else if (t.closest("[data-map]")) loadMap(t.closest("[data-map]"));
      else if (t.dataset.lb) lightbox(+t.dataset.lb);
      else if (t.hasAttribute("data-ics")) download(ev.slug + ".ics", ics(ev, location.href), "text/calendar");
      else if (t.hasAttribute("data-change")) { $("#rsvp-box").innerHTML = form(); wireForm(); }
      else if (t.hasAttribute("data-cancel")) { $("#rsvp-box").innerHTML = ticket(); }
    };
    document.body.onclick = (e) => { const t = e.target.closest("[data-share]"); if (t && !app.contains(t)) share(); };
    const nf = $("[data-name-form]");
    if (nf) nf.onsubmit = (e) => { e.preventDefault(); freeName = nf.querySelector("input").value.trim(); if (!freeName) return; LS.set("name:" + ev.slug, freeName); $("#bienvenida").outerHTML = welcome(); const n = $("[name=nombre]"); if (n && !n.value) n.value = freeName; $("#bienvenida .reveal").classList.add("in"); };
    wireForm(); tick();
  }

  function wireForm() {
    const f = $("[data-rsvp]"); if (!f) return;
    f.classList.add("in");
    const yes = $("[data-yes]", f), max = maxSeats();
    const sync = () => { yes.hidden = f.asiste.value === "no"; };
    f.addEventListener("change", sync); sync();
    $$("[data-step]", f).forEach(b => b.onclick = () => {
      const v = Math.min(max, Math.max(1, +f.cantidad.value + +b.dataset.step));
      f.cantidad.value = v; f.cantidadOut.value = v; updateCompanions(f);
      if (v === max && +b.dataset.step > 0) toast(guest ? `Tenés ${max} lugares reservados` : `Máximo ${max} personas`);
    });
    updateCompanions(f);
    f.onsubmit = async (e) => {
      e.preventDefault();
      if (f.website.value) return; // honeypot
      const nombre = guest ? guest.nombre : (f.nombre.value || "").trim();
      if (!nombre) { f.nombre.focus(); toast("Escribí tu nombre"); return; }
      const asiste = f.asiste.value;
      const restr = $$("[name=restr]:checked", f).map(i => i.value); if (f.restrOtro && f.restrOtro.value.trim()) restr.push(f.restrOtro.value.trim());
      const data = {
        evento: ev.slug, codigo: guest ? guest.codigo : (resp && resp.codigo) || "", nombre, asiste,
        cantidad: asiste === "si" ? +f.cantidad.value : 0,
        acompanantes: asiste === "si" ? $$("[name=comp]", f).map(i => i.value.trim()).filter(Boolean).join("; ") : "",
        restricciones: asiste === "si" ? restr.join(", ") : "", mensaje: (f.mensaje.value || "").trim(),
        cancion: asiste === "si" && f.cancion ? f.cancion.value.trim() : "", website: ""
      };
      const btn = $("button[type=submit]", f); btn.disabled = true; btn.textContent = "Enviando…";
      try {
        if (F.has("rsvpPlanilla")) { const r = await api.call("rsvp", data); data.codigo = r.codigo || data.codigo; }
        else if (ev.rsvp && ev.rsvp.whatsapp) open(wa(ev.rsvp.whatsapp, waText(data)), "_blank");
        resp = data; if (!guest) LS.set("rsvp:" + ev.slug, data);
        $("#rsvp-box").innerHTML = ticket(); dock();
        $("#rsvp").scrollIntoView({ behavior: "smooth", block: "start" });
        if (asiste === "si" && window.IPFx) IPFx.celebrate(theme.paleta);
        if (data.mensaje && F.has("mensajes")) loadWall();
      } catch (err) {
        btn.disabled = false; btn.innerHTML = icon("check") + " Enviar confirmación";
        toast("No se pudo enviar. Probá de nuevo o avisá por WhatsApp.", 4000); console.error(err);
      }
    };
  }

  function tick() {
    const cd = $("[data-cd]"); if (!cd) return;
    const t = new Date(ev.fecha).getTime(), u = { d: $("[data-u=d]", cd), h: $("[data-u=h]", cd), m: $("[data-u=m]", cd), s: $("[data-u=s]", cd) };
    const pad = (n) => String(n).padStart(2, "0");
    clearInterval(tick._h);
    const f = () => { let s = Math.max(0, Math.floor((t - Date.now()) / 1000)); u.d.textContent = pad(Math.floor(s / 86400)); s %= 86400; u.h.textContent = pad(Math.floor(s / 3600)); s %= 3600; u.m.textContent = pad(Math.floor(s / 60)); u.s.textContent = pad(s % 60); };
    f(); tick._h = setInterval(f, 1000);
  }

  function lightbox(i) {
    const imgs = ev.galeria.map(g => ({ src: g.src || g, alt: g.alt || "" }));
    let lb = $(".lightbox");
    if (!lb) { document.body.insertAdjacentHTML("beforeend", `<div class="lightbox" role="dialog" aria-modal="true" aria-label="Galería"><img alt=""><button class="x" aria-label="Cerrar">×</button><button class="prev" aria-label="Anterior">‹</button><button class="next" aria-label="Siguiente">›</button></div>`); lb = $(".lightbox"); }
    const img = $("img", lb), set = () => { img.src = imgs[i].src; img.alt = imgs[i].alt; };
    const close = () => { lb.classList.remove("open"); document.removeEventListener("keydown", key); };
    const key = (e) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight") { i = (i + 1) % imgs.length; set(); } if (e.key === "ArrowLeft") { i = (i - 1 + imgs.length) % imgs.length; set(); } };
    $(".x", lb).onclick = close; $(".next", lb).onclick = () => { i = (i + 1) % imgs.length; set(); }; $(".prev", lb).onclick = () => { i = (i - 1 + imgs.length) % imgs.length; set(); };
    lb.onclick = (e) => { if (e.target === lb) close(); };
    let x0 = null; lb.ontouchstart = (e) => x0 = e.touches[0].clientX; lb.ontouchend = (e) => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { i = (i + (dx < 0 ? 1 : -1) + imgs.length) % imgs.length; set(); } x0 = null; };
    set(); lb.classList.add("open"); $(".x", lb).focus(); document.addEventListener("keydown", key);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
