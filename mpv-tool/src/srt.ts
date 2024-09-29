const ARROW = "-->"

function isInt(str: string) {
  return String(Number(str)) === str
}

function isTime(str: string) {
  return str.includes(ARROW)
}

function isEmpty(str: string) {
  return str.trim().length === 0
}

export type Block = {
  id: string
  time: string
  text: string
}

function parseSrt(srt: string): Block[] {
  const blocks: Block[] = []
  const lines = srt.trim().replaceAll("\r\n", "\n").split("\n")
  const lineLength = lines.length
  let i = 0
  while (i < lineLength) {
    while (i < lineLength && !isInt(lines[i])) i++
    if (i >= lineLength) continue
    const idIndex = i++
    const timeIndex = i++
    while (
      i + 2 < lineLength &&
      !(isEmpty(lines[i]) && isInt(lines[i + 1]) && isTime(lines[i + 2]))
    )
      i++
    if (i + 2 >= lineLength) {
      i = lineLength
    }
    const text = lines.slice(timeIndex + 1, i).join("\n")
    blocks.push({
      id: lines[idIndex],
      time: lines[timeIndex],
      text,
    })
  }
  return blocks
}

export class Srt {
  blocks: Block[]
  constructor(public srt: string) {
    this.blocks = parseSrt(srt)
  }

  toString() {
    return this.blocks.map((i) => `${i.id}\n${i.time}\n${i.text}`).join("\n\n")
  }
}
