import { writeFileSync, readFileSync } from "node:fs"

const meta = "./meta/mpv-autoload.meta.js"
const files = ["./bundle/mpv-autoload.js", "./es5/mpv-autoload.js"]

const metaStr = readFileSync(meta)
for (const p of files) {
  const s = readFileSync(p)
  writeFileSync(p, `${metaStr}\n\n${s}`)
}
