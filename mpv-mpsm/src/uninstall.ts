import { getScriptsDir } from "./config"
import { removeSync } from "fs-extra"
import chalk from "chalk"
import { existsSync } from "node:fs"
import { join } from "node:path"

export async function uninstall(scripts: string[]) {
  const dir = await getScriptsDir()
  for (const name of scripts) {
    const scriptPath = join(dir, name)
    if (existsSync(scriptPath)) {
      removeSync(scriptPath)
      console.log(`${chalk.green(name)} Successfully uninstalled`)
    } else {
      console.log(`not found script: ${chalk.green(name)}`)
    }
  }
}
