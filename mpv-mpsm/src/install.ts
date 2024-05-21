import { join } from "path"
import { getMpsmDir } from "./config"
import { outputFileSync } from "fs-extra"
import { Meta, getMeta } from "./meta"
import { downloadJson, downloadText, getFileNameFromUrl } from "./share"

const ScriptRemoteUrl =
  "https://raw.githubusercontent.com/mpv-easy/mpsm-scripts/main/scripts.json"

export async function installFromUrl(url: string): Promise<Meta> {
  const dir = getMpsmDir()
  const text = await downloadText(url)
  const meta = getMeta(text)
  if (!meta) {
    throw new Error("script must have meta info!")
  }
  const name = getFileNameFromUrl(url)
  const p = join(dir, name)
  outputFileSync(p, text)
  return getMeta(text)!
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
