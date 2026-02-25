import { outputFileSync } from "fs-extra"
import { getAllScript } from "./config"

export function backup(file?: string, configDir?: string) {
  const metaList = getAllScript(configDir)
  const json = JSON.stringify(metaList)
  if (file?.length) {
    outputFileSync(file, json, "utf8")
  } else {
    console.log(json)
  }
}
