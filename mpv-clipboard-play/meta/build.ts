import { writeFileSync, readFileSync } from "node:fs"

const meta = "./meta/clipboard-play.meta.js"
const files = ["./bundle/clipboard-play.js", "./es5/clipboard-play.js"]

const metaStr = readFileSync(meta)
for (const p of files) {
  const s = readFileSync(p)
  writeFileSync(p, `${metaStr}\n\n${s}`)
}
