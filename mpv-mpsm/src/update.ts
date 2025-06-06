import chalk from "chalk"
import { getAllScript } from "./config"
import { installFromScript } from "./install"
import { downloadJson } from "./share"
import { Script } from "./meta"
import { ScriptRemoteUrl } from "./const"

export async function updateByName(name: string, metaList = getAllScript()) {
  const meta = metaList.find((i) => i.name === name)

  if (!meta) {
    console.log(`not found script: ${chalk.green(name)}`)
    process.exit()
  }

  const json = await downloadJson<Record<string, Script>>(ScriptRemoteUrl)
  const newScript = json[name]

  if (newScript.version !== meta.version) {
    await installFromScript(meta)
    const v = [`update ${chalk.green(meta.name)}`]
    if (newScript.version) {
      v.push(`from ${meta.version} to ${newScript.version}`)
    }
    console.log(v.join(" "))
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
