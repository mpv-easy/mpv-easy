import chalk from "chalk"
import { getAllScript } from "./config"
import { installFromScript } from "./install"
import { downloadJson } from "./share"
import { Script } from "./meta"
import { ScriptRemoteUrl } from "./const"

export async function updateByName(
  name: string,
  metaList = getAllScript(),
  configDir?: string,
) {
  const meta = metaList.find((i) => i.name === name)

  if (!meta) {
    console.log(`not found script: ${chalk.green(name)}`)
    process.exit()
  }

  const json = await downloadJson<Record<string, Script>>(ScriptRemoteUrl)
  const newScript = json[name]

  if (newScript.version !== meta.version) {
    await installFromScript(meta, configDir)
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

export async function update(
  list: string[],
  configDir?: string,
  metaList = getAllScript(configDir),
) {
  for (const name of list) {
    await updateByName(name, metaList, configDir)
  }
}

export async function updateAll(
  configDir?: string,
  metaList = getAllScript(configDir),
) {
  update(
    metaList.map((i) => i.name),
    configDir,
    metaList,
  )
}
