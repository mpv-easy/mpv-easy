import { getAllScript } from "./config"
import { removeSync } from "fs-extra"
import chalk from "chalk"

export async function uninstall(scripts: string[]) {
  const metaList = await getAllScript()
  for (const name of scripts) {
    const meta = metaList.find((i) => i.name === name)

    if (!meta) {
      console.log(`not found script: ${chalk.green(name)}`)
      process.exit()
    }

    removeSync(meta.filePath)
    console.log(
      `${chalk.green(meta.name)}(${meta.version}) Successfully uninstalled`,
    )
  }
}
