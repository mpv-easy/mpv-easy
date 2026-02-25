import { build } from "esbuild"
import fs from "node:fs"

build({
  entryPoints: ["./scripts/*"],
  // entryPoints: ["./scripts/mpv-easy.tsx"],
  bundle: true,
  outdir: "bundle",
  minify: true,
  loader: {
    ".glsl": "text",
    ".png": "base64",
  },
  charset: "utf8",
  define: {
    "globalThis.version": '"0.1.15-alpha.20"',
    "process.env.NODE_ENV": '"production"',
  },
  metafile: true,
  format: "esm",
})
  .then((r) => {
    fs.writeFileSync("./bundle/metafile.json", JSON.stringify(r.metafile))
  })
  .catch(() => process.exit(1))
