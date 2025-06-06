import { outputFileSync } from "fs-extra"
import { getAllScript } from "./config"

export function backup(file?: string) {
  const metaList = getAllScript()
  const json = JSON.stringify(metaList)
  if (file?.length) {
    outputFileSync(file, json, "utf8")
  } else {
    console.log(json)
  }
}
