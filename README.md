![kunkun](https://socialify.git.ci/kunkunsh/kunkun/image?description=1&forks=1&issues=1&logo=https%3A%2F%2Fstorage.huakun.tech%2F2024%2F9%2F12%2F4MjHiKK.png&name=1&owner=1&pattern=Circuit%20Board&pulls=1&stargazers=1&theme=Auto)

## 中文说明

这个仓库是 [kunkunsh/kunkun](https://github.com/kunkunsh/kunkun) 的个人 fork，用于维护中文本地化和本地运行修复。

本 fork 当前主要改动：

- 将桌面端默认语言改为中文，并补充大量界面文案汉化。
- 在通用设置中加入“外观模式”，支持浅色、深色和自动跟随系统外观。
- 修复开发环境启动时的若干问题，包括缺失加载动画数据、SSR 下配置 store 初始化、macOS 应用 plist 解析崩溃等。
- 关闭上游发布类 GitHub Actions 的自动触发，仅保留手动运行，避免个人 fork 误触发 JSR/NPM/桌面发布流程。

本仓库不是上游官方发布源。如需官方版本、文档和正式下载，请以 [Kunkun 官方仓库](https://github.com/kunkunsh/kunkun) 与 [官方文档](https://docs.kunkun.sh/) 为准。

本地开发运行：

```bash
pnpm install
pnpm --filter @kksh/desktop tauri dev
```

> 注：这个项目是 Tauri 桌面应用，浏览器里的 Vite 地址主要供 Tauri WebView 使用，不等同于完整应用入口。

> [!WARNING]
> 🚧 Work in Progress 🚧
> This project is still in its early stages.
>
> We know it’s not perfect yet. The author is pouring heart, soul, and a few sleepless nights into fixing the issues. Your patience means everything.
>
> Got feedback or found a bug? Open an issue—it helps more than you know.

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/kunkunsh/kunkun)
![GitHub last commit](https://img.shields.io/github/last-commit/kunkunsh/kunkun)
[![YouTube badge][]][YouTube link]
[![](https://dcbadge.limes.pink/api/server/7dzw3TYeTU)](https://discord.gg/7dzw3TYeTU)

[YouTube badge]: https://img.shields.io/youtube/channel/subscribers/UC1gJeFbvRcQXDC_C8nKetdA?style=social
[YouTube link]: https://www.youtube.com/@huakun

<table>
  <tr>
    <th>Demo Video and Instructions</th>
    <th>Download</th>
    <th>Platforms</th>
  </tr>
  <tr>
    <td>
      <ul>
        <li><a href="https://youtu.be/HfQb38s8VjY">Introduction Video</a></li>
        <li><a href="https://kunkun.sh/">Visit Website</a></li>
        <li><a href="https://docs.kunkun.sh/">Documentation</a></li>
      </ul>
    </td>
    <td>
      <ul>
        <li><a href="https://kunkun.sh/download/">From Website</a></li>
        <li><a href="https://github.com/kunkunsh/kunkun/releases">From GitHub Releases</a></li>
        <li><a href="https://formulae.brew.sh/cask/kunkun">Via Homebrew</a></li>
      </ul>
    </td>
    <td>
      <ul>
        <li>MacOS</li>
        <li>Linux</li>
        <li>Windows</li>
      </ul>
    </td>
  </tr>
</table>

<table>
<tr>
    <th>Extension Request</th>
  </tr>
  <tr>
    <td>
      You can <a href="https://github.com/kunkunsh/kunkun/discussions/new?category=extension-requests&body=%3E%20%5B!IMPORTANT%5D%0A%3E%20Upvote%20if%20you%20want%20this">Submit Extension Request</a> 
      request in the 
      <a href="https://github.com/kunkunsh/kunkun/discussions/categories/extension-requests?discussions_q=is%3Aopen+sort%3Atop+category%3A%22Extension+Requests%22">Extension Requests discussion</a> 
      section to gauge interest in your request. 
      <br/>
      If there is significant demand, the extension may be considered for implementation.
    </td>
  </tr>

</table>

<a href="https://star-history.com/#kunkunsh/kunkun&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=kunkunsh/kunkun&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=kunkunsh/kunkun&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=kunkunsh/kunkun&type=Date" />
 </picture>
</a>

## Sample Extensions

##### Kunkun Dance

![](https://i.imgur.com/PRuhafm.gif)

##### Extension Store

![](https://i.imgur.com/JypIC1Z.png)

##### Battery Health

![](https://i.imgur.com/SrIIlCa.png)

##### IP Info

![](https://i.imgur.com/6rxNyTt.png)

##### Image Format Conversion

![](https://i.imgur.com/nxaEaYW.png)

##### List of Commands

![](https://i.imgur.com/2Cv7M1i.gif)

##### Extension Details in Store (Permission Inspector)

![](https://i.imgur.com/ZztHnOT.png)

##### Video Info

![](https://i.imgur.com/imtXN2D.png)

##### Video Conversion

![](https://i.imgur.com/qhr7c7b.png)

##### 3D Git Skyline

![](https://i.imgur.com/itYe0pQ.png)

##### Letterboxd Movie Search

![](https://i.imgur.com/EQVXOym.png)

##### Key Displayer

![](https://i.imgur.com/j6nkVRH.png)

##### JWT Inspector

![](https://i.imgur.com/NHvsUvG.png)

##### Image Info

![](https://i.imgur.com/NLFXPOu.png)

##### Hacker News

![](https://i.imgur.com/dMHapVA.png)

##### QRCode Generator

![](https://i.imgur.com/1tEbTjJ.png)

##### File Transfer

![](https://i.imgur.com/LWcZvDV.png)
![](https://i.imgur.com/GAhQVmw.png)

##### Disk Speed Test

![](https://i.imgur.com/8ISVrRe.png)

##### Clipboard History

![](https://i.imgur.com/uw1hJmG.png)

## Stats

![Alt](https://repobeats.axiom.co/api/embed/7105c01eb031bd6a88897d79c8713aa4251842e9.svg "Repobeats analytics image")

<!-- Copy-paste in your Readme.md file -->

<a href="https://next.ossinsight.io/widgets/official/compose-last-28-days-stats?repo_id=882158748" target="_blank" style="display: block" align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://next.ossinsight.io/widgets/official/compose-last-28-days-stats/thumbnail.png?repo_id=882158748&image_size=auto&color_scheme=dark" width="655" height="auto">
    <img alt="Performance Stats of kunkunsh/kunkun - Last 28 days" src="https://next.ossinsight.io/widgets/official/compose-last-28-days-stats/thumbnail.png?repo_id=882158748&image_size=auto&color_scheme=light" width="655" height="auto">
  </picture>
</a>

<!-- Made with [OSS Insight](https://ossinsight.io/) -->

<!-- Copy-paste in your Readme.md file -->

<a href="https://next.ossinsight.io/widgets/official/compose-org-activity-growth-total?activity=stars&period=past_28_days&owner_id=176965503" target="_blank" style="display: block" align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://next.ossinsight.io/widgets/official/compose-org-activity-growth-total/thumbnail.png?activity=stars&period=past_28_days&owner_id=176965503&image_size=4x7&color_scheme=dark" width="657" height="auto">
    <img alt="Stars trends of kunkunsh" src="https://next.ossinsight.io/widgets/official/compose-org-activity-growth-total/thumbnail.png?activity=stars&period=past_28_days&owner_id=176965503&image_size=4x7&color_scheme=light" width="657" height="auto">
  </picture>
</a>

<!-- Made with [OSS Insight](https://ossinsight.io/) -->

<!-- Copy-paste in your Readme.md file -->

<a href="https://next.ossinsight.io/widgets/official/compose-org-overview-stars?period=past_28_days&owner_id=176965503" target="_blank" style="display: block" align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://next.ossinsight.io/widgets/official/compose-org-overview-stars/thumbnail.png?period=past_28_days&owner_id=176965503&image_size=2x6&color_scheme=dark" width="561" height="auto">
    <img alt="Overview of Stars earned of kunkunsh" src="https://next.ossinsight.io/widgets/official/compose-org-overview-stars/thumbnail.png?period=past_28_days&owner_id=176965503&image_size=2x6&color_scheme=light" width="561" height="auto">
  </picture>
</a>

<!-- Made with [OSS Insight](https://ossinsight.io/) -->
