## mpv-easy

TS and React toolkit for mpv script

<div align="center">
  <img src="https://github.com/ahaoboy/musicfree-tauri/blob/main/mpv-build/public/logo.png?raw=true" alt="mpv-easy icon" width="256" height="256">
</div>

![mpv-easy](./assets/img/mpv-easy.gif)

## install

[install](./mpv-easy-react/install.md)

## CONTRIBUTING

[CONTRIBUTING](./mpv-easy-react/CONTRIBUTING.md)

## dev

bash

```bash
export MPV_CONFIG_DIR=/your_mpv_dir/portable_config/scripts && pnpm run dev-copy
```

fish

```fish
set -x MPV_CONFIG_DIR /your_mpv_dir/portable_config/scripts ; pnpm run dev-copy
```

## scripts

[mpv-easy-scripts](./mpv-easy-react/docs/index.md)

- [anime4k](./mpv-anime4k/readme.md)
- [autoload](./mpv-autoload/readme.md)
- [clipboard-play](./mpv-clipboard-play/readme.md)
- [copy-screen](./mpv-copy-screen/readme.md)
- [copy-time](./mpv-copy-time/readme.md)
- [thumbfast](./mpv-thumbfast/readme.md)
- [play-with](./mpv-play-with/readme.md)
- [translate](./mpv-translate/readme.md)
- [cut](./mpv-cut/readme.md)
- [crop](./mpv-crop/readme.md)
- [pause-mosia](./mpv-easy-react/docs/pause-mosaic.md)

## short key

| key        | command                              |
| ---------- | ------------------------------------ |
| ENTER      | cycle fullscreen                     |
| [          | script-message change-speed -0.25    |
| ]          | script-message change-speed +0.25    |
| c          | script-message cut                   |
| C          | script-message crop                  |
| o          | script-message output                |
| g          | script-message output-gif            |
| p          | script-message preview               |
| ESC        | script-message cancel                |
| UP         | script-message change-volume +10     |
| DOWN       | script-message change-volume -10     |
| ctrl+UP    | script-message change-fontSize +0.25 |
| ctrl+DOWN  | script-message change-fontSize -0.25 |
| ctrl+o     | script-message open-dialog           |
| ctrl+t     | script-message cycle-translate-mode    |
| ctrl+i     | script-message toggle-interactive-translate |
| Alt+t      | script-message toggle-auto-translate   |
| CTRL+0     | script-message Anime4K-Clear         |
| CTRL+1     | script-message Anime4K-AA-HQ         |
| CTRL+2     | script-message Anime4K-B-HQ          |
| CTRL+3     | script-message Anime4K-C-HQ          |
| CTRL+4     | script-message Anime4K-A-HQ          |
| CTRL+5     | script-message Anime4K-BB-HQ         |
| CTRL+6     | script-message Anime4K-CA-HQ         |
| CTRL+v     | script-message clipboard-play        |
| CTRL+c     | script-message copy-screen           |
| CTRL+C     | script-message copy-time             |
| CTRL+F1    | script-message toggle-tooltip        |
| MOUSE_BTN0 | script-message mouse-left-click      |
| MOUSE_BTN1 | script-message mouse-mid-click       |
| MOUSE_BTN2 | script-message mouse-right-click     |
| MOUSE_BTN3 | script-message mouse-wheel-up        |
| MOUSE_BTN4 | script-message mouse-wheel-down      |


## blogs

- [the easiest way to use anime4k in mpv](./blog/the-easiest-way-to-use-anime4k-in-mpv.md)
- [how to share video subtitles](./blog/how-to-share-video-subtitles.md)
- [maybe the simplest way to install mpv](./blog/maybe-the-simplest-way-to-install-mpv.md)
- [mpv quick start](./blog/mpv-quick-start.md)
- [make video clips with mpv-easy](./blog/make-video-clips-with-mpv-easy.md)
- [mount any playable link](./blog/mount-any-playable-link.md)
- [mpv-build: Customize your own MPV right from your browser](./blog/customize-your-own-mpv-right-from-your-browser.md)
- [Revolutionizing mpv Scripting: A New Package Format Proposal](./blog/Revolutionizing-mpv-Scripting-A-New-Package-Format-Proposal.md)
- [Introduction to MPV Shaders](././blog/Introduction-to-MPV-Shaders.md)
- [mpv-easy-piano: Can You Guess the Song?](./blog/mpv-easy-piano-Can-You-Guess-the-Song.md)
- [Running v8-v7 Benchmarks in mpv Player](./blog/Running-v8-v7-Benchmarks-in-mpv-Player)

## UI

### uosc

<div style="display: flex;">
  <img src="./assets/img/uosc-dark.webp" alt="uosc-dark"/>
  <img src="./assets/img/uosc-light.webp" alt="uosc-light"/>
</div>

### osc

<div style="display: flex;">
  <img src="./assets/img/osc-dark.webp" alt="osc-dark"/>
  <img src="./assets/img/osc-light.webp" alt="osc-light"/>
</div>

### oscx

<div style="display: flex;">
  <img src="./assets/img/oscx-dark.webp" alt="oscx-dark"/>
  <img src="./assets/img/oscx-light.webp" alt="oscx-light"/>
</div>

## example

### drag-ball

![drag-ball](./assets/img/drag-ball.gif)

### snake

![snake](./assets/img/snake.gif)

### i18n

![i18n](./assets/img/i18n.gif)

### counter-ui

![counter-ui](./assets/img/counter-ui.gif)

## config

### mouseHoverStyle

Only supports Windows, requires installation of PowerShell to enable script execution permissions

```powershell
set-executionpolicy remotesigned
```

![mouseHoverStyle](./assets/img/mouseHoverStyle.png)

## quick start

[mpv-easy-demo](https://github.com/ahaoboy/mpv-easy-demo)

[more example](./mpv-easy-react/src/example/)

[mpv-easy-tpl](https://github.com/mpv-easy/mpv-easy-tpl)


## env

| name          | description                                                     |
| ------------- | --------------------------------------------------------------- |
| SHOW_FPS      | Determines whether FPS information is displayed.                |
| MAX_FPS_FRAME | Specifies the number of recent frames used for FPS calculation. |
| FRAME_LIMIT   | Exit the player after rendering the specified number of frames. |

## nightly.link

https://nightly.link/mpv-easy/mpv-easy/workflows/release/main?preview

## Q&A

### mujs stack overflow

If your code throw a stack overflow error with mujs, you need to use the babel plugin [hack.js](./mpv-easy-react/src//babel//hack.js)
. It adds a function variable at the beginning of all functions to expand the stack size. Alternatively, you can use a custom compiled version of mujs and mpv, change mujs JS_STACKSIZE

fixed: [Increase default stack sizes.](https://github.com/ccxvii/mujs/commit/7e27931468a7c0f41b2c8a64c9cb6b069f47a5ac)

```diff
- #define JS_STACKSIZE 256	/* value stack size */

+ #define JS_STACKSIZE 1024	/* value stack size */
```

## perf

Maybe should use GitHub action to automatically update this

| js engine   | first render | average | js file size |
| ----------- | :----------: | ------: | -----------: |
| qjs         |    358ms     |  3.58ms |         1.4M |
| qjs+minify  |    334ms     |  3.42ms |         300K |
| mujs+es5    |    402 ms    | 14.05ms |         1.1M |
| deno        |    291 ms    |  0.23ms |         1.4M |
| deno+minify |    464 ms    |  0.23ms |         306K |
| boa+es6     |    400 ms    | 21.88ms |         1.2M |

## changlog

- [0.1.12](./assets/changelog/0.1.12.md)

## todo

- [ ] flex (30%)
- [ ] grid
- [ ] logo
- [ ] bilibili
- [ ] youtube
- [ ] animation
- [ ] es2022
- [ ] test
- [ ] mpv prop type
- [ ] plugin system
- [ ] menu system
- [ ] CI snapshot test
- [ ] font rem
- [ ] node console
- [ ] es/cjs plugin module
- [ ] real-time subtitle translation
- [ ] sourcemap

![star-history](https://api.star-history.com/svg?repos=mpv-easy/mpv-easy&type=Date)
