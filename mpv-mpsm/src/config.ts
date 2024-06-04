import { join } from "node:path"
import {
  outputJsonSync,
  readJsonSync,
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "fs-extra"
import { type Meta, getMeta } from "./meta"
import chalk from "chalk"

export const ConfigFileName = "mpsm-config.json"
export const ConfigPath = join(__dirname, ConfigFileName)

export type Config = {
  scriptDir: string
}

export function setScriptDir(scriptDir: string) {
  outputJsonSync(ConfigPath, {
    scriptDir: scriptDir.replaceAll("\\", "/"),
  })
}

export function getScriptDir(): string {
  const config = readJsonSync(ConfigPath)
  return config.scriptDir
}

export function getMpsmDir(): string {
  return getScriptDir()
}

export function configDetect() {
  if (!existsSync(ConfigPath)) {
    console.log(
      `You must first execute "${chalk.green(
        "mpsm set-script-dir '<your-mpv-dir>/portable_config/scripts",
      )}" and make sure the directory is correct`,
    )
    process.exit()
  }
}

export function getAllScript(): (Meta & { filePath: string })[] {
  const dir = getMpsmDir()
  const metaList: (Meta & { filePath: string })[] = []

  if (!existsSync(dir)) {
    return metaList
  }

  for (const name of readdirSync(dir)) {
    const scriptPath = join(dir, name)
    if (!existsSync(scriptPath) || !statSync(scriptPath).isFile()) {
      continue
    }
    const text = readFileSync(scriptPath, "utf8")
    const meta = getMeta(text)
    if (meta) {
      metaList.push({ ...meta, filePath: scriptPath })
    }
  }
  return metaList
}
