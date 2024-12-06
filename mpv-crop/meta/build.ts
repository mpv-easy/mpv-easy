import { writeFileSync, readFileSync } from "node:fs"

const meta = "./meta/mpv-crop.meta.js"
const files = ["./bundle/mpv-crop.js", "./es5/mpv-crop.js"]

const metaStr = readFileSync(meta)
for (const p of files) {
  const s = readFileSync(p)
  writeFileSync(p, `${metaStr}\n\n${s}`)
}
