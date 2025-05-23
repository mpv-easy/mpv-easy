export type Meta = {
  name: string
  version?: string
  description: string
  author: string
  downloadURL: string
  updateURL?: string
  url?: string
}

export function getMetaByLang(
  text: string,
  lang: "js" | "lua",
): undefined | Meta {
  const jsBlocksReg =
    /\B(\/\/ ==UserScript==\r?\n([\S\s]*?)\r?\n\/\/ ==\/UserScript==)([\S\s]*)/

  const luaBlocksReg =
    /\B(-- ==UserScript==\r?\n([\S\s]*?)\r?\n-- ==\/UserScript==)([\S\s]*)/

  const blocksReg = lang === "js" ? jsBlocksReg : luaBlocksReg
  const blocks = text.match(blocksReg)

  if (!blocks) {
    return undefined
  }

  const metas = blocks[2]

  const meta = {} as Meta
  const metaArray = metas.split("\n")
  for (const i of metaArray) {
    const parts = i.match(/@([\w-]+)\s+(.+)/)
    if (parts) {
      const name = parts[1] as keyof Meta
      meta[name] = parts[2]
    }
  }

  return meta
}

export function getMeta(text: string): undefined | Meta {
  const meta = getMetaByLang(text, "js")
  if (meta) {
    return meta
  }
  return getMetaByLang(text, "lua")
}

export function metaToString(meta: Meta, lang: "js" | "lua"): string {
  const comment = lang === "js" ? "//" : "--"

  const header = "==UserScript=="
  const footer = "==/UserScript=="
  const list = [header]
  const maxKeyLength = Object.keys(meta)
    .map((i) => i.length)
    .reduce((a, b) => Math.max(a, b), 0)
  for (const [k, v] of Object.entries(meta)) {
    const space = " ".repeat(maxKeyLength - k.length + 2)
    list.push(`@${k}${space}${v}`)
  }
  list.push(footer)
  return list.map((i) => `${comment} ${i}`).join("\n")
}

export function addMeta(text: string, meta: Meta): string {
  const lang = meta.downloadURL.split(".").at(-1) as "js" | "lua"
  const metaString = metaToString(meta, lang)
  return `${metaString}\n\n${text}`
}
