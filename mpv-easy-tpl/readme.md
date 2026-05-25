## dev
bash
```bash
export MPV_CONFIG_DIR=/your_mpv_dir/portable_config/scripts && pnpm run dev
```

fish
```fish
set -x MPV_CONFIG_DIR /your_mpv_dir/portable_config/scripts ; pnpm run dev
```
## Online Editor (StackBlitz)

You can write and build mpv scripts directly in your browser via StackBlitz — no local setup required.

1. Open the project in StackBlitz:

   [stackblitz](https://stackblitz.com/github/mpv-easy/mpv-easy-tpl?file=src%2Findex.tsx)

2. Build the script (outputs to the `es5` folder):

   ```bash
   pnpm build
   ```

   This bundles and transpiles your code, generating the output script in the `es5/` directory.

3. Package and download as a zip:

   ```bash
   pnpm build:osc
   ```

   This creates `easy-react-tpl-osc.zip` containing the mpv portable config with your script bundled inside.

   Alternatively, start a local download page to browse and download zip files:

   ```bash
   pnpm download
   ```

   This starts an HTTP server at `http://localhost:3000` displaying all zip files in the project — click any file name to download it.

4. Extract the zip and place the scripts into your mpv scripts folder to use them.