import { writeFileSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { getMetaByLang, Meta } from "@mpv-easy/mpsm"

const META_DIR = "public/meta"

const v: Record<string, Meta> = {}

for (const i of readdirSync(META_DIR)) {
  const p = join(META_DIR, i)
  const s = readFileSync(p, "utf8")
  const json = getMetaByLang(s, "js")!
  v[i.replace(".meta.js", "")] = json
}

writeFileSync("./src/meta.json", JSON.stringify(v))
