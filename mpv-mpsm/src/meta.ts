export type Script = {
  name: string
  download: string
  version?: string
  description?: string
  author?: string
  update?: string
  homepage?: string
  license?: string
  keywords?: string[]
}

export function getScriptByLang(
  text: string,
  lang: "js" | "lua",
): undefined | Script {
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

  const meta = {} as Script
  const metaArray = metas.split("\n")
  for (const i of metaArray) {
    const parts = i.match(/@([\w-]+)\s+(.+)/)
    if (parts) {
      const name = parts[1] as keyof Script
      if (name === "keywords") {
        meta[name] = parts[2].split(",")
      } else {
        meta[name] = parts[2]
      }
    }
  }

  return meta
}

export function getScript(text: string): undefined | Script {
  const script = getScriptByLang(text, "js")
  if (script) {
    return script
  }
  return getScriptByLang(text, "lua")
}

export function scriptToString(script: Script, lang: "js" | "lua"): string {
  const comment = lang === "js" ? "//" : "--"

  const header = "==UserScript=="
  const footer = "==/UserScript=="
  const list = [header]
  const maxKeyLength = Object.keys(script)
    .map((i) => i.length)
    .reduce((a, b) => Math.max(a, b), 0)
  for (let [k, v] of Object.entries(script)) {
    const space = " ".repeat(maxKeyLength - k.length + 2)
    if (k === "keywords" && Array.isArray(v)) {
      v = v.join(",")
    }
    list.push(`@${k}${space}${v}`)
  }
  list.push(footer)
  return list.map((i) => `${comment} ${i}`).join("\n")
}

export function addScript(text: string, script: Script): string {
  const lang = script.download.split(".").at(-1) as "js" | "lua"
  const metaString = scriptToString(script, lang)
  return `${metaString}\n\n${text}`
}
