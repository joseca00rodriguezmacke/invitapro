/* InvitaPro · Ornamentos SVG por motivo (usan currentColor, se tiñen con el tema).
   corner(m)  → esquina 200×200 (se espeja con CSS)
   divider(m) → separador 240×40
   emblem(m)  → emblema 120×120 para portada/apertura */
(function () {
  const svg = (vb, body, cls) => `<svg xmlns="http://www.w3.org/2000/svg" class="${cls || ""}" viewBox="${vb}" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

  // Hoja almendrada en (x,y) con ángulo a y largo l
  const leaf = (x, y, a, l, w, fill) => {
    const r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    const tx = x + c * l, ty = y + s * l, nx = -s * w, ny = c * w;
    const m1x = x + c * l * .5 + nx, m1y = y + s * l * .5 + ny, m2x = x + c * l * .5 - nx, m2y = y + s * l * .5 - ny;
    return `<path d="M${x.toFixed(1)} ${y.toFixed(1)} Q${m1x.toFixed(1)} ${m1y.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)} Q${m2x.toFixed(1)} ${m2y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}Z" ${fill ? 'fill="currentColor" fill-opacity=".18"' : ""} stroke-width="1.2"/>`;
  };
  // Rama curva con hojas a ambos lados
  const branch = (opt) => {
    const { n = 7, leafL = 22, leafW = 7, curve = 40, fill = true, round = false } = opt;
    let out = `<path d="M8 192 Q${40 + curve} ${110} ${150} 8" stroke-width="1.4"/>`;
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1);
      const x = (1 - t) * (1 - t) * 8 + 2 * (1 - t) * t * (40 + curve) + t * t * 150;
      const y = (1 - t) * (1 - t) * 192 + 2 * (1 - t) * t * 110 + t * t * 8;
      const ang = -60 + t * 15;
      if (round) {
        out += `<circle cx="${(x + 10).toFixed(1)}" cy="${(y + 4).toFixed(1)}" r="${leafW}" fill="currentColor" fill-opacity=".16" stroke-width="1.1"/><circle cx="${(x - 8).toFixed(1)}" cy="${(y - 6).toFixed(1)}" r="${leafW * .85}" fill="currentColor" fill-opacity=".16" stroke-width="1.1"/>`;
      } else {
        out += leaf(x, y, ang + 55, leafL * (1 - t * .3), leafW, fill) + leaf(x, y, ang - 75, leafL * (1 - t * .3), leafW, fill);
      }
    }
    return out;
  };
  const flower = (cx, cy, r, petals) => {
    let o = "";
    for (let i = 0; i < petals; i++) {
      const a = i * 360 / petals;
      o += `<ellipse cx="${cx}" cy="${cy - r * .55}" rx="${r * .32}" ry="${r * .55}" transform="rotate(${a} ${cx} ${cy})" fill="currentColor" fill-opacity=".14" stroke-width="1.1"/>`;
    }
    return o + `<circle cx="${cx}" cy="${cy}" r="${r * .18}" fill="currentColor" stroke="none"/>`;
  };
  const rose = (cx, cy, r) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor" fill-opacity=".1" stroke-width="1.2"/>` +
    `<path d="M${cx - r * .6} ${cy} q${r * .6} ${-r * .9} ${r * 1.2} 0 q${-r * .6} ${r * .7} ${-r * 1.2} 0Z M${cx - r * .3} ${cy - r * .1} q${r * .3} ${-r * .5} ${r * .6} 0" stroke-width="1.1"/>` +
    `<path d="M${cx - r * .8} ${cy + r * .2} q${r * .8} ${r * .9} ${r * 1.6} 0" stroke-width="1.1"/>`;
  const star = (cx, cy, r) => `<path d="M${cx} ${cy - r} L${cx + r * .22} ${cy - r * .22} L${cx + r} ${cy} L${cx + r * .22} ${cy + r * .22} L${cx} ${cy + r} L${cx - r * .22} ${cy + r * .22} L${cx - r} ${cy} L${cx - r * .22} ${cy - r * .22}Z" fill="currentColor" fill-opacity=".5" stroke-width=".8"/>`;
  const nanduti = (cx, cy, r, rings, spokes) => {
    let o = "";
    for (let k = 1; k <= rings; k++) {
      const rr = r * k / rings; let d = "";
      for (let i = 0; i <= spokes; i++) {
        const a = i * 2 * Math.PI / spokes, a2 = (i + .5) * 2 * Math.PI / spokes;
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        const qx = cx + Math.cos(a2) * rr * (k % 2 ? .82 : 1.08), qy = cy + Math.sin(a2) * rr * (k % 2 ? .82 : 1.08);
        d += i === 0 ? `M${x.toFixed(1)} ${y.toFixed(1)}` : ` Q${pq.x} ${pq.y} ${x.toFixed(1)} ${y.toFixed(1)}`;
        pq = { x: qx.toFixed(1), y: qy.toFixed(1) };
      }
      o += `<path d="${d}" stroke-width="${k === rings ? 1.4 : .9}"/>`;
    }
    for (let i = 0; i < spokes; i++) {
      const a = i * 2 * Math.PI / spokes;
      o += `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * r).toFixed(1)}" y2="${(cy + Math.sin(a) * r).toFixed(1)}" stroke-width=".6"/>`;
    }
    return o + `<circle cx="${cx}" cy="${cy}" r="${r * .12}" fill="currentColor" stroke="none"/>`;
  };
  const balloon = (x, y, r, op) => `<ellipse cx="${x}" cy="${y}" rx="${r * .85}" ry="${r}" fill="currentColor" fill-opacity="${op}" stroke-width="1.2"/><path d="M${x} ${y + r} l-3 6 h6z" fill="currentColor" stroke="none"/><path d="M${x} ${y + r + 6} q8 18 -2 34 q-8 14 4 30" stroke-width=".9"/>`;
  const cloud = (x, y, s) => `<path d="M${x} ${y} a${10 * s} ${10 * s} 0 0 1 ${18 * s} ${-6 * s} a${14 * s} ${14 * s} 0 0 1 ${26 * s} ${2 * s} a${9 * s} ${9 * s} 0 0 1 ${6 * s} ${17 * s} h${-46 * s} a${7 * s} ${7 * s} 0 0 1 ${-4 * s} ${-13 * s}z" fill="currentColor" fill-opacity=".12" stroke-width="1.2"/>`;
  const flake = (cx, cy, r) => {
    let o = "";
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      const bx = cx + Math.cos(a) * r * .6, by = cy + Math.sin(a) * r * .6;
      o += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke-width="1.1"/>`;
      o += `<path d="M${(bx + Math.cos(a + .6) * r * .25).toFixed(1)} ${(by + Math.sin(a + .6) * r * .25).toFixed(1)} L${bx.toFixed(1)} ${by.toFixed(1)} L${(bx + Math.cos(a - .6) * r * .25).toFixed(1)} ${(by + Math.sin(a - .6) * r * .25).toFixed(1)}" stroke-width="1"/>`;
    }
    return o;
  };
  const monstera = (x, y, s, a) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="M0 0 C-30 -20 -40 -60 -10 -90 C10 -100 40 -90 45 -60 C50 -30 30 -5 0 0Z" fill="currentColor" fill-opacity=".15" stroke-width="1.3"/><path d="M0 0 C5 -30 10 -60 5 -88 M3 -25 L-28 -40 M5 -45 L-30 -66 M6 -62 L-18 -84 M4 -30 L35 -44 M6 -52 L42 -62" stroke-width="1"/></g>`;
  const wave = (y, amp, op) => `<path d="M0 ${y} q25 ${-amp} 50 0 t50 0 t50 0 t50 0" stroke-width="1.3" opacity="${op}"/>`;
  const blob = (cx, cy, r, op) => {
    let d = ""; const n = 9;
    for (let i = 0; i <= n; i++) {
      const a = i / n * Math.PI * 2, rr = r * (0.8 + 0.25 * Math.sin(i * 2.3 + cx));
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      d += (i ? " L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    return `<path d="${d}Z" fill="currentColor" fill-opacity="${op}" stroke="none" filter="url(#ip-soft)"/>`;
  };

  const CORNERS = {
    lineal: () => `<path d="M6 194 V40 Q6 6 40 6 H194" stroke-width="1.3"/><path d="M18 194 V52 Q18 18 52 18 H194" stroke-width=".7"/><path d="M40 40 l8 -8 l8 8 l-8 8z" fill="currentColor" stroke="none"/><circle cx="18" cy="18" r="3" fill="currentColor" stroke="none"/>`,
    floral: () => branch({ n: 6, leafL: 20, leafW: 6 }) + rose(46, 54, 20) + rose(86, 34, 13) + flower(22, 96, 14, 5) + flower(120, 16, 9, 5),
    estrellas: () => star(40, 40, 22) + star(92, 24, 10) + star(24, 98, 12) + star(130, 52, 6) + star(64, 120, 5) + `<path d="M6 194 Q20 60 194 6" stroke-width=".7" stroke-dasharray="2 6"/>`,
    globos: () => balloon(44, 44, 26, .22) + balloon(96, 30, 18, .14) + balloon(30, 112, 16, .3),
    pampa: () => branch({ n: 9, leafL: 30, leafW: 3, curve: 20, fill: false }) + `<path d="M8 192 Q120 140 194 120" stroke-width="1.2"/>` + [0, 1, 2, 3, 4, 5].map(i => leaf(40 + i * 24, 178 - i * 11, -100 + i * 4, 20, 3)).join(""),
    minimo: () => `<path d="M6 120 V6 H120" stroke-width="1.2"/><circle cx="6" cy="6" r="3" fill="currentColor" stroke="none"/>`,
    nubes: () => cloud(20, 46, 1.4) + cloud(90, 24, .9) + cloud(14, 120, .8) + star(130, 70, 6) + star(56, 92, 4),
    neon: () => `<path d="M6 194 V60 L60 6 H194" stroke-width="2.2"/><path d="M26 194 V72 L72 26 H194" stroke-width="1" opacity=".6"/><circle cx="60" cy="6" r="4" fill="currentColor" stroke="none"/>`,
    hojas: () => branch({ n: 8, leafL: 18, leafW: 9, round: true }),
    deco: () => `<path d="M6 194 V6 H194" stroke-width="1.4"/><path d="M16 194 V16 H194" stroke-width=".7"/>` + [0, 1, 2, 3, 4, 5, 6].map(i => { const a = i * 15 * Math.PI / 180; return `<line x1="16" y1="16" x2="${(16 + Math.cos(a) * 90).toFixed(1)}" y2="${(16 + Math.sin(a) * 90).toFixed(1)}" stroke-width=".8"/>`; }).join("") + `<path d="M16 76 A60 60 0 0 0 76 16" stroke-width="1.2"/><path d="M16 106 A90 90 0 0 0 106 16" stroke-width=".8"/>`,
    olivo: () => branch({ n: 7, leafL: 26, leafW: 5 }) + `<circle cx="60" cy="96" r="6" fill="currentColor" fill-opacity=".35" stroke-width="1"/><circle cx="96" cy="58" r="5" fill="currentColor" fill-opacity=".35" stroke-width="1"/>`,
    ondas: () => `<g transform="rotate(-35 100 100)">${wave(60, 14, 1)}${wave(80, 12, .7)}${wave(100, 10, .45)}</g><circle cx="44" cy="40" r="18" fill="currentColor" fill-opacity=".12" stroke-width="1.2"/>`,
    nanduti: () => nanduti(54, 54, 46, 4, 16) + nanduti(132, 22, 18, 2, 12) + nanduti(22, 132, 18, 2, 12),
    acuarela: () => `<defs><filter id="ip-soft"><feGaussianBlur stdDeviation="5"/></filter></defs>` + blob(50, 50, 44, .22) + blob(110, 30, 26, .16) + blob(30, 110, 24, .16) + flower(50, 50, 18, 6),
    monstera: () => monstera(30, 150, 1, 30) + monstera(70, 70, .8, 60) + monstera(10, 60, .6, 10),
    copos: () => flake(44, 44, 26) + flake(108, 26, 12) + flake(26, 110, 14) + flake(90, 92, 7),
    laureles: () => branch({ n: 8, leafL: 22, leafW: 6 })
  };

  const DIVIDERS = {
    def: (m) => `<line x1="10" y1="20" x2="95" y2="20" stroke-width="1"/><line x1="145" y1="20" x2="230" y2="20" stroke-width="1"/>` + (CENTER[m] || CENTER.def)()
  };
  const CENTER = {
    def: () => `<path d="M120 10 l10 10 l-10 10 l-10 -10z" fill="currentColor" fill-opacity=".25" stroke-width="1"/>`,
    floral: () => flower(120, 20, 16, 5),
    estrellas: () => star(120, 20, 12),
    globos: () => `<ellipse cx="120" cy="17" rx="8" ry="10" fill="currentColor" fill-opacity=".3" stroke-width="1.2"/><path d="M120 27 q4 6 0 10" stroke-width=".9"/>`,
    nubes: () => cloud(98, 24, .8),
    nanduti: () => nanduti(120, 20, 15, 2, 12),
    copos: () => flake(120, 20, 12),
    hojas: () => leaf(120, 20, -160, 22, 6, true) + leaf(120, 20, -20, 22, 6, true),
    olivo: () => leaf(120, 20, -150, 22, 5, true) + leaf(120, 20, -30, 22, 5, true),
    laureles: () => leaf(120, 22, -150, 20, 5, true) + leaf(120, 22, -30, 20, 5, true) + `<circle cx="120" cy="20" r="3" fill="currentColor" stroke="none"/>`,
    deco: () => `<path d="M104 20 L120 6 L136 20 L120 34Z M110 20 L120 11 L130 20 L120 29Z" stroke-width="1"/>`,
    minimo: () => `<circle cx="120" cy="20" r="2.5" fill="currentColor" stroke="none"/>`,
    neon: () => `<path d="M108 20 h24" stroke-width="2.4"/>`,
    ondas: () => `<path d="M100 20 q5 -6 10 0 t10 0 t10 0 t10 0" stroke-width="1.3"/>`,
    monstera: () => leaf(120, 30, -90, 24, 9, true),
    acuarela: () => flower(120, 20, 14, 6),
    pampa: () => leaf(120, 30, -120, 24, 3) + leaf(120, 30, -90, 26, 3) + leaf(120, 30, -60, 24, 3),
    lineal: () => `<path d="M120 12 l8 8 l-8 8 l-8 -8z" fill="currentColor" stroke="none"/><circle cx="104" cy="20" r="1.8" fill="currentColor" stroke="none"/><circle cx="136" cy="20" r="1.8" fill="currentColor" stroke="none"/>`
  };

  function corner(m) { return svg("0 0 200 200", (CORNERS[m] || CORNERS.lineal)(), "orn-corner"); }
  function divider(m) { return svg("0 0 240 40", DIVIDERS.def(m), "orn-divider"); }
  function emblem(m) {
    const inner = {
      nanduti: () => nanduti(60, 60, 50, 4, 20),
      copos: () => flake(60, 60, 40),
      estrellas: () => star(60, 60, 36),
      deco: () => `<circle cx="60" cy="60" r="52" stroke-width="1.2"/>` + [...Array(24)].map((_, i) => { const a = i * 15 * Math.PI / 180; return `<line x1="${(60 + Math.cos(a) * 40).toFixed(1)}" y1="${(60 + Math.sin(a) * 40).toFixed(1)}" x2="${(60 + Math.cos(a) * 52).toFixed(1)}" y2="${(60 + Math.sin(a) * 52).toFixed(1)}" stroke-width=".8"/>`; }).join("")
    }[m];
    return svg("0 0 120 120", inner ? inner() : `<circle cx="60" cy="60" r="52" stroke-width="1"/><circle cx="60" cy="60" r="46" stroke-width=".6"/>`, "orn-emblem");
  }

  window.IPOrn = { corner, divider, emblem };
})();
