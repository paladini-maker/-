// === CONFIGURACIÓN INICIAL ===
const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();


// === CONFIGURACIÓN DE PLAYBACK (Shaka + ClearKey) ===
const options = new cast.framework.CastReceiverOptions();
options.playbackConfig = new cast.framework.PlaybackConfig();

// obligamos a usar Shaka para todos los protocolos
options.playbackConfig.useShakaForDash = true;
options.playbackConfig.useShakaForHls = true;

// Claves ClearKey — reemplazar con las tuyas
options.playbackConfig.shakaConfig = {
  drm: {
    clearKeys: {
      // kid: key (ambos en hex)
      "000102030405060708090a0b0c0d0e0f": "1a1b1c1d1e1f20212223242526272829"
    }
  }
};


// === INTERCEPTAMOS EL MENSAJE LOAD DEL SENDER ===
playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  async (requestData) => {

    // MPD de prueba — reemplazar con el tuyo
    requestData.media.contentId =
      "https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd";

    requestData.media.contentType = "application/dash+xml";

    document.getElementById("status").innerText =
      "Reproduciendo: " + requestData.media.contentId;

    return requestData;
  }
);


// === INICIAMOS EL RECEIVER ===
context.start(options);
