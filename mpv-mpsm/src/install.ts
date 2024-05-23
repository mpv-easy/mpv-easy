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
import { existsSync, readFileSync } from "fs-extra"
const ScriptRemoteUrl =
  "https://raw.githubusercontent.com/mpv-easy/mpsm-scripts/main/scripts.json"

export async function installFromUrl(url: string): Promise<Meta> {
  const dir = getMpsmDir()
  const text = await downloadText(url)
  const meta = getMeta(text)
  const name = getFileNameFromUrl(url)
  if (!meta) {
    console.log(
      `script ${url} don't have meta info. see: https://github.com/mpv-easy/mpsm-scripts?tab=readme-ov-file#meta-info`,
    )
    process.exit()
  }

  const p = join(dir, name)

  if (
    !existsSync(p) ||
    getMeta(readFileSync(p, "utf8"))?.version !== meta.version
  ) {
    outputFileSync(p, text)
  }
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
    console.log(
      `${chalk.green(meta.name)}(${meta.version}) Successfully installed `,
    )
  }
}
