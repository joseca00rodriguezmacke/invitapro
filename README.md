# InvitaPro

Invitaciones digitales premium para eventos en Paraguay. Costo cero: HTML/CSS/JS puro en GitHub Pages + Google Apps Script con Google Sheets.

| Página | Para qué sirve |
|---|---|
| `index.html` | Catálogo con demos, estilos, planes y botón de WhatsApp |
| `invitacion.html?e=<slug>&g=<código>` | La invitación (plantilla única) |
| `panel.html?e=<slug>&k=<token>` | Panel del anfitrión (VIP) |
| `checkin.html?e=<slug>&k=<token>` | Check-in con QR en la puerta (VIP) |
| `creador.html` | Tu herramienta interna para crear eventos |
| `creador.html?modo=cliente` | Diseñador guiado para que el cliente arme su invitación y te la mande |
| `extras.html?e=<slug>` | Save the date, imagen para compartir, historia animada y PDF imprimible |

**Modo demo:** si `config.js` no tiene `appsScriptUrl`, todo funciona con localStorage y WhatsApp. Los eventos con `"demo": true` siempre usan este modo, aunque el backend esté conectado. Probá las demos:

- `invitacion.html?e=boda-sofia-y-mateo&g=GOMEZ4` (VIP, panel: `panel.html?e=boda-sofia-y-mateo&k=demo`)
- `invitacion.html?e=xv-valentina&g=SOFI01` (VIP)
- `invitacion.html?e=bautismo-benjamin&g=TORR03` (Pro)

## Crear un cliente nuevo (menos de 10 minutos)

1. Abrí `creador.html`. Completá **El evento**, elegí **Diseño** (21 temas, paletas, tipografías, ornamentos, 7 aperturas) y el resto de las secciones mirando la vista previa.
2. En **Plan y funciones** elegí Básico, Pro o VIP (podés prender o apagar funciones sueltas).
3. **Publicar → Descargar JSON**. Guardalo en `eventos/<slug>.json` y las fotos en `eventos/<slug>/`.
4. **Invitados**: pegá desde Excel las columnas *Nombre · Teléfono · Cupos · Grupo*. Tocá **Enviar a la planilla** (necesita el token admin) y mandá cada link con el botón de WhatsApp.
5. Pasale al anfitrión los links del **panel** y del **check-in** (sección Publicar).
6. Opcional: `node build.js` y subí los cambios (ver abajo).

Un evento = un archivo JSON. Los planes son *feature flags*: `"plan": "basico|pro|vip"` y `"funciones": { "galeria": false, "mesas": true }` para sobreescribir.

> La lista de invitados **nunca** va al repositorio: vive solo en la planilla. (Los `demo_invitados` de las demos son ficticios.)

## Desplegar el backend (Google Apps Script)

1. Creá una planilla nueva en Google Sheets (por ejemplo “InvitaPro”).
2. **Extensiones → Apps Script**. Borrá lo que haya y pegá todo `backend/Code.gs`. Guardá.
3. Elegí la función `setup` en la barra y tocá **Ejecutar**. Aceptá los permisos (“Configuración avanzada → Ir a InvitaPro”). Se crean las hojas y en la hoja **Config** aparece tu **TOKEN ADMIN**.
4. **Implementar → Nueva implementación → Tipo: Aplicación web**. Ejecutar como: **Yo**. Quién tiene acceso: **Cualquier persona**. Tocá Implementar y copiá la URL que termina en `/exec`.
5. Pegala en `config.js` → `appsScriptUrl: "https://script.google.com/macros/s/…/exec"`.
6. En `creador.html → Publicar`, pegá el token admin (queda guardado solo en tu navegador).

Si cambiás `Code.gs` después: **Implementar → Administrar implementaciones → Editar → Versión nueva** (la URL no cambia).

Hojas: `Eventos`, `Invitados`, `Respuestas`, `Mensajes` (poné `NO` en *aprobado* para ocultar uno), `Canciones`, `Checkin`, `Pedidos` (diseños enviados por clientes), `Config`.

## Publicar en GitHub Pages

```bash
git add -A && git commit -m "Nuevo evento" && git push
```

En GitHub: **Settings → Pages → Deploy from a branch → main / (root)**. Tu sitio queda en `https://<usuario>.github.io/invitapro/`. Poné esa URL en `config.js → baseUrl`.

**Links cortos con vista previa linda en WhatsApp (opcional):**

```bash
node build.js
```

Genera `i/<slug>/index.html` con título, descripción e imagen (`eventos/<slug>/og.jpg`, 1200×630; la creás en `extras.html`). Sin build, `invitacion.html?e=<slug>` funciona igual.

## Imágenes: que carguen rápido

- Usá [squoosh.app](https://squoosh.app): formato **WebP** o **MozJPEG**, calidad 70–80.
- Portada: 1080 px de ancho, menos de 200 KB. Galería: 1200 px como máximo, menos de 150 KB cada foto.
- Imagen para WhatsApp (`og.jpg`): 1200×630, menos de 300 KB.
- Música: MP3/M4A de 1–2 minutos a 64–96 kbps (menos de 1,5 MB).

## Estructura

```
assets/css   base.css · invitacion.css · app.css
assets/js    core.js (datos, API, planes) · themes.js (20 temas) · ornaments.js · particles.js
             openings.js (7 aperturas) · invitacion.js · panel.js · checkin.js · creador.js
assets/audio música original libre de derechos
vendor/      qrcode-generator (MIT) · jsQR (Apache-2.0), copiadas localmente
eventos/     <slug>.json + <slug>/ (imágenes)
backend/     Code.gs
```
