import { writeFileSync, readFileSync } from "node:fs"

const meta = "./meta/autoload.meta.js"
const files = ["./bundle/autoload.js", "./es5/autoload.js"]

const metaStr = readFileSync(meta)
for (const p of files) {
  const s = readFileSync(p)
  writeFileSync(p, `${metaStr}\n\n${s}`)
}
