import { build } from "esbuild"
import fs from "node:fs"

build({
  entryPoints: ["./src/cut.ts"],
  bundle: true,
  outdir: "bundle",
  minify: true,

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
