# the easiest way to use anime4k in mpv

It only takes two steps:
- download [anime4k.js](https://github.com/mpv-easy/mpv-easy/releases) and copy it to `<mpv-home>/portable_config/scripts/anime4k.js`
- add the [shortkey](https://github.com/mpv-easy/mpv-easy/tree/main/mpv-anime4k#shortkey) eg:`CTRL+6    script-message Anime4K-CA-HQ` in `<mpv-home>/portable_config/input.conf`

That’s all.

## how it works

Thanks to `esbuild` and `babel`, we can pack all different types of resources into one js file, which is why `anime4k.js` is so large. `anime4k.js` contains all the shader codes of anime4k, which will be copied to a local temporary folder when running.(of course `anime4k.js` will detect if it has already been copied and skip it).


For more details, visit the: https://github.com/mpv-easy/mpv-easy/tree/main/mpv-anime4k

Youtube video: [mpv anime4k quick start](https://www.youtube.com/watch?v=3ijL8FEClP8)

[![Watch the video](https://img.youtube.com/vi/3ijL8FEClP8/maxresdefault.jpg)](https://www.youtube.com/watch?v=3ijL8FEClP8)
