This project is still in its early stages, and API changes occur frequently. It is not recommended to use it in production projects. The goal of this project is to provide out-of-the-box utility functions and UI components for mpv JS scripts. Based on this foundation, UI interfaces for osc, uosc, and potplayer are implemented.

## dev

bash

```bash
export MPV_SCRIPT_DIR=/your_mpv_dir/portable_config/scripts && pnpm run dev
```

fish

```fish
set -x MPV_SCRIPT_DIR /your_mpv_dir/portable_config/scripts ; pnpm run dev
```

## yt-dlp

### cookie

Install the chrome extension [get-cookiestxt-locally](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc) and copy the cookie string to portable_config/yt-cookies.txt

## todo

- [ ] @reduxjs/toolkit
- [ ] router
- [ ] setting page
- [ ] dynamic enabling and disabling plugins
- [ ] vertical mode
