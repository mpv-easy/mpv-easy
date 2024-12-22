import { writeFileSync, readFileSync } from "node:fs"

const meta = "./meta/translate.meta.js"
const files = ["./bundle/translate.js", "./es5/translate.js"]

const metaStr = readFileSync(meta)
for (const p of files) {
  const s = readFileSync(p)
  writeFileSync(p, `${metaStr}\n\n${s}`)
}
