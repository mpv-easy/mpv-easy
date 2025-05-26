import { join } from "node:path"
import { getMpsmDir } from "./config"
import { outputFileSync } from "fs-extra"
import { type Script, addScript, getScript } from "./meta"
import {
  downloadJson,
  downloadText,
  getFileNameFromUrl,
  isScript,
} from "./share"
import chalk from "chalk"
import { existsSync, readFileSync } from "fs-extra"
import { ScriptRemoteUrl } from "./const"
import { isRemote } from "@mpv-easy/tool"

export async function installFromUrl(
  url: string,
  preferScript?: Script | undefined,
): Promise<Script> {
  if (isScript(url)) {
    return installFromScript(url)
  }

  const dir = getMpsmDir()
  const text = await downloadText(url)
  const rawScript = getScript(text)
  const meta = preferScript ?? rawScript
  if (!meta) {
    console.log(
      `script ${url} don't have meta info. see: https://github.com/mpv-easy/mpsm-scripts?tab=readme-ov-file#meta-info`,
    )
    process.exit()
  }
  const name = getFileNameFromUrl(url)
  const p = join(dir, name)

  if (
    !existsSync(p) ||
    getScript(readFileSync(p, "utf8"))?.version !== meta.version
  ) {
    const outputText = !rawScript ? addScript(text, meta) : text
    outputFileSync(p, outputText)
  }

  return meta
}

export async function installFromMpsm(name: string) {
  const json = await downloadJson<Record<string, string>>(ScriptRemoteUrl)
  const url = json[name]
  if (!url) {
    console.log(`not found script ${chalk.green(name)}`)
    process.exit()
  }
  return installFromUrl(url)
}

export async function installFromScript(url: string): Promise<Script> {
  const text = await downloadText(url)
  const meta = getScript(text)

  if (!meta) {
    console.log(`${url} don't have meta info`)
    process.exit()
  }

  const downloadUrl = meta.downloadURL
  await installFromUrl(downloadUrl, meta)
  return meta
}

export async function install(scripts: string[]) {
  for (const name of scripts) {
    const meta = await (isRemote(name)
      ? installFromUrl(name)
      : installFromMpsm(name))

    console.log(
      `${chalk.green(meta.name)}(${meta.version}) Successfully installed`,
    )
  }
}
