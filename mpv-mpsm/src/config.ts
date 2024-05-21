import { join } from "path"
import { outputJsonSync, readJsonSync, existsSync } from "fs-extra"

export const ConfigFileName = "mpsm-config.json"
export const ConfigPath = join(__dirname, ConfigFileName)

export type Config = {
  scriptDir: string
}

export function setScriptDir(scriptDir: string) {
  outputJsonSync(ConfigPath, {
    scriptDir: scriptDir.replaceAll('\\', '/'),
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
    throw new Error("You must first execute \"mpsm set-script-dir '<your-mpv-dir>/portable_config/scripts'\" and make sure the directory is correct")
  }
}