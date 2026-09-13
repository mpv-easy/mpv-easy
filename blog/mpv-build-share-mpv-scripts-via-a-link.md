# mpv-build: Share mpv scripts via a link

[mpv-build](https://mpv-easy.github.io/mpv-build/) is a website that packages mpv, scripts, and other extensions right in your browser.

Take the latest mpv UI script, [material-osc](https://github.com/brahmkshatriya/material-osc), as an example. With a single link [mpv-build-material-osc](https://mpv-easy.github.io/mpv-build/#mpv-build=%22%7B%5C%22state%5C%22%3A%7B%5C%22selectedRowKeys%5C%22%3A%5B%5C%22thumbfast%5C%22%5D%2C%5C%22externalList%5C%22%3A%5B%5D%2C%5C%22ui%5C%22%3A%5C%22material-osc%5C%22%2C%5C%22platform%5C%22%3A%5C%22mpv-v3%5C%22%2C%5C%22repos%5C%22%3A%5B%5D%7D%7D%22)

you can download `mpv-material-osc.zip` directly — no manual downloads, no copying files around, and no editing configs by hand.

---

## A package format you can publish once

mpv-build uses a script structure similar to [uosc](https://github.com/tomasklaen/uosc). You can read the full specification in [Revolutionizing mpv Scripting: A New Package Format Proposal](https://github.com/mpv-easy/mpv-easy/blob/main/blog/Revolutionizing-mpv-Scripting-A-New-Package-Format-Proposal.md).

All you need to do is follow the folder structure below, zip it up, and drag the archive into the browser to install it:

```
├── fonts
│   ├── material-osc_google_sans_flex.ttf
│   └── material-osc_icons.otf
├── script.json
└── scripts
    └── main.lua
```

The `script.json` file holds the package name and a stable download link:

```json
{
  "name": "material-osc",
  "download": "https://github.com/brahmkshatriya/material-osc/releases/latest/download/material-osc.zip",
  "description": "Quality of life OSC for MPV",
  "author": "brahmkshatriya",
  "homepage": "https://github.com/brahmkshatriya/material-osc"
}
```

If your repository already uses this structure, you can paste the GitHub repository URL into the search box and mpv-build will package the script for you automatically — no zip needed.

---

## Bundled extensions

mpv-build also supports a number of commonly used extensions, such as `ffmpeg`, `yt-dlp`, and `deno`. You can even add Python support to mpv through a script.

The link below downloads an mpv package with Python support, along with a test script that checks the Python version: [mpv-build-python](https://mpv-easy.github.io/mpv-build/#mpv-build=%22%7B%5C%22state%5C%22%3A%7B%5C%22selectedRowKeys%5C%22%3A%5B%5C%22mpv-python314%5C%22%2C%5C%22mpv-python-test%5C%22%5D%2C%5C%22externalList%5C%22%3A%5B%5D%2C%5C%22ui%5C%22%3A%5C%22osc%5C%22%2C%5C%22platform%5C%22%3A%5C%22mpv-v3%5C%22%2C%5C%22repos%5C%22%3A%5B%5D%7D%7D%22)

---

## Contributing a script

Want to add a new script? Open a pull request or an issue in either the [mpv-easy](https://github.com/mpv-easy/mpv-easy) or [mpsm-scripts](https://github.com/mpv-easy/mpsm-scripts) repository.
