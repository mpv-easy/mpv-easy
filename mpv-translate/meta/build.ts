import { writeFileSync, readFileSync } from "node:fs"

const meta = "./meta/mpv-translate.meta.js"
const files = ["./bundle/mpv-translate.js", "./es5/mpv-translate.js"]

const metaStr = readFileSync(meta)
for (const p of files) {
  const s = readFileSync(p)
  writeFileSync(p, `${metaStr}\n\n${s}`)
}
