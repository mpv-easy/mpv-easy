import { build } from "esbuild"
import fs from "node:fs"

build({
  entryPoints: ["./src/index.tsx"],
  bundle: true,
  minify: true,
  outfile: "./bundle/mpv-easy-tpl.js",
  charset: "utf8",
  define: {
    "globalThis.version": '"v0.1.15-alpha.12"',
    "process.env.NODE_ENV": '"production"',
  },
  metafile: true,
  format: "esm",
})
  .then((r) => {
    fs.writeFileSync("./bundle/metafile.json", JSON.stringify(r.metafile))
  })
  .catch(() => process.exit(1))
