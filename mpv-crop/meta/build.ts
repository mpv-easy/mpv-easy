import { writeFileSync, readFileSync } from "node:fs"

const meta = "./meta/crop.meta.js"
const files = ["./bundle/crop.js", "./es5/crop.js"]

const metaStr = readFileSync(meta)
for (const p of files) {
  const s = readFileSync(p)
  writeFileSync(p, `${metaStr}\n\n${s}`)
}
