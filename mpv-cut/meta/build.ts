import { writeFileSync, readFileSync } from "node:fs"

const meta = "./meta/mpv-cut.meta.js"
const files = ["./bundle/mpv-cut.js", "./es5/mpv-cut.js"]

const metaStr = readFileSync(meta)
for (const p of files) {
  const s = readFileSync(p)
  writeFileSync(p, `${metaStr}\n\n${s}`)
}
