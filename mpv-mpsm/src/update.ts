import chalk from "chalk"
import { getAllScript } from "./config"
import { installFromUrl } from "./install"

export async function updateByName(name: string, metaList = getAllScript()) {
  const meta = metaList.find((i) => i.name === name)

  if (!meta) {
    console.log(`not found script: ${chalk.green(name)}`)
    process.exit()
  }

  const url = meta.update || meta.download
  const newScript = await installFromUrl(url)

  if (newScript.version !== meta.version) {
    console.log(
      `update ${chalk.green(meta.name)} from ${meta.version} to ${
        newScript.version
      }`,
    )
  } else {
    console.log(
      `${chalk.green(meta.name)}(${
        meta.version
      }) is already the latest version`,
    )
  }
}

export async function update(list: string[], metaList = getAllScript()) {
  for (const name of list) {
    await updateByName(name, metaList)
  }
}

export async function updateAll(metaList = getAllScript()) {
  update(
    metaList.map((i) => i.name),
    metaList,
  )
}
