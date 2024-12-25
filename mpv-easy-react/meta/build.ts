import { writeFileSync, readFileSync, readdirSync } from "node:fs"
import fs from "node:fs"
import path from "node:path"

const bundleDir = "bundle"
const metadir = "meta"
const es5Dir = "es5"

for (const dir of [bundleDir, es5Dir]) {
  for (const fileName of fs.readdirSync(dir)) {
    if (!fileName.endsWith(".js")) {
      continue
    }
    const name = fileName.split(".")[0]
    const jsPath = path.join(dir, fileName)
    const jsCode = fs.readFileSync(jsPath, "utf-8")
    const metaPath = path.join(metadir, `${name}.meta.js`)
    const metaCode = fs.readFileSync(metaPath, "utf-8")
    writeFileSync(jsPath, [metaCode, jsCode].join("\n\n"))
  }
}
