(() => {
  const MESSAGE_SOURCE = "video-arrow-seek";
  let playerApi;
  let readySent = false;

  const getPlayerApi = () => {
    try {
      return window.netflix?.appContext?.state?.playerApp?.getAPI?.()?.videoPlayer;
    } catch {
      return undefined;
    }
  };

  const announceReadyWhenAvailable = () => {
    playerApi = getPlayerApi();
    if (playerApi && !readySent) {
      readySent = true;
      window.postMessage({ source: MESSAGE_SOURCE, type: "READY" }, "*");
    }
    if (!playerApi) window.setTimeout(announceReadyWhenAvailable, 500);
  };
  announceReadyWhenAvailable();

  window.addEventListener("message", (event) => {
    if (event.source !== window || event.data?.source !== MESSAGE_SOURCE || event.data.type !== "SEEK") return;
    const deltaSeconds = Number(event.data.deltaSeconds);
    if (!Number.isFinite(deltaSeconds)) return;

    playerApi = getPlayerApi() || playerApi;
    if (!playerApi) return;

    try {
      const sessionIds = playerApi.getAllPlayerSessionIds();
      const sessionId = sessionIds?.[0];
      if (sessionId == null) return;

      const player = playerApi.getVideoPlayerBySessionId(sessionId);
      if (!player) return;
      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();
      if (!Number.isFinite(currentTime) || !Number.isFinite(duration)) return;

      // Netflix's player API uses milliseconds; avoid changing the media element directly.
      const targetTime = Math.max(0, Math.min(duration, currentTime + deltaSeconds * 1000));
      player.seek(targetTime);
    } catch {
      // Player API can be temporarily unavailable during Netflix navigation/playback changes.
    }
  });
})();
