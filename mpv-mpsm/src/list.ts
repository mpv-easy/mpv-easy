import chalk from "chalk"
import { getAllScript } from "./config"

export function list() {
  const metaList = getAllScript()
  for (const meta of metaList) {
    const info = `${chalk.green(meta.name)}@${meta.author}(${meta.version}): ${
      meta.description
    }`
    console.log(info)
  }
}
