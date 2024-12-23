import { writeFileSync, readFileSync } from "node:fs"

const meta = "./meta/anime4k.meta.js"
const files = ["./bundle/anime4k.js", "./es5/anime4k.js"]

const metaStr = readFileSync(meta)
for (const p of files) {
  const s = readFileSync(p)
  writeFileSync(p, `${metaStr}\n\n${s}`)
}
