# Video Arrow Seek

<p align="center">
  <a href="README.md"><img alt="English" src="https://img.shields.io/badge/English-2b2b2b?style=for-the-badge"></a>
  <a href="README.zh-CN.md"><img alt="简体中文" src="https://img.shields.io/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-FF7A0F?style=for-the-badge"></a>
</p>

A Chrome Manifest V3 extension that lets you seek backward and forward with the left and right arrow keys on Netflix, YouTube, Bilibili, Disney+, Prime Video, Twitch, Tencent Video, Youku, and iQIYI. Each platform can be enabled or disabled independently and configured with its own seek interval (1–600 seconds). All platforms are enabled by default, with a 10-second interval. The extension popup supports English, Simplified Chinese, and Traditional Chinese, and defaults to English.

## Installation

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**, then select **Load unpacked**.
3. Select this project folder.
4. Open the extension popup on a supported video platform. Configure platforms individually and select **Save Settings**, or use `Ctrl+S` on Windows/Linux and `⌘+S` on macOS. You can also select multiple platforms to apply the same seek interval or enable/disable setting in bulk.
5. Optionally enable **Silent Seeking** to try to hide the player controls while seeking with the arrow keys. The **Spacebar** option lets the website handle play/pause natively while hiding the controls. The controls reappear when the mouse moves. Both options apply to all platforms.
6. While a video is playing, press **←** to seek backward or **→** to seek forward. Settings are synced using Chrome Sync Storage.

Netflix seeking uses its player API; other platforms seek through the page's video element. The extension does not intercept arrow keys in editable areas such as inputs and text fields.
