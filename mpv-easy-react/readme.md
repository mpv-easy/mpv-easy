This project is still in its early stages, and API changes occur frequently. It is not recommended to use it in production projects. The goal of this project is to provide out-of-the-box utility functions and UI components for mpv JS scripts. Based on this foundation, UI interfaces for osc, uosc, and potplayer are implemented.

## dev

bash

```bash
export MPV_SCRIPT_DIR=/your_mpv_dir/portable_config/scripts && pnpm run dev-copy
```

fish

```fish
set -x MPV_SCRIPT_DIR /your_mpv_dir/portable_config/scripts ; pnpm run dev-copy
```

powershell

```pwsh
$env:MPV_SCRIPT_DIR = "/your_mpv_dir/portable_config/scripts"; pnpm run dev-copy
```

## todo

- [ ] @reduxjs/toolkit
- [ ] router
- [ ] setting page
- [ ] dynamic enabling and disabling plugins
- [ ] vertical mode
