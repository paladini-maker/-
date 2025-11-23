const manifestUri =
  'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd';

async function init() {
  const video = document.getElementById('video');

  // UI de Shaka ya creó el player internamente
  const ui = video.ui;
  const controls = ui.getControls();
  const player = controls.getPlayer();

  window.player = player;
  window.ui = ui;

  player.addEventListener('error', onPlayerErrorEvent);
  controls.addEventListener('error', onUIErrorEvent);

  try {
    await player.load(manifestUri);
    console.log('El video cargó correctamente!');
  } catch (error) {
    onPlayerError(error);
  }
}

function onPlayerErrorEvent(event) {
  onPlayerError(event.detail);
}

function onPlayerError(error) {
  console.error('Player Error:', error.code, error);
}

function onUIErrorEvent(event) {
  onPlayerError(event.detail);
}

function initFailed(errorEvent) {
  console.error('No se pudo cargar la UI de Shaka!', errorEvent.detail);
}

// Eventos de carga de la UI
document.addEventListener('shaka-ui-loaded', init);
document.addEventListener('shaka-ui-load-failed', initFailed);