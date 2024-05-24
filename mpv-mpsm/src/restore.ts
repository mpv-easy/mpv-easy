import { readFileSync } from "fs-extra"
import { installFromUrl } from "./install"
import chalk from "chalk"

export async function restore(file: string) {
  const list = readFileSync(file, "utf8")
  const json = JSON.parse(list) as string[]

  for (const url of json) {
    const meta = await installFromUrl(url)
    console.log(
      `${chalk.green(meta.name)}(${meta.version}) Successfully restored`,
    )
  }
}
