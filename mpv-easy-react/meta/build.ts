import { writeFileSync, readFileSync, readdirSync } from "node:fs"

const data = {
  es5: {
    meta: "./meta/mpv-easy-es5.meta.js",
    files: ["./bundle/mpv-easy-es5.js", "./es5/mpv-easy-es5.js"],
  },
  es6: {
    meta: "./meta/mpv-easy-es6.meta.js",
    files: ["./bundle/mpv-easy-es6.js", "./es5/mpv-easy-es6.js"],
  },
}

for (const { meta, files } of Object.values(data)) {
  const metaStr = readFileSync(meta)
  for (const p of files) {
    const s = readFileSync(p)
    writeFileSync(p, `${metaStr}\n\n${s}`)
  }
}
