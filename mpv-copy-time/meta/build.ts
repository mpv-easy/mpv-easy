import { writeFileSync, readFileSync } from "node:fs"

const meta = "./meta/copy-time.meta.js"
const files = ["./bundle/copy-time.js", "./es5/copy-time.js"]

const metaStr = readFileSync(meta)
for (const p of files) {
  const s = readFileSync(p)
  writeFileSync(p, `${metaStr}\n\n${s}`)
}
