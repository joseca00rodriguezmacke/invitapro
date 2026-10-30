#!/usr/bin/env node
/* InvitaPro · build opcional
   Genera /i/<slug>/index.html por cada evento con meta tags Open Graph (vista previa linda en WhatsApp) y noindex.
   Uso:  node build.js                    (usa baseUrl de config.js)
         node build.js https://usuario.github.io/invitapro/
   Si no lo corrés, todo funciona igual con invitacion.html?e=<slug>. */
const fs = require("fs"), path = require("path");
const ROOT = __dirname;
const cfgSrc = fs.readFileSync(path.join(ROOT, "config.js"), "utf8");
let BASE = (process.argv[2] || (cfgSrc.match(/baseUrl:\s*"([^"]*)"/) || [])[1] || "").trim();
if (BASE && !BASE.endsWith("/")) BASE += "/";
if (!BASE) console.warn("⚠  Sin baseUrl: las imágenes de vista previa necesitan una URL absoluta. Pasala como argumento o completala en config.js.");

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const TIPOS = { boda: "Boda", xv: "XV años", cumple: "Cumpleaños", bautismo: "Bautismo", comunion: "Primera comunión", babyshower: "Baby shower", graduacion: "Graduación", corporativo: "Evento", aniversario: "Aniversario" };
const tpl = fs.readFileSync(path.join(ROOT, "invitacion.html"), "utf8");
const dir = path.join(ROOT, "eventos");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
let n = 0;

for (const f of files) {
  const ev = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const slug = ev.slug || f.replace(/\.json$/, "");
  const fecha = new Date(ev.fecha).toLocaleDateString("es-PY", { timeZone: "America/Asuncion", weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const title = `${TIPOS[ev.tipo] || "Invitación"} · ${ev.festejados.nombres}`;
  const desc = `${fecha.charAt(0).toUpperCase() + fecha.slice(1)}. ${ev.frase || "Tenés una invitación especial."}`.slice(0, 190);
  // Imagen OG: og.png / og.jpg del evento, o la portada si no es SVG (WhatsApp no muestra SVG)
  const cand = ["og.png", "og.jpg", "og.jpeg"].map((x) => `eventos/${slug}/${x}`).find((p) => fs.existsSync(path.join(ROOT, p)))
    || (ev.portada && ev.portada.imagen && !/\.svg$/i.test(ev.portada.imagen) ? ev.portada.imagen : "");
  const img = cand ? (/^https?:/.test(cand) ? cand : BASE + cand) : "";
  const url = BASE ? `${BASE}i/${slug}/` : "";
  const meta = [
    `<base href="../../">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    url && `<meta property="og:url" content="${esc(url)}">`,
    img && `<meta property="og:image" content="${esc(img)}">`,
    img && `<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<script>window.IP_EVENT_SLUG=${JSON.stringify(slug)};</script>`
  ].filter(Boolean).join("\n");
  const html = tpl
    .replace(/<meta charset="utf-8">/, (m) => m + "\n" + meta)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}">`);
  const out = path.join(ROOT, "i", slug);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "index.html"), html);
  n++;
  console.log(`✓ i/${slug}/  ${img ? "" : "(sin imagen OG: agregá eventos/" + slug + "/og.png 1200×630)"}`);
}
console.log(`\n${n} invitaciones generadas.`);
