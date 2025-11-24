// ------------- CONFIG ----------------
// Cambiá aquí por tu MPD/HLS real
const DEFAULT_MANIFEST = 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd';

// Si querés probar ClearKey localmente, definí el map aquí (opcional).
// Formato: 'keyId_hex' : 'key_hex'  (ver nota abajo sobre formatos)
const CLEARKEY_MAP = {
  // 'cc8c82ac2ec7e9799527c29db7354e81': 'cc4aae173dd2ef17ae26be3f7ae87662'
};

// Receiver app id (dejar igual al data-attr en index.html)
const RECEIVER_APP_ID = 'REPLACE_WITH_YOUR_APP_ID';
// --------------------------------------

function $id(id){ return document.getElementById(id); }
function log(...args){
  console.log(...args);
  const el = $id('log');
  if(el) el.textContent = new Date().toLocaleTimeString() + ' — ' + args.map(a => (typeof a==='object'? JSON.stringify(a): a)).join(' ');
}

/**
 * Inicializa Shaka UI y el player.
 * Maneja ClearKey si CLEARKEY_MAP tiene valores.
 */
async function initShaka() {
  log('shaka-ui-loaded -> inicializando player');
  if (!window.shaka) {
    log('ERROR: Shaka no está cargado.');
    return;
  }

  shaka.polyfill.installAll();

  const video = $id('video');
  if (!video) {
    log('ERROR: elemento video no encontrado.');
    return;
  }

  // El UI de Shaka crea internamente player si usamos data-shaka-player
  const ui = video.ui;
  if (!ui) {
    log('ERROR: video.ui indefinido — verifica que data-shaka-player esté en el <video>.');
    return;
  }

  const controls = ui.getControls();
  const player = controls.getPlayer();
  window.player = player;
  window.ui = ui;

  // Configuración opcional recomendada
  player.configure({
    streaming: { rebufferingGoal: 2, bufferingGoal: 12 },
    abr: { enabled: true }
  });

  // Si CLEARKEY_MAP no está vacío, configurarlo (opcional)
  if (Object.keys(CLEARKEY_MAP).length) {
    // Nota: dependiendo de tu formato de claves (hex vs base64), puede ser necesario
    // convertir a base64. Consulta docs de Shaka/EME si tenés problemas.
    player.configure({'drm': {'clearKeys': CLEARKEY_MAP}});
    log('ClearKey configurado (map).');
  }

  // Manejo de errores
  player.addEventListener('error', (e) => {
    const err = e.detail || e;
    log('Shaka player error:', err);
    console.error(err);
  });

  // Carga del manifiesto
  try {
    await player.load(DEFAULT_MANIFEST);
    log('Manifest cargado OK:', DEFAULT_MANIFEST);
  } catch (err) {
    log('Error cargando manifest:', err);
    console.error(err);
  }

  // Observa estado de Cast (opcional)
  if (window.cast && cast.framework) {
    const ctx = cast.framework.CastContext.getInstance();
    ctx.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (ev) => {
      log('Cast session state:', ev.sessionState);
    });
    log('Cast framework ready. AppId configurado:', RECEIVER_APP_ID);
    ctx.setOptions({ receiverApplicationId: RECEIVER_APP_ID, autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED });
  } else {
    log('Cast framework no está listo — el botón Cast puede no aparecer hasta que el SDK esté cargado y Chrome lo soporte.');
  }
}

// Escucha evento de la UI de Shaka
document.addEventListener('shaka-ui-loaded', initShaka);
document.addEventListener('shaka-ui-load-failed', (e) => {
  log('shaka-ui-load-failed', e && e.detail ? e.detail : e);
});
log('Sender script cargado — esperando shaka-ui-loaded...');
