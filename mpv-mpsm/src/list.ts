import { getAllScript } from "./config"

export function list() {
  const metaList = getAllScript()
  for (const meta of metaList) {
    const info = `${meta.name}@${meta.author}(${meta.version}): ${meta.description}`
    console.log(info)
  }
}
