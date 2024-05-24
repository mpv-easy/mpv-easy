import { join } from "path"
import { getMpsmDir } from "./config"
import { outputFileSync } from "fs-extra"
import { Meta, addMeta, getMeta } from "./meta"
import {
  downloadJson,
  downloadText,
  getFileNameFromUrl,
  getLang,
  isMeta,
  isRemote,
} from "./share"
import chalk from "chalk"
import { existsSync, readFileSync } from "fs-extra"
import { ScriptRemoteUrl } from "./const"

export async function installFromUrl(
  url: string,
  preferMeta?: Meta | undefined,
): Promise<Meta> {
  if (isMeta(url)) {
    return installFromMeta(url)
  }

  const dir = getMpsmDir()
  const text = await downloadText(url)
  const rawMeta = getMeta(text)
  const meta = preferMeta ?? rawMeta
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
    getMeta(readFileSync(p, "utf8"))?.version !== meta.version
  ) {
    const outputText = !rawMeta ? addMeta(text, meta) : text
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

export async function installFromMeta(url: string): Promise<Meta> {
  const text = await downloadText(url)
  const meta = getMeta(text)

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
