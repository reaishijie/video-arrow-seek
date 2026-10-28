(() => {
  const DEFAULT_SECONDS = 10;
  const MESSAGE_SOURCE = "video-arrow-seek";
  const hostname = location.hostname;
  const platform = hostname === "www.netflix.com" ? "netflix"
    : hostname === "www.youtube.com" || hostname === "www.youtube-nocookie.com" ? "youtube"
      : hostname === "www.bilibili.com" || hostname === "www.bilibili.tv" ? "bilibili"
        : hostname.endsWith("disneyplus.com") ? "disneyplus"
          : hostname.endsWith("primevideo.com") || hostname.endsWith("amazon.com") ? "primevideo"
            : hostname.endsWith("twitch.tv") ? "twitch"
        : hostname === "v.qq.com" || hostname.endsWith(".v.qq.com") ? "tencentvideo"
          : hostname === "youku.com" || hostname.endsWith(".youku.com") ? "youku"
            : hostname === "iqiyi.com" || hostname.endsWith(".iqiyi.com") ? "iqiyi" : null;

  if (!platform) return;

  const defaults = {
    netflix: { enabled: true, seconds: DEFAULT_SECONDS },
    youtube: { enabled: true, seconds: DEFAULT_SECONDS },
    bilibili: { enabled: true, seconds: DEFAULT_SECONDS },
    disneyplus: { enabled: true, seconds: DEFAULT_SECONDS },
    primevideo: { enabled: true, seconds: DEFAULT_SECONDS },
    twitch: { enabled: true, seconds: DEFAULT_SECONDS },
    tencentvideo: { enabled: true, seconds: DEFAULT_SECONDS },
    youku: { enabled: true, seconds: DEFAULT_SECONDS },
    iqiyi: { enabled: true, seconds: DEFAULT_SECONDS }
  };
  let settings = defaults[platform];
  let playerApiReady = false;
  let silentSeek = false;
  let silentSpacebar = false;

  chrome.storage.sync.get(["platformSettings", "skipSeconds", "silentSeek", "silentSpacebar"], (stored) => {
    silentSeek = stored.silentSeek === true;
    silentSpacebar = stored.silentSpacebar === true;
    const saved = stored.platformSettings?.[platform];
    if (saved && typeof saved === "object") {
      settings = {
        enabled: saved.enabled !== false,
        seconds: validSeconds(saved.seconds) ? saved.seconds : DEFAULT_SECONDS
      };
    } else if (platform === "netflix" && validSeconds(Number(stored.skipSeconds))) {
      settings = { enabled: true, seconds: Number(stored.skipSeconds) };
    }
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") return;
    if (changes.silentSeek) silentSeek = changes.silentSeek.newValue === true;
    if (changes.silentSpacebar) silentSpacebar = changes.silentSpacebar.newValue === true;
    if (!silentSeek && !silentSpacebar) clearSilentMode();
    if (!changes.platformSettings) return;
    const saved = changes.platformSettings.newValue?.[platform];
    if (saved && typeof saved === "object") {
      settings = {
        enabled: saved.enabled !== false,
        seconds: validSeconds(saved.seconds) ? saved.seconds : DEFAULT_SECONDS
      };
    }
  });

  const controlSelectors = {
    netflix: ".watch-video--bottom-controls-container, .watch-video--top-controls-container, .PlayerControls--container",
    youtube: ".ytp-chrome-bottom, .ytp-chrome-top, .ytp-gradient-bottom, .ytp-gradient-top",
    bilibili: ".bpx-player-control-wrap, .bpx-player-control-entity",
    disneyplus: "[data-testid*='control'], .controls-container",
    primevideo: "[class*='control-bar'], [class*='ControlBar'], [class*='control-overlay']",
    twitch: ".player-controls, .video-player__overlay",
    tencentvideo: ".txp_bottom, [class*='txp_player_control']",
    youku: ".h5-control, [class*='control-panel']",
    iqiyi: ".iqp-btn-play, [class*='player-controls']"
  };
  const silentStyle = document.createElement("style");
  const scopedControlSelectors = controlSelectors[platform].split(", ")
    .map((selector) => `html.video-arrow-seek-silent ${selector}`).join(", ");
  silentStyle.textContent = `${scopedControlSelectors} { visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }`;
  const installSilentStyle = () => {
    const target = document.head || document.documentElement;
    if (!target) {
      requestAnimationFrame(installSilentStyle);
      return;
    }
    target.appendChild(silentStyle);
  };
  installSilentStyle();
  document.addEventListener("pointermove", clearSilentMode, true);
  document.addEventListener("pointerdown", clearSilentMode, true);

  function activateSilentMode(force = false) {
    if (silentSeek || force) document.documentElement.classList.add("video-arrow-seek-silent");
  }

  function clearSilentMode() {
    document.documentElement.classList.remove("video-arrow-seek-silent");
  }

  if (platform === "netflix") {
    window.addEventListener("message", (event) => {
      if (event.source === window && event.data?.source === MESSAGE_SOURCE && event.data.type === "READY") {
        playerApiReady = true;
      }
    });

    const injectBridge = () => {
      if (!document.documentElement) {
        requestAnimationFrame(injectBridge);
        return;
      }
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("page-bridge.js");
      script.onload = () => script.remove();
      (document.head || document.documentElement).appendChild(script);
    };
    injectBridge();
  }

  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    const target = event.target;
    if (target instanceof Element && target.closest(
      "input, textarea, select, [contenteditable='true'], [role='textbox']"
    )) return;

    if (silentSpacebar && (event.code === "Space" || event.key === " ")) {
      // Let the platform handle playback; only hide its controls so native shortcuts keep working.
      activateSilentMode(true);
      return;
    }

    if (event.defaultPrevented || !settings.enabled || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    const deltaSeconds = event.key === "ArrowRight" ? settings.seconds : -settings.seconds;
    if (platform === "netflix") {
      if (!playerApiReady) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      window.postMessage({ source: MESSAGE_SOURCE, type: "SEEK", deltaSeconds }, "*");
      activateSilentMode();
      return;
    }

    const video = findActiveVideo();
    if (!video || !Number.isFinite(video.duration)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + deltaSeconds));
    activateSilentMode();
  }, true);

  function findActiveVideo() {
    const videos = Array.from(document.querySelectorAll("video"));
    return videos.find((video) => !video.paused && video.readyState >= 2)
      || videos.find((video) => video.readyState >= 2)
      || videos[0];
  }

  function validSeconds(value) {
    return Number.isInteger(value) && value >= 1 && value <= 600;
  }
})();
