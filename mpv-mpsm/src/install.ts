import { join } from "path"
import { getMpsmDir } from "./config"
import { outputFileSync } from "fs-extra"
import { Meta, getMeta } from "./meta"
import {
  downloadJson,
  downloadText,
  getFileNameFromUrl,
  isRemote,
} from "./share"
import chalk from "chalk"
const ScriptRemoteUrl =
  "https://raw.githubusercontent.com/mpv-easy/mpsm-scripts/main/scripts.json"

export async function installFromUrl(url: string): Promise<Meta> {
  const dir = getMpsmDir()
  const text = await downloadText(url)
  const meta = getMeta(text)
  if (!meta) {
    console.log(`script ${url} don't have meta info`)
    process.exit()
  }
  const name = getFileNameFromUrl(url)
  const p = join(dir, name)
  outputFileSync(p, text)

  return meta
}

export async function installFromMpsm(name: string) {
  const json = await downloadJson<Record<string, string>>(ScriptRemoteUrl)
  const url = json[name]
  if (!url) {
    console.log(`not found script: ${chalk.green(name)}`)
    process.exit()
  }
  return installFromUrl(url)
}
export async function install(scripts: string[]) {
  for (const name of scripts) {
    const meta = await (isRemote(name)
      ? installFromUrl(name)
      : installFromMpsm(name))
    console.log(`${chalk.green(meta.nam)} Successfully installed `)
  }
}
