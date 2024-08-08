import { build } from "esbuild"
import fs from "node:fs"

build({
  entryPoints: ["./src/mpv-easy-*.ts"],
  bundle: true,
  outdir: "bundle",
  minify: true,

  // TODO: solid not support node platform?
  // platform:"node",
  charset: "utf8",
  define: {
    "globalThis.version": '"0.1.9"',
    "process.env.NODE_ENV": '"production"',
  },
  metafile: true,
})
  .then((r) => {
    fs.writeFileSync("./bundle/metafile.json", JSON.stringify(r.metafile))
  })
  .catch(() => process.exit(1))
