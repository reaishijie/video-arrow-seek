# Video Arrow Seek

<p align="center">
  <a href="README.md"><img alt="English" src="https://img.shields.io/badge/English-2b2b2b?style=for-the-badge"></a>
  <a href="README.zh-CN.md"><img alt="简体中文" src="https://img.shields.io/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-FF7A0F?style=for-the-badge"></a>
</p>

这是一款 Chrome Manifest V3 扩展，支持在 Netflix、YouTube、Bilibili、Disney+、Prime Video、Twitch、腾讯视频、优酷和爱奇艺中使用左右方向键快退或快进。每个平台都可单独启用/关闭，并设置自己的跳转秒数（1–600 秒）。默认全部启用，每次跳转 10 秒。弹窗界面支持 English、简体中文和繁體中文，默认 English。

## 安装与使用

1. 在 Chrome 中打开 `chrome://extensions`。
2. 开启“开发者模式”，选择“加载已解压的扩展程序”。
3. 选择本项目文件夹。
4. 在视频平台打开扩展弹窗，分别配置各个平台后点击“保存设置”，或使用 Windows/Linux 的 `Ctrl+S`、macOS 的 `⌘+S` 快捷保存；也可以勾选多个平台，批量统一跳转秒数或启用/关闭。
5. 可选开启“静默跳转”，方向键跳转时会尝试隐藏播放器控制栏。开启空格键选项后，按空格时由网站原生处理暂停/播放，同时隐藏控制栏。控制栏在鼠标移动后恢复；这两个选项对所有平台生效。
6. 播放时按 ← 快退、→ 快进。配置通过 Chrome Sync Storage 保存。

Netflix 使用其播放器 API 执行跳转；其他平台通过页面视频元素执行跳转。输入框、文本框等可编辑区域中的方向键不会被扩展拦截。
