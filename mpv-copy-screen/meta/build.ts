import { writeFileSync, readFileSync } from "node:fs"

const meta = "./meta/mpv-copy-screen.meta.js"
const files = ["./bundle/mpv-copy-screen.js", "./es5/mpv-copy-screen.js"]

const metaStr = readFileSync(meta)
for (const p of files) {
  const s = readFileSync(p)
  writeFileSync(p, `${metaStr}\n\n${s}`)
}
