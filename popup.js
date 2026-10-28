const DEFAULT_SECONDS = 10;
const STORAGE_KEY = "platformSettings";
const messages = {
  en: {
    title: "Video Arrow Seek",
    intro: "Configure each platform independently",
    silent: "Silent seeking (hide player controls until mouse movement)",
    silentSpacebar: "Hide player controls when toggling playback with Space",
    bulk: "Bulk actions",
    selectAll: "Select all platforms",
    bulkSeconds: "Set skip seconds",
    applySeconds: "Apply to selected",
    enableSelected: "Enable selected",
    disableSelected: "Disable selected",
    save: "Save settings",
    saveShortcut: "Shortcut: Ctrl+S / ⌘+S",
    ready: "← Rewind / → Fast forward",
    invalidBulk: "Enter a whole number from 1 to 600 seconds.",
    noSelection: "Select at least one platform first.",
    applied: (seconds) => `Skip interval set to ${seconds} seconds for selected platforms.`,
    enabled: "Selected platforms enabled.",
    disabled: "Selected platforms disabled.",
    saved: "Settings saved.",
    invalidPlatform: (name) => `${name}: enter a whole number from 1 to 600 seconds.`,
    selectPlatform: (name) => `Select ${name} for bulk actions`,
    togglePlatform: (name) => `Enable or disable ${name}`,
    platformSeconds: (name) => `${name} skip interval in seconds`,
    secondsUnit: "sec"
  },
  zh: {
    title: "视频方向键跳转",
    intro: "为每个平台单独设置开关和跳转秒数",
    silent: "静默跳转（隐藏播放器控制栏，鼠标移动后恢复）",
    silentSpacebar: "按空格键暂停/播放时隐藏播放器控制栏",
    bulk: "批量操作",
    selectAll: "全选平台",
    bulkSeconds: "批量跳转秒数",
    applySeconds: "应用到所选",
    enableSelected: "启用所选",
    disableSelected: "关闭所选",
    save: "保存设置",
    saveShortcut: "快捷键：Ctrl+S / ⌘+S",
    ready: "← 快退 / → 快进",
    invalidBulk: "请输入 1 到 600 之间的整数秒数。",
    noSelection: "请先勾选要批量操作的平台。",
    applied: (seconds) => `已将所选平台的跳转秒数设为 ${seconds} 秒。`,
    enabled: "已启用所选平台。",
    disabled: "已关闭所选平台。",
    saved: "设置已保存。",
    invalidPlatform: (name) => `${name} 的秒数须为 1 到 600 之间的整数。`,
    selectPlatform: (name) => `选择 ${name} 进行批量操作`,
    togglePlatform: (name) => `启用或关闭 ${name}`,
    platformSeconds: (name) => `${name} 跳转秒数`,
    secondsUnit: "秒"
  },
  "zh-TW": {
    title: "影片方向鍵跳轉",
    intro: "為每個平台分別設定開關和跳轉秒數",
    silent: "靜音跳轉（隱藏播放器控制列，移動滑鼠後恢復）",
    silentSpacebar: "按空白鍵暫停/播放時隱藏播放器控制列",
    bulk: "批次操作",
    selectAll: "全選平台",
    bulkSeconds: "批次跳轉秒數",
    applySeconds: "套用至所選",
    enableSelected: "啟用所選",
    disableSelected: "關閉所選",
    save: "儲存設定",
    saveShortcut: "快速鍵：Ctrl+S / ⌘+S",
    ready: "← 倒轉 / → 快轉",
    invalidBulk: "請輸入 1 到 600 之間的整數秒數。",
    noSelection: "請先勾選要批次操作的平台。",
    applied: (seconds) => `已將所選平台的跳轉秒數設為 ${seconds} 秒。`,
    enabled: "已啟用所選平台。",
    disabled: "已關閉所選平台。",
    saved: "設定已儲存。",
    invalidPlatform: (name) => `${name} 的秒數必須是 1 到 600 之間的整數。`,
    selectPlatform: (name) => `選取 ${name} 以進行批次操作`,
    togglePlatform: (name) => `啟用或關閉 ${name}`,
    platformSeconds: (name) => `${name} 跳轉秒數`,
    secondsUnit: "秒"
  }
};
const platforms = [
  { id: "netflix", name: { en: "Netflix", zh: "Netflix" } },
  { id: "youtube", name: { en: "YouTube", zh: "YouTube" } },
  { id: "bilibili", name: { en: "Bilibili", zh: "Bilibili" } },
  { id: "disneyplus", name: { en: "Disney+", zh: "Disney+" } },
  { id: "primevideo", name: { en: "Prime Video", zh: "Prime Video" } },
  { id: "twitch", name: { en: "Twitch", zh: "Twitch" } },
  { id: "tencentvideo", name: { en: "Tencent Video", zh: "腾讯视频", "zh-TW": "騰訊視頻" } },
  { id: "youku", name: { en: "Youku", zh: "优酷", "zh-TW": "優酷" } },
  { id: "iqiyi", name: { en: "iQIYI", zh: "爱奇艺", "zh-TW": "愛奇藝" } }
];
const platformContainer = document.querySelector("#platforms");
const status = document.querySelector("#status");
const selectAll = document.querySelector("#select-all");
const silentSeek = document.querySelector("#silent-seek");
const silentSpacebar = document.querySelector("#silent-spacebar");
const languageSelect = document.querySelector("#language");
const controls = new Map();
let language = "en";
let toastTimeout;

for (const platform of platforms) {
  const row = document.createElement("section");
  row.className = "platform-row";
  row.innerHTML = `
    <label class="platform-select">
      <input class="selected" type="checkbox">
    </label>
    <label class="platform-toggle">
      <input class="enabled" type="checkbox" role="switch">
      <span class="platform-name"></span>
    </label>
    <label class="seconds-label">
      <input class="seconds" type="number" min="1" max="600" step="1">
      <span class="seconds-unit"></span>
    </label>
  `;
  platformContainer.append(row);
  controls.set(platform.id, {
    row,
    selected: row.querySelector(".selected"),
    enabled: row.querySelector(".enabled"),
    seconds: row.querySelector(".seconds"),
    name: row.querySelector(".platform-name"),
    unit: row.querySelector(".seconds-unit")
  });
}

function applyLanguage() {
  const copy = messages[language];
  document.documentElement.lang = language === "zh" ? "zh-CN" : language === "zh-TW" ? "zh-TW" : "en";
  document.title = copy.title;
  document.querySelector("#title").textContent = copy.title;
  document.querySelector("#intro").textContent = copy.intro;
  document.querySelector("#silent-label").textContent = copy.silent;
  document.querySelector("#silent-spacebar-label").textContent = copy.silentSpacebar;
  document.querySelector("#bulk-panel").setAttribute("aria-label", copy.bulk);
  document.querySelector("#select-all-label").textContent = copy.selectAll;
  updateSelectAll();
  document.querySelector("#bulk-seconds-label").textContent = copy.bulkSeconds;
  document.querySelector("#apply-seconds").textContent = copy.applySeconds;
  document.querySelector("#enable-selected").textContent = copy.enableSelected;
  document.querySelector("#disable-selected").textContent = copy.disableSelected;
  document.querySelector("#save-top").textContent = copy.save;
  document.querySelector("#save").textContent = copy.save;
  document.querySelector("#save-shortcut-hint").textContent = copy.saveShortcut;
  if (!status.dataset.hasMessage) status.textContent = copy.ready;

  for (const platform of platforms) {
    const control = controls.get(platform.id);
    const name = platform.name[language] || platform.name.zh || platform.name.en;
    control.name.textContent = name;
    control.selected.setAttribute("aria-label", copy.selectPlatform(name));
    control.enabled.setAttribute("aria-label", copy.togglePlatform(name));
    control.seconds.setAttribute("aria-label", copy.platformSeconds(name));
    control.unit.textContent = copy.secondsUnit;
  }
}

chrome.storage.sync.get([STORAGE_KEY, "skipSeconds", "silentSeek", "silentSpacebar", "language"], (stored) => {
  language = ["en", "zh", "zh-TW"].includes(stored.language) ? stored.language : "en";
  languageSelect.value = language;
  applyLanguage();
  silentSeek.checked = stored.silentSeek === true;
  silentSpacebar.checked = stored.silentSpacebar === true;
  const saved = stored[STORAGE_KEY] || {};
  for (const platform of platforms) {
    const value = saved[platform.id];
    const control = controls.get(platform.id);
    control.enabled.checked = value?.enabled !== false;
    const legacySeconds = platform.id === "netflix" ? stored.skipSeconds : undefined;
    control.seconds.value = String(value?.seconds ?? legacySeconds ?? DEFAULT_SECONDS);
  }
});

languageSelect.addEventListener("change", () => {
  language = ["en", "zh", "zh-TW"].includes(languageSelect.value) ? languageSelect.value : "en";
  status.dataset.hasMessage = "";
  applyLanguage();
  chrome.storage.sync.set({ language });
});

selectAll.addEventListener("change", () => {
  for (const control of controls.values()) control.selected.checked = selectAll.checked;
  updateSelectAll();
});

for (const control of controls.values()) {
  control.selected.addEventListener("change", updateSelectAll);
}

document.querySelector("#apply-seconds").addEventListener("click", () => {
  const seconds = Number(document.querySelector("#bulk-seconds").value);
  if (!Number.isInteger(seconds) || seconds < 1 || seconds > 600) {
    showMessage(messages[language].invalidBulk);
    return;
  }
  const selected = selectedControls();
  if (selected.length === 0) return showMessage(messages[language].noSelection);
  for (const control of selected) control.seconds.value = String(seconds);
  saveSettings(messages[language].applied(seconds));
});

document.querySelector("#enable-selected").addEventListener("click", () => setSelectedEnabled(true));
document.querySelector("#disable-selected").addEventListener("click", () => setSelectedEnabled(false));
for (const saveButton of document.querySelectorAll("#save-top, #save")) {
  saveButton.addEventListener("click", () => saveSettings(messages[language].saved));
}

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.isComposing && event.key.toLowerCase() === "s") {
    event.preventDefault();
    event.stopPropagation();
    saveSettings(messages[language].saved);
  }
}, true);

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveSettings(messages[language].saved);
  }
});

function showMessage(message) {
  status.dataset.hasMessage = "true";
  status.textContent = message;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.hidden = true;
  }, 2500);
}

function updateSelectAll() {
  const selectedCount = Array.from(controls.values()).filter((control) => control.selected.checked).length;
  selectAll.checked = selectedCount === controls.size;
  selectAll.indeterminate = selectedCount > 0 && selectedCount < controls.size;
}

function selectedControls() {
  return Array.from(controls.values()).filter((control) => control.selected.checked);
}

function setSelectedEnabled(enabled) {
  const selected = selectedControls();
  if (selected.length === 0) return showMessage(messages[language].noSelection);
  for (const control of selected) control.enabled.checked = enabled;
  saveSettings(enabled ? messages[language].enabled : messages[language].disabled);
}

function saveSettings(successMessage) {
  const platformSettings = {};
  for (const platform of platforms) {
    const control = controls.get(platform.id);
    const seconds = Number(control.seconds.value);
    if (!Number.isInteger(seconds) || seconds < 1 || seconds > 600) {
      showMessage(messages[language].invalidPlatform(platform.name[language]));
      control.seconds.focus();
      return;
    }
    platformSettings[platform.id] = { enabled: control.enabled.checked, seconds };
  }

  chrome.storage.sync.set({
    [STORAGE_KEY]: platformSettings,
    silentSeek: silentSeek.checked,
    silentSpacebar: silentSpacebar.checked,
    language
  }, () => {
    showToast(successMessage);
  });
}
