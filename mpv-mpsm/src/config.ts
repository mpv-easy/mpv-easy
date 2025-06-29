import { join, resolve } from "node:path"
import {
  outputJsonSync,
  readJsonSync,
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "fs-extra"
import { type Script } from "./meta"
import chalk from "chalk"

export const ConfigFileName = "mpsm-config.json"
export const ConfigPath = join(__dirname, ConfigFileName)

export type Config = {
  scriptDir: string
}

export function setConfigDir(configDir: string) {
  outputJsonSync(ConfigPath, {
    configDir: resolve(configDir).replaceAll("\\", "/"),
  })
}

export function getScriptsDir(): string {
  const config = readJsonSync(ConfigPath)
  return join(getConfigDir(), "scripts")
}

export function getConfigDir(): string {
  const config = readJsonSync(ConfigPath)
  return config.configDir
}

export function getMpsmDir(): string {
  return getScriptsDir()
}

export function configDetect() {
  if (!existsSync(ConfigPath)) {
    console.log(
      `You must first execute "${chalk.green(
        "mpsm set-config-dir '<your-mpv-dir>/portable_config'",
      )}" and make sure the directory is correct`,
    )
    process.exit()
  }
}

export function getAllScript(): (Script & { filePath: string })[] {
  const dir = getMpsmDir()
  const metaList: (Script & { filePath: string })[] = []

  if (!existsSync(dir)) {
    return metaList
  }

  for (const name of readdirSync(dir)) {
    const scriptPath = join(dir, name)
    if (!existsSync(scriptPath) || !statSync(scriptPath).isFile()) {
      const jsonPath = join(scriptPath, "script.json")
      if (existsSync(jsonPath) && statSync(jsonPath).isFile()) {
        const json = JSON.parse(readFileSync(jsonPath, "utf8"))
        metaList.push(json)
      }
    }
  }
  return metaList
}
