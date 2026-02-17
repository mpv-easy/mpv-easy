import {
  existsSync,
  getCurrentSubtitle,
  getFileName,
  getLang,
  getPropertyString,
  getTmpDir,
  Lang,
  printAndOsd,
  saveSrt,
  setPropertyNative,
  Srt,
  writeFile,
  md5,
  SubtitleTrack,
  subRemove,
  subAdd,
  convertSubtitle,
  normalizePath,
  fetch,
  getTmpPath,
  dirname,
  LangList,
} from "@mpv-easy/tool"
import { google, googleDetect } from "./google"
import { readFile } from "@mpv-easy/tool"
import { normalize } from "@mpv-easy/tool"

const MAX_CHARS = 4000
async function translateSrt(
  srt: string,
  targetaLang: Lang,
  sourceLang: Lang,
): Promise<string> {
  const s = new Srt(srt)
  const blocks = s.blocks
  const chunks: { st: number; text: string }[] = []
  let textList = []
  let charLength = 0
  let i = 0
  const blockLength = blocks.length
  const marker = "\n\n\n"

  while (i < blockLength) {
    const st = i
    while (i < blockLength && charLength + blocks[i].text.length < MAX_CHARS) {
      charLength += blocks[i].text.length
      textList.push(blocks[i].text)
      i++
    }
    chunks.push({ st, text: textList.join(marker) })
    textList = []
    charLength = 0
  }

  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const ret = (await google(chunk.text, targetaLang, sourceLang)).split(
        marker,
      )
      return { st: chunk.st, ret }
    }),
  )

  for (const res of results) {
    for (let k = 0; k < res.ret.length; k++) {
      if (blocks[res.st + k]) {
        blocks[res.st + k].text = res.ret[k]
      }
    }
  }

  const str = s.toString()
  return str
}

export async function guessLanguage(
  content: string,
): Promise<string | undefined> {
  const s = new Srt(content)
  const blocks = s.blocks
  if (blocks.length === 0) return undefined
  const text = blocks
    .filter((b) => b.text.trim().length > 0)
    .slice(0, 10)
    .map((b) => b.text)
    .join(" ")
  return await googleDetect(text)
}

export let TrackInfoBackup: SubtitleTrack | undefined
export let TrackInfoBackupMix: SubtitleTrack | undefined

export function resetTrackInfo() {
  TrackInfoBackup = undefined
  TrackInfoBackupMix = undefined
}

export function getLanguageFromFilename(filename: string): string | undefined {
  const parts = filename.split(".")
  if (parts.length < 2) return undefined
  const lang = parts[parts.length - 2].toLowerCase()
  const found = LangList.find((i) => i.toLowerCase().startsWith(lang))
  if (found) {
    return found
  }
  return undefined
}

export type TranslateOption = {
  targetLang: string
  sourceLang: string
  dual: boolean
  firstFontSize: number
  secondFontSize: number
  firstSubColor: string
  secondSubColor: string
  firstSubFontface: string
  secondSubFontface: string
  subSaveMode: string
}

function mixSrt(
  first: string,
  second: string,
  output: string,
  firstFontSize: number,
  secondFontSize: number,
  firstSubColor: string,
  secondSubColor: string,
  firstSubFontface: string,
  secondSubFontface: string,
) {
  const firstString = readFile(first)
  const secondString = readFile(second)
  const firstSrt = new Srt(firstString)
  const secondSrt = new Srt(secondString)
  const outputSrt = new Srt(firstString)

  const firstAttr: string[] = [`size="${firstFontSize}"`]
  const secondAttr: string[] = [`size="${secondFontSize}"`]

  if (firstSubColor.length) {
    firstAttr.push(`color="${firstSubColor}"`)
  }
  if (firstSubFontface.length) {
    firstAttr.push(`face="${firstSubFontface}"`)
  }

  if (secondSubColor.length) {
    secondAttr.push(`color="${secondSubColor}"`)
  }
  if (secondSubFontface.length) {
    secondAttr.push(`face="${secondSubFontface}"`)
  }

  const firstAttrStr = firstAttr.join(" ")
  const secondAttrStr = secondAttr.join(" ")
  for (let i = 0; i < outputSrt.blocks.length; i++) {
    const a = firstSrt.blocks[i].text.split("\n")
    const b = secondSrt.blocks[i].text.split("\n")
    const c: string[] = []
    for (let k = 0; k < a.length; k++) {
      c.push(
        `<font ${firstAttrStr} >${a[k] || ""}</font>\n<font ${secondAttrStr} >${b[k] || ""}</font>`,
      )
    }

    outputSrt.blocks[i].text = c.join("\n")
  }
  const outputString = outputSrt.toString()
  writeFile(output, outputString)
}

export async function translate(
  option: Partial<TranslateOption> = {},
): Promise<boolean> {
  const {
    dual,
    firstFontSize = 22,
    secondFontSize = 11,
    firstSubColor = "",
    secondSubColor = "",
    firstSubFontface = "",
    secondSubFontface = "",
  } = option
  let sub = getCurrentSubtitle()
  if (!sub) {
    printAndOsd("subtitle not found")
    return false
  }
  const videoPath = getPropertyString("path")!

  if (!existsSync(videoPath) && !sub.external) {
    printAndOsd("not support remote video with embedded subtitles")
    return false
  }
  const targetLang = option.targetLang?.length ? option.targetLang : getLang()
  if (dual && TrackInfoBackupMix && sub.title === `dual.${targetLang}`) {
    setPropertyNative("sid", TrackInfoBackupMix.id)
    subRemove(sub.id)
    TrackInfoBackupMix = undefined
    return true
  }
  if (!dual && TrackInfoBackup && sub.title === targetLang) {
    setPropertyNative("sid", TrackInfoBackup.id)
    subRemove(sub.id)
    TrackInfoBackup = undefined
    return true
  }

  if (dual && TrackInfoBackup) {
    setPropertyNative("sid", TrackInfoBackup.id)
    subRemove(sub.id)
    TrackInfoBackup = undefined
    // return
  }
  if (!dual && TrackInfoBackupMix) {
    setPropertyNative("sid", TrackInfoBackupMix.id)
    subRemove(sub.id)
    TrackInfoBackupMix = undefined
    // return
  }

  sub = getCurrentSubtitle()
  if (!sub) {
    printAndOsd("subtitle not found")
    return false
  }

  // Detect if current sub is a generated one and fallback to backup
  let sourceTrack = sub
  if (sub.title === targetLang && TrackInfoBackup) {
    sourceTrack = TrackInfoBackup
  } else if (sub.title === `dual.${targetLang}` && TrackInfoBackupMix) {
    sourceTrack = TrackInfoBackupMix
  }

  if (dual) {
    TrackInfoBackupMix = sourceTrack
  } else {
    TrackInfoBackup = sourceTrack
  }

  const tmpDir = getTmpDir()
  const videoName = getFileName(videoPath)
  if (!videoName) {
    printAndOsd("videoName not found")
    return false
  }
  const sourceLang = option.sourceLang?.length
    ? option.sourceLang
    : sourceTrack.lang
  const hash = md5(
    [
      videoPath,
      sourceLang,
      targetLang,
      sourceTrack.id,
      firstFontSize,
      secondFontSize,
      firstSubColor,
      secondSubColor,
      firstSubFontface,
      secondSubFontface,
    ].join("-"),
  )
  const subSaveMode = option.subSaveMode || "temporary"
  const getPath = (ext: string) => {
    return normalize(`${tmpDir}/${hash}.${videoName}.${ext}`)
  }

  const subOriginPath = sourceTrack.external
    ? normalizePath(sourceTrack.externalFilename!)
    : getPath(`${sourceLang}.srt`)
  const srtSubPath = getPath(`${sourceLang}.srt`)
  const srtOutputPath = getPath(`${sourceLang}.${targetLang}.srt`)

  const pattern = /https?:\/\/[^\s]+/
  const match = subOriginPath.match(pattern)
  if (match) {
    const url = match[0]
    const text = await fetch(url).then((i) => i.text())
    const tmp = getTmpPath()
    writeFile(tmp, text)
    await convertSubtitle(tmp, srtSubPath)
  }
  if (sourceTrack.external && !existsSync(srtSubPath)) {
    await convertSubtitle(subOriginPath, srtSubPath)
  }
  if (!existsSync(srtSubPath)) {
    if (
      !(await saveSrt(videoPath, sourceTrack.id, srtSubPath)) ||
      !existsSync(srtSubPath)
    ) {
      printAndOsd("save subtitle error")
      return false
    }
  }
  const text = readFile(srtSubPath)
  let guessedLang = sourceTrack.external
    ? getLanguageFromFilename(sourceTrack.externalFilename!)
    : undefined

  if (!guessedLang) {
    guessedLang = await guessLanguage(text)
  }

  let srt: string | undefined
  if (guessedLang) {
    const gl = guessedLang.split("-")[0].toLowerCase()
    const tl = (targetLang as string).split("-")[0].toLowerCase()
    if (gl === tl) {
      printAndOsd(`Subtitle already in ${targetLang}, reusing content`)
      srt = text
    }
  }

  if (srt === undefined) {
    srt = await translateSrt(text, targetLang as Lang, sourceLang as Lang)
  }
  writeFile(srtOutputPath, srt)

  const copyToVideoDir = (src: string, suffix: string) => {
    // If it is a network path, write to the temp folder
    if (!existsSync(videoPath)) {
      return src
    }

    if (subSaveMode === "video-folder") {
      const dir = dirname(videoPath)
      const lastDotIndex = videoName.lastIndexOf(".")
      const name =
        lastDotIndex === -1 ? videoName : videoName.substring(0, lastDotIndex)
      const dest = normalizePath(`${dir}/${name}.${suffix}`)
      writeFile(dest, readFile(src))
      return dest
    }
    return src
  }

  if (dual) {
    const srtMixPath = getPath(`dual.${sourceLang}.${targetLang}.srt`)
    if (!existsSync(srtMixPath)) {
      mixSrt(
        srtOutputPath,
        srtSubPath,
        srtMixPath,
        firstFontSize,
        secondFontSize,
        firstSubColor,
        secondSubColor,
        firstSubFontface,
        secondSubFontface,
      )
    }
    const finalPath = copyToVideoDir(srtMixPath, `dual.${targetLang}.srt`)
    subAdd(finalPath, "select", `dual.${targetLang}`, targetLang)
  } else {
    const finalPath = copyToVideoDir(srtOutputPath, `${targetLang}.srt`)
    subAdd(finalPath, "select", targetLang, targetLang)
  }
  return true
}
