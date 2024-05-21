import { join } from "path"
import { getMpsmDir } from "./config"
import { readdirSync, existsSync, readFileSync, statSync } from "fs-extra"
import { Meta, getMeta } from "./meta"

export function list() {
  const dir = getMpsmDir()
  if (!existsSync(dir)) {
    return
  }
  const metaList: Meta[] = []
  for (const name of readdirSync(dir)) {
    const jsPath = join(dir, name)
    if (!existsSync(jsPath) || !statSync(jsPath).isFile()) {
      continue
    }
    const text = readFileSync(jsPath, "utf8")
    const meta = getMeta(text)
    if (meta) {
      metaList.push(meta)
    }
  }

  for (const meta of metaList) {
    const info = `${meta.name}@${meta.author}(${meta.version}): ${meta.description}`
    console.log(info)
  }
}
