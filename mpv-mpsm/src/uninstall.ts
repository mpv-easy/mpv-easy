import { join } from "path"
import { getMpsmDir } from "./config"
import { removeSync, existsSync, readFileSync } from "fs-extra"
import { getMeta } from "./meta"

export function uninstall(scripts: string[]) {
  const dir = getMpsmDir()
  for (const i of scripts) {
    const p = join(dir, `${i}.js`)

    if (!existsSync(p)) {
      return
    }

    const text = readFileSync(p, "utf8")
    const meta = getMeta(text)

    if (!meta) {
      return
    }

    removeSync(p)
  }
}
