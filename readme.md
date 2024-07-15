## mpv-easy

TS and React toolkit for mpv script
![mpv-easy](./assets/img/mpv-easy.gif)

## install

[install](./mpv-easy/install.md)

## CONTRIBUTING

[CONTRIBUTING](./mpv-easy/CONTRIBUTING.md)

## dev

bash

```bash
export MPV_SCRIPT_DIR=/your_mpv_dir/portable_config/scripts && pnpm run dev
```

fish

```fish
set -x MPV_SCRIPT_DIR /your_mpv_dir/portable_config/scripts ; pnpm run dev
```

## plugin

- [mpv-anime4k](./mpv-anime4k/readme.md)
- [mpv-autoload](./mpv-autoload/readme.md)
- [mpv-clip-play](./mpv-clip-play/readme.md)
- [mpv-copy-screen](./mpv-copy-screen/readme.md)
- [mpv-copy-time](./mpv-copy-time/readme.md)
- [mpv-thumbfast](./mpv-thumbfast/readme.md)
- [mpv-play-with](./mpv-play-with/readme.md)

## short key

ctrl+o: open dialog select file

ctrl+up: Increase font size

ctrl+down: decrease font size

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

[more example](./mpv-easy/src/example/)

## Q&A

### mujs stack overflow

If your code throw a stack overflow error with mujs, you need to use the babel plugin [hack.js](./mpv-easy/src//babel//hack.js)
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
