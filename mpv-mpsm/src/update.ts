import { getAllScript } from "./config"
import { installFromUrl } from "./install"

export async function updateByName(name: string, metaList = getAllScript()) {
  const meta = metaList.find((i) => i.name === name)

  if (!meta) {
    throw new Error(`not found script: ${name}`)
  }

  const url = meta.downloadURL
  const newMeta = await installFromUrl(url)
  console.log(
    `update script "${meta.name}" from ${meta.version} to ${newMeta.version}`,
  )
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
