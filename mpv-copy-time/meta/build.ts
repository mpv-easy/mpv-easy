import { writeFileSync, readFileSync } from "node:fs"

const meta = "./meta/mpv-copy-time.meta.js"
const files = ["./bundle/mpv-copy-time.js", "./es5/mpv-copy-time.js"]

const metaStr = readFileSync(meta)
for (const p of files) {
  const s = readFileSync(p)
  writeFileSync(p, `${metaStr}\n\n${s}`)
}
