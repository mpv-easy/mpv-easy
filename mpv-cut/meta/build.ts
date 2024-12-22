import { writeFileSync, readFileSync } from "node:fs"

const meta = "./meta/cut.meta.js"
const files = ["./bundle/cut.js", "./es5/cut.js"]

const metaStr = readFileSync(meta)
for (const p of files) {
  const s = readFileSync(p)
  writeFileSync(p, `${metaStr}\n\n${s}`)
}
