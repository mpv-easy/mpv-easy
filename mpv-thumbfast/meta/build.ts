import { writeFileSync, readFileSync } from "node:fs"

const meta = "./meta/thumbfast.meta.js"
const files = ["./bundle/thumbfast.js", "./es5/thumbfast.js"]

const metaStr = readFileSync(meta)
for (const p of files) {
  const s = readFileSync(p)
  writeFileSync(p, `${metaStr}\n\n${s}`)
}
