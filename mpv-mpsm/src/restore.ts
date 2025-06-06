import { readFileSync } from "fs-extra"
import { installFromScript } from "./install"
import chalk from "chalk"
import { Script } from "./meta"

export async function restore(file: string) {
  const list = readFileSync(file, "utf8")
  const json = JSON.parse(list) as Script[]

  for (const script of json) {
    await installFromScript(script)
    console.log(
      `${chalk.green(script.name)}(${script.version}) Successfully restored`,
    )
  }
}
