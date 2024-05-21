export type Meta = {
  name: string
  version: string
  description: string
  author: string
  downloadURL: string
  [k: string]: string
}

export function getMeta(text: string): undefined | Meta {
  const blocksReg =
    /\B(\/\/ ==UserScript==\r?\n([\S\s]*?)\r?\n\/\/ ==\/UserScript==)([\S\s]*)/
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
      const name = parts[1]
      meta[name] = parts[2]
    }
  }

  return meta
}
