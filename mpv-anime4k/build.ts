import { build } from "esbuild"
import fs from "node:fs"

build({
  entryPoints: ["./src/anime4k.ts"],
  bundle: true,
  outdir: "bundle",
  minify: true,
  loader: {
    ".glsl": "text",
  },
  charset: "utf8",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  metafile: true,
})
  .then((r) => {
    fs.writeFileSync("./bundle/metafile.json", JSON.stringify(r.metafile))
  })
  .catch(() => process.exit(1))
