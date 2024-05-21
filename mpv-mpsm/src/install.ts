import { join } from "path"
import { getMpsmDir } from "./config"
import { outputFileSync } from "fs-extra"
import { getMeta } from "./meta"
import { downloadJson, downloadText } from "./share"

const ScriptRemoteUrl =
  "https://raw.githubusercontent.com/mpv-easy/mpsm-scripts/main/scripts.json"

export async function installFromUrl(url: string) {
  const dir = getMpsmDir()
  const text = await downloadText(url)
  const meta = getMeta(text)
  if (!meta) {
    throw new Error("script must have meta info!")
  }
  const name = url.split("/").at(-1)!
  const p = join(dir, name)
  outputFileSync(p, text)
}

export async function installFromMpsm(name: string) {
  const json = await downloadJson<Record<string, string>>(ScriptRemoteUrl)
  const url = json[name]
  if (!url) {
    throw new Error(`not found script: ${name}`)
  }
  installFromUrl(url)
}
export async function install(scripts: string[]) {
  for (const name of scripts) {
    if (name.startsWith("http:") || name.startsWith("https:")) {
      installFromUrl(name)
    } else {
      installFromMpsm(name)
    }
  }
}
