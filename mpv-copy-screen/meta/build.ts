import { writeFileSync, readFileSync } from "node:fs"

const meta = "./meta/copy-screen.meta.js"
const files = ["./bundle/copy-screen.js", "./es5/copy-screen.js"]

const metaStr = readFileSync(meta)
for (const p of files) {
  const s = readFileSync(p)
  writeFileSync(p, `${metaStr}\n\n${s}`)
}
