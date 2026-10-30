/* Configuración global de InvitaPro.
   - appsScriptUrl: pegá acá la URL de tu aplicación web de Apps Script (termina en /exec).
     Si queda vacía, todo funciona en MODO DEMO (localStorage + WhatsApp).
   - baseUrl: la URL pública donde está publicado el sitio (GitHub Pages). Se usa para armar links. */
window.INVITAPRO_CONFIG = {
  appsScriptUrl: "",
  baseUrl: "https://joseca00rodriguezmacke.github.io/invitapro/",
  marca: "InvitaPro",
  whatsappVentas: "595976596909",
  instagram: "",
  moneda: "Gs.",
  zonaHoraria: "America/Asuncion",
  precios: {
    basico: 150000,
    pro: 250000,
    vip: 650000,
    addon: 50000
  }
};
