async function initShaka() {
  if (!shaka.Player.isBrowserSupported()) {
    console.error("Shaka Player no soportado en este navegador");
    return;
  }

  const video = document.getElementById("video");
  const ui = video.ui;
  const controls = ui.getControls();
  const player = controls.getPlayer();

  // ClearKey Hardcodeado de ejemplo — reemplazá por el tuyo
  const clearkeys = {
    "cc8c82ac2ec7e9799527c29db7354e81": "cc4aae173dd2ef17ae26be3f7ae87662"
  };

  player.configure({ drm: { clearKeys: clearkeys } });

  const manifest = "https://cdn.cvattv.com.ar/live/c6eds/Canal7/SA_Live_dash_enc/Canal7.mpd";

  await player.load(manifest);

  // Enviar al receiver
  const castContext = cast.framework.CastContext.getInstance();
  const session = castContext.getCurrentSession();

  if (session) {
    session.loadMedia({
      contentId: manifest,
      contentType: "application/dash+xml",
      customData: { clearkey: clearkeys }
    });
  }
}

// Iniciar cuando cargue
window.onload = initShaka;
