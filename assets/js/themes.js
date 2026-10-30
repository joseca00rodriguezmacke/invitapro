/* InvitaPro · Sistema de temas
   Un tema = motivo de ornamentos + efecto de partículas + paletas + tipografías sugeridas.
   Todo es combinable: cualquier tema acepta cualquier pareja tipográfica y nivel de ornamento. */
(function () {
  // Parejas tipográficas (Google Fonts). display = títulos, script = nombres, body = textos.
  const FUENTES = {
    clasica:    { nombre: "Clásica",     display: "Cormorant Garamond", script: "Pinyon Script",   body: "Montserrat" },
    romantica:  { nombre: "Romántica",   display: "Playfair Display",   script: "Great Vibes",     body: "Lato" },
    glam:       { nombre: "Glam",        display: "Cinzel",             script: "Italianno",       body: "Poppins" },
    divertida:  { nombre: "Divertida",   display: "Fredoka",            script: "Fredoka",         body: "Nunito" },
    boho:       { nombre: "Boho",        display: "Cormorant Garamond", script: "Amatic SC",       body: "Josefin Sans" },
    moderna:    { nombre: "Moderna",     display: "DM Serif Display",   script: "DM Serif Display",body: "DM Sans" },
    suave:      { nombre: "Suave",       display: "Quicksand",          script: "Parisienne",      body: "Quicksand" },
    neon:       { nombre: "Neón",        display: "Bebas Neue",         script: "Monoton",         body: "Space Grotesk" },
    deco:       { nombre: "Art déco",    display: "Marcellus",          script: "Poiret One",      body: "Josefin Sans" },
    editorial:  { nombre: "Editorial",   display: "Bodoni Moda",        script: "Bodoni Moda",     body: "Jost" },
    vintage:    { nombre: "Vintage",     display: "IM Fell English",    script: "Pinyon Script",   body: "Lora" },
    natural:    { nombre: "Natural",     display: "EB Garamond",        script: "Allura",          body: "Mulish" },
    playera:    { nombre: "Playera",     display: "Raleway",            script: "Satisfy",         body: "Raleway" },
    tropical:   { nombre: "Tropical",    display: "Abril Fatface",      script: "Pacifico",        body: "Nunito Sans" },
    sobria:     { nombre: "Sobria",      display: "Manrope",            script: "Manrope",         body: "Manrope" },
    academica:  { nombre: "Académica",   display: "Libre Baskerville",  script: "Oswald",          body: "Source Sans 3" }
  };

  // p(nombre, fondo, fondo2, superficie, texto, suave, primario, acento, sobrePrimario, oscuro?)
  const p = (nombre, bg, bg2, surface, text, muted, primary, accent, onPrimary, dark) =>
    ({ nombre, bg, bg2, surface, text, muted, primary, accent, onPrimary, dark: !!dark });

  const TEMAS = [
    { id: "dorado", nombre: "Dorado elegante", tipos: ["boda", "xv", "aniversario"], motivo: "lineal", particulas: "brillos", fuentes: ["clasica", "editorial", "deco"], apertura: "sobre",
      paletas: [
        p("Marfil y oro", "#fbf8f1", "#f3ecdc", "#ffffff", "#2b2418", "#6f6350", "#a8842c", "#c9a54a", "#ffffff"),
        p("Negro y oro", "#14110c", "#1f1a12", "#221c13", "#f5ecd7", "#c7b892", "#d4af5a", "#e9cd84", "#14110c", true),
        p("Champagne", "#f8f1e7", "#efe2cf", "#fffaf2", "#3a2e22", "#7a6a55", "#9c7a3c", "#c8a46b", "#ffffff")
      ] },
    { id: "floral", nombre: "Floral rosé", tipos: ["boda", "xv", "babyshower"], motivo: "floral", particulas: "petalos", fuentes: ["romantica", "clasica", "natural"], apertura: "sobre",
      paletas: [
        p("Rosé", "#fdf6f4", "#f8e8e4", "#ffffff", "#3d2a2c", "#7d6266", "#b4646f", "#d99aa1", "#ffffff"),
        p("Durazno", "#fff7f0", "#fbe7d8", "#ffffff", "#3f2b20", "#7f6455", "#c0704b", "#e6a37f", "#ffffff"),
        p("Malva", "#f8f4f8", "#ede3ee", "#ffffff", "#352a38", "#6f6273", "#8a5a8f", "#bc94bf", "#ffffff")
      ] },
    { id: "xv-glam", nombre: "XV glam", tipos: ["xv", "cumple"], motivo: "estrellas", particulas: "brillos", fuentes: ["glam", "editorial", "romantica"], apertura: "telon",
      paletas: [
        p("Rosa y oro", "#1c0f17", "#2a1621", "#2e1825", "#fbeef4", "#d9b5c6", "#e58db1", "#f2c98a", "#1c0f17", true),
        p("Lila glam", "#160f22", "#221733", "#251a38", "#f3eefc", "#c4b6dd", "#b38cf0", "#f0c6ff", "#160f22", true),
        p("Rosa perla", "#fff5f9", "#fbe4ee", "#ffffff", "#3b1d2b", "#7b5566", "#c2457e", "#e8a3c3", "#ffffff")
      ] },
    { id: "infantil", nombre: "Infantil fiesta", tipos: ["cumple", "babyshower"], motivo: "globos", particulas: "globos", fuentes: ["divertida", "suave"], apertura: "tarjeta",
      paletas: [
        p("Arcoíris", "#fffaf0", "#fff0d6", "#ffffff", "#27324a", "#5b6680", "#ef5d60", "#3fa7d6", "#ffffff"),
        p("Safari", "#fbf7ee", "#f1e6cf", "#ffffff", "#2f3a25", "#646c55", "#d98a2b", "#6a9a4b", "#ffffff"),
        p("Espacial", "#0f1630", "#18214a", "#1b2552", "#eef3ff", "#b6c2e6", "#ffcf4a", "#5ad1ff", "#0f1630", true)
      ] },
    { id: "boho", nombre: "Boho rústico", tipos: ["boda", "babyshower", "cumple"], motivo: "pampa", particulas: "hojas", fuentes: ["boho", "natural", "vintage"], apertura: "libro",
      paletas: [
        p("Terracota", "#f7f0e6", "#efe1cd", "#fbf6ee", "#3b2a1e", "#76624f", "#b5643c", "#c99a6b", "#ffffff"),
        p("Arena y salvia", "#f5f1e8", "#e8e2d2", "#faf7f0", "#2f3328", "#686c5d", "#7b8a64", "#c2a57a", "#ffffff")
      ] },
    { id: "minimal", nombre: "Minimalista moderno", tipos: ["boda", "corporativo", "cumple", "graduacion"], motivo: "minimo", particulas: "polvo", fuentes: ["moderna", "sobria", "editorial"], apertura: "monograma",
      paletas: [
        p("Blanco puro", "#ffffff", "#f4f4f2", "#fafaf9", "#141414", "#5d5d5a", "#141414", "#9a9a94", "#ffffff"),
        p("Piedra", "#efece6", "#e2ded5", "#f7f5f1", "#22211e", "#64615a", "#3f3b34", "#a49c8c", "#ffffff"),
        p("Carbón", "#151515", "#1f1f1f", "#232323", "#f2f2f0", "#a9a9a4", "#f2f2f0", "#8c8c86", "#151515", true)
      ] },
    { id: "bautismo", nombre: "Bautismo celeste", tipos: ["bautismo", "babyshower", "comunion"], motivo: "nubes", particulas: "burbujas", fuentes: ["suave", "natural", "romantica"], apertura: "puertas",
      paletas: [
        p("Celeste", "#f4f9fd", "#e3f0fa", "#ffffff", "#1f3447", "#566d82", "#4a87b8", "#a9cbe6", "#ffffff"),
        p("Rosa bebé", "#fdf7f9", "#f8e6ee", "#ffffff", "#40283a", "#7b6274", "#c06c93", "#ecb6cc", "#ffffff"),
        p("Neutro crema", "#fbf8f2", "#f1ebdf", "#ffffff", "#34302a", "#6e675c", "#8f7e60", "#cdbd9c", "#ffffff")
      ] },
    { id: "neon", nombre: "Noche neón", tipos: ["cumple", "xv", "graduacion", "corporativo"], motivo: "neon", particulas: "neon", fuentes: ["neon", "sobria"], apertura: "media",
      paletas: [
        p("Magenta y cian", "#0b0614", "#140b24", "#170d2a", "#f4f0ff", "#b9b0d6", "#ff3fb4", "#2ef2ff", "#0b0614", true),
        p("Lima eléctrica", "#070b08", "#0e1610", "#111a13", "#effff2", "#aac8b0", "#b6ff3b", "#3bffd0", "#070b08", true)
      ] },
    { id: "eucalipto", nombre: "Eucalipto", tipos: ["boda", "bautismo", "babyshower"], motivo: "hojas", particulas: "hojas", fuentes: ["natural", "clasica", "boho"], apertura: "sobre",
      paletas: [
        p("Verde salvia", "#f6f7f2", "#e8ece1", "#ffffff", "#25301f", "#5d6956", "#5f7a55", "#a8b99a", "#ffffff"),
        p("Bosque", "#14201a", "#1c2c23", "#1f3127", "#eef4ec", "#b2c3b3", "#a8c99b", "#e3d6a8", "#14201a", true)
      ] },
    { id: "art-deco", nombre: "Art déco", tipos: ["boda", "xv", "corporativo", "aniversario"], motivo: "deco", particulas: "brillos", fuentes: ["deco", "glam", "editorial"], apertura: "puertas",
      paletas: [
        p("Esmeralda y oro", "#0e1f1a", "#132a23", "#163028", "#f3ecd8", "#c3b994", "#d6b25e", "#7fc4a8", "#0e1f1a", true),
        p("Azul noche", "#0d1424", "#131d33", "#172340", "#f1ead6", "#b9b39e", "#d9b867", "#8fb0e0", "#0d1424", true),
        p("Marfil déco", "#f8f4ea", "#ece4d1", "#fffcf5", "#1e1b16", "#5f584b", "#8c6d2e", "#2f5d50", "#ffffff")
      ] },
    { id: "mediterraneo", nombre: "Mediterráneo", tipos: ["boda", "cumple", "aniversario"], motivo: "olivo", particulas: "petalos", fuentes: ["romantica", "editorial", "natural"], apertura: "tarjeta",
      paletas: [
        p("Azul y limón", "#fbfaf5", "#eef2f6", "#ffffff", "#1c2b45", "#56637a", "#25539b", "#e5c53c", "#ffffff"),
        p("Terracota y olivo", "#faf6ef", "#f0e7d9", "#ffffff", "#332c22", "#6f6555", "#9a5b38", "#7c8a4e", "#ffffff")
      ] },
    { id: "playa", nombre: "Playa", tipos: ["boda", "cumple", "xv"], motivo: "ondas", particulas: "burbujas", fuentes: ["playera", "suave", "natural"], apertura: "media",
      paletas: [
        p("Arena y mar", "#fbf7ef", "#eaf3f3", "#ffffff", "#163640", "#56717a", "#1f8a99", "#e3b97f", "#ffffff"),
        p("Atardecer", "#fff6ef", "#ffe6d6", "#ffffff", "#3d2420", "#7d5d55", "#e0664a", "#f2b35b", "#ffffff")
      ] },
    { id: "nanduti", nombre: "Ñandutí", tipos: ["boda", "xv", "cumple", "corporativo"], motivo: "nanduti", particulas: "confeti", fuentes: ["natural", "academica", "clasica"], apertura: "monograma",
      paletas: [
        p("Encaje blanco", "#fbf9f4", "#f2eee4", "#ffffff", "#2a2722", "#67625a", "#b0413e", "#2f6f8f", "#ffffff"),
        p("Multicolor", "#fffaf2", "#f7eedd", "#ffffff", "#2b2620", "#665e52", "#d1495b", "#00798c", "#ffffff")
      ] },
    { id: "vintage", nombre: "Vintage", tipos: ["boda", "aniversario", "cumple"], motivo: "floral", particulas: "polvo", fuentes: ["vintage", "clasica"], apertura: "libro",
      paletas: [
        p("Sepia", "#f4ecdc", "#e9dcc3", "#f9f3e6", "#3a2c1d", "#715f49", "#7e5a32", "#a8885a", "#ffffff"),
        p("Verde inglés", "#f3efe3", "#e3ddc9", "#f9f6ec", "#24301f", "#5f6754", "#3d5a3a", "#a9864d", "#ffffff")
      ] },
    { id: "acuarela", nombre: "Acuarela", tipos: ["boda", "babyshower", "bautismo", "xv"], motivo: "acuarela", particulas: "petalos", fuentes: ["natural", "romantica", "suave"], apertura: "sobre",
      paletas: [
        p("Lavanda", "#faf8fc", "#efe9f6", "#ffffff", "#2f2840", "#6b6380", "#7a63b0", "#c4b2e6", "#ffffff"),
        p("Coral", "#fff8f6", "#fde8e2", "#ffffff", "#3d2522", "#7d5f5a", "#d0645a", "#f1aa98", "#ffffff"),
        p("Turquesa", "#f6fbfa", "#e2f2ef", "#ffffff", "#17332f", "#536e69", "#2a8c80", "#93d1c6", "#ffffff")
      ] },
    { id: "black-tie", nombre: "Black tie", tipos: ["boda", "corporativo", "graduacion", "aniversario"], motivo: "lineal", particulas: "brillos", fuentes: ["editorial", "moderna", "glam"], apertura: "telon",
      paletas: [
        p("Negro y plata", "#0c0c0d", "#161618", "#1b1b1e", "#f3f3f4", "#b3b3b8", "#d9d9de", "#9aa0ad", "#0c0c0d", true),
        p("Borgoña", "#1a0b0f", "#260f16", "#2c121a", "#f7ecee", "#cdb0b6", "#d9a3ad", "#e6c99a", "#1a0b0f", true)
      ] },
    { id: "tropical", nombre: "Tropical", tipos: ["cumple", "boda", "xv"], motivo: "monstera", particulas: "confeti", fuentes: ["tropical", "playera", "divertida"], apertura: "tarjeta",
      paletas: [
        p("Selva", "#f7faf3", "#e6f0dd", "#ffffff", "#1b2f22", "#51685a", "#1f7a4d", "#f08a5d", "#ffffff"),
        p("Flamenco", "#fff7f6", "#ffe5e2", "#ffffff", "#36201f", "#755c5a", "#e2557a", "#2aa889", "#ffffff")
      ] },
    { id: "invierno", nombre: "Invierno", tipos: ["boda", "xv", "cumple", "corporativo"], motivo: "copos", particulas: "nieve", fuentes: ["glam", "clasica", "suave"], apertura: "puertas",
      paletas: [
        p("Plata helada", "#f4f7fa", "#e4ebf2", "#ffffff", "#1c2733", "#56636f", "#4d6b8a", "#a9bfd4", "#ffffff"),
        p("Azul medianoche", "#0c1424", "#121d33", "#16233d", "#eef3fa", "#aebbd0", "#bcd3f0", "#e8e0c9", "#0c1424", true)
      ] },
    { id: "jardin", nombre: "Jardín inglés", tipos: ["boda", "babyshower", "cumple", "comunion"], motivo: "floral", particulas: "petalos", fuentes: ["natural", "clasica", "vintage"], apertura: "libro",
      paletas: [
        p("Verde y blanco", "#f8faf5", "#ebf0e4", "#ffffff", "#24321f", "#5b6a55", "#4b6e43", "#e3a6b4", "#ffffff"),
        p("Rosas antiguas", "#fbf6f2", "#f1e4dc", "#ffffff", "#382a26", "#73625c", "#9c5a5f", "#8ea37e", "#ffffff")
      ] },
    { id: "graduacion", nombre: "Graduación", tipos: ["graduacion", "corporativo"], motivo: "laureles", particulas: "confeti", fuentes: ["academica", "editorial", "sobria"], apertura: "telon",
      paletas: [
        p("Azul y oro", "#0f1a2e", "#16233d", "#1a2946", "#f2eedf", "#b6b6aa", "#d8b45a", "#8fb2e6", "#0f1a2e", true),
        p("Bordó académico", "#f8f4ef", "#ede4d9", "#ffffff", "#2a1c1c", "#6b5a58", "#7d2a33", "#b8954f", "#ffffff")
      ] },
    { id: "corporativo", nombre: "Corporativo", tipos: ["corporativo", "graduacion"], motivo: "minimo", particulas: "polvo", fuentes: ["sobria", "moderna", "academica"], apertura: "monograma",
      paletas: [
        p("Azul ejecutivo", "#f6f8fb", "#e7ecf3", "#ffffff", "#141c2b", "#536074", "#1f4fd1", "#14b8a6", "#ffffff"),
        p("Grafito", "#111317", "#191c22", "#1d2128", "#eef1f6", "#a7b0bf", "#6ea8ff", "#ffd166", "#111317", true)
      ] }
  ];

  const APERTURAS = {
    sobre:     "Sobre con sello de lacre",
    telon:     "Telón que se corre",
    tarjeta:   "Tarjeta que se despliega en 3D",
    libro:     "Libro que se abre",
    puertas:   "Puertas ornamentadas",
    monograma: "Monograma con onda de luz",
    media:     "Foto o video de portada"
  };

  const TIPOS = {
    boda: "Boda", xv: "XV años", cumple: "Cumpleaños", bautismo: "Bautismo", comunion: "Primera comunión",
    babyshower: "Baby shower", graduacion: "Graduación", corporativo: "Evento corporativo", aniversario: "Aniversario"
  };

  function tema(id) { return TEMAS.find(t => t.id === id) || TEMAS[0]; }

  function fontsUrl(f) {
    const fams = [...new Set([f.display, f.script, f.body])];
    const q = fams.map(n => "family=" + n.replace(/ /g, "+") + (/(Script|Vibes|Italianno|Parisienne|Allura|Satisfy|Pacifico|Monoton|Amatic|Poiret|Bebas|Abril|IM Fell)/.test(n) ? "" : ":wght@400;500;600;700")).join("&");
    return "https://fonts.googleapis.com/css2?" + q + "&display=swap";
  }

  // Aplica el tema al documento. cfg = { id, paleta, tipografia, ornamento, particulas, apertura }
  function aplicar(cfg, root) {
    root = root || document.documentElement;
    const t = tema(cfg && cfg.id);
    const pal = t.paletas[(cfg && cfg.paleta) | 0] || t.paletas[0];
    const fKey = (cfg && cfg.tipografia) || t.fuentes[0];
    const f = FUENTES[fKey] || FUENTES[t.fuentes[0]];
    const s = root.style;
    s.setProperty("--bg", pal.bg); s.setProperty("--bg2", pal.bg2); s.setProperty("--surface", pal.surface);
    s.setProperty("--text", pal.text); s.setProperty("--muted", pal.muted); s.setProperty("--primary", pal.primary);
    s.setProperty("--accent", pal.accent); s.setProperty("--on-primary", pal.onPrimary);
    s.setProperty("--f-display", `"${f.display}", Georgia, serif`);
    s.setProperty("--f-script", `"${f.script}", "${f.display}", cursive`);
    s.setProperty("--f-body", `"${f.body}", system-ui, sans-serif`);
    root.dataset.tema = t.id; root.dataset.motivo = t.motivo; root.dataset.dark = pal.dark ? "1" : "0";
    root.dataset.ornamento = (cfg && cfg.ornamento) || "medio";
    let link = document.getElementById("ip-fonts");
    if (!link) { link = document.createElement("link"); link.id = "ip-fonts"; link.rel = "stylesheet"; document.head.appendChild(link); }
    const url = fontsUrl(f); if (link.href !== url) link.href = url;
    const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = pal.bg;
    return { tema: t, paleta: pal, fuentes: f };
  }

  window.IPThemes = { FUENTES, TEMAS, APERTURAS, TIPOS, tema, aplicar, fontsUrl };
})();
