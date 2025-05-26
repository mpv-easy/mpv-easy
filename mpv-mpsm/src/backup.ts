import { outputFileSync } from "fs-extra"
import { getAllScript } from "./config"

export function backup(file: string) {
  const metaList = getAllScript().map((i) => i.update || i.download)
  const json = JSON.stringify(metaList)
  outputFileSync(file, json, "utf8")
}
