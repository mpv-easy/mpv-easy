## usage

- download [mpv-deno-windows.dll](https://github.com/mpv-easy/mpv-easy/releases)
- copy `mpv-deno-windows.dll` to `<mpv-dir>/portable_config/scripts/mpv-deno-windows.dll`
- copy js script to `<mpv-dir>/portable_config/scripts-deno`

## performance

The performance of deno is about 100 times that of mujs. It takes 10ms for mujs to render a frame, while deno only takes 0.1 ms.

https://github.com/ahaoboy/js-engine-benchmark

## todo
- [ ] mouse and key event