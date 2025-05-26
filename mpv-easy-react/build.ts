import { build } from "esbuild"
import fs from "node:fs"

build({
  entryPoints: ["./scripts/*.{tsx,ts}"],
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
    "globalThis.version": '"0.1.14"',
    "process.env.NODE_ENV": '"production"',
  },
  metafile: true,
})
  .then((r) => {
    fs.writeFileSync("./bundle/metafile.json", JSON.stringify(r.metafile))
  })
  .catch(() => process.exit(1))
