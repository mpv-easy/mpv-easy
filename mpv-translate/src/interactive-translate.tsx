import { bingClientSearch } from "./bing"
import { pons } from "./pons"

export type WordInfo = {
  word: string
  detail: string[]
  audio?: string
}

export async function en2zh(s: string): Promise<WordInfo> {
  const text = await bingClientSearch(s)
  const detail = (text.match(/data-definition="(.*?)"/)?.[1] || "")
    .split(";")
    .map((i) => i.trim())
  const word = (text.match(/data-word="(.*?)"/)?.[1] || s).trim()
  const audio = (text.match(/audiomd5="(.*?)"/)?.[1] || "").trim()
  return {
    word,
    detail,
    audio,
  }
}

export async function de2en(s: string): Promise<WordInfo> {
  const text = await pons(s, "en", "de")
  const word = text.match(/<h2 class="">\s(.*?)<span class/)?.[1].trim() || s
  const markerStart = 'class="translations first">'
  const markerEnd = `<div class="link-examples-toolbar">`
  const st = text.indexOf(markerStart)
  const ed = text.indexOf(markerEnd)
  const markerNewLine = "@@NEW_LINE@@"
  const markrerSplit = "@@SPLIT@@"
  const div = text
    .slice(st + markerStart.length, ed)
    .replaceAll("</dl>", markerNewLine)
    .replaceAll("</h3>", markerNewLine)
    .replaceAll("</dt>", markrerSplit)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .replaceAll(markerNewLine, "\n")
    .replaceAll(markrerSplit, "\t")
    .trim()
  const detail = div.split("\n").map((i) => {
    const [a, b] = i
      .trim()
      .split("\t")
      .map((i) => i.trim())
    return `${a}    ${b ?? ""}`.trim()
  })
  return {
    word,
    detail,
  }
}

export function jp2zh() {}

export function jp2en() {}
