import chalk from "chalk"
import { getAllScript } from "./config"

export function list() {
  const metaList = getAllScript()
  for (const meta of metaList) {
    const v: string[] = []
    v.push(chalk.green(meta.name))
    if (meta.author?.length) {
      v.push(`@${chalk.green(meta.author)}`)
    }
    if (meta.version?.length) {
      v.push(`(${chalk.green(meta.version)})`)
    }
    console.log(v.join(""))
  }
}
