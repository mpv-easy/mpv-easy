import { build } from "esbuild"
import fs from "node:fs"

build({
  entryPoints: ["./src/index.tsx"],
  bundle: true,
  minify: true,
  outfile: "./bundle/mpv-easy-tpl.js",
  charset: "utf8",
  define: {
    "globalThis.version": '"0.1.12"',
    "process.env.NODE_ENV": '"production"',
  },
  metafile: true,
})
  .then((r) => {
    fs.writeFileSync("./bundle/metafile.json", JSON.stringify(r.metafile))
  })
  .catch(() => process.exit(1))
