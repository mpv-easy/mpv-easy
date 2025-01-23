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
} from "@mpv-easy/tool"
import { google } from "./google"
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
  let textList = []
  let charLength = 0
  let i = 0
  const blockLength = blocks.length
  while (i < blockLength) {
    const st = i
    while (i < blockLength && charLength + blocks[i].text.length < MAX_CHARS) {
      charLength += blocks[i].text.length
      textList.push(blocks[i].text)
      i++
    }
    const marker = "\n\n\n"
    const text = textList.join(marker)

    const ret = (await google(text, targetaLang, sourceLang)).split(marker)
    for (let k = 0; k < ret.length; k++) {
      blocks[st + k].text = ret[k]
    }
    textList = []
    charLength = 0
  }
  const str = s.toString()
  return str
}

export let TrackInfoBackup: SubtitleTrack | undefined
export let TrackInfoBackupMix: SubtitleTrack | undefined

export type TranslateOption = {
  targetLang: string
  sourceLang: string
  mix: boolean
  firstFontSize: number
  secondFontSize: number
  firstSubColor: string
  secondSubColor: string
  firstSubFontface: string
  secondSubFontface: string
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

export async function translate(option: Partial<TranslateOption> = {}) {
  const {
    mix,
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
    return
  }
  const videoPath = getPropertyString("path")!

  if (!existsSync(videoPath) && !sub.external) {
    printAndOsd("not support remote video with embedded subtitles")
    return
  }
  const targetLang = option.targetLang?.length ? option.targetLang : getLang()
  const sourceLang = option.sourceLang?.length ? option.sourceLang : sub.lang
  if (mix && TrackInfoBackupMix && sub.title === `${targetLang}-mix`) {
    setPropertyNative("sid", TrackInfoBackupMix.id)
    subRemove(sub.id)
    TrackInfoBackupMix = undefined
    return
  }
  if (!mix && TrackInfoBackup && sub.title === targetLang) {
    setPropertyNative("sid", TrackInfoBackup.id)
    subRemove(sub.id)
    TrackInfoBackup = undefined
    return
  }

  if (mix && TrackInfoBackup) {
    setPropertyNative("sid", TrackInfoBackup.id)
    subRemove(sub.id)
    TrackInfoBackup = undefined
    // return
  }
  if (!mix && TrackInfoBackupMix) {
    setPropertyNative("sid", TrackInfoBackupMix.id)
    subRemove(sub.id)
    TrackInfoBackupMix = undefined
    // return
  }

  sub = getCurrentSubtitle()
  if (!sub) {
    printAndOsd("subtitle not found")
    return
  }

  if (mix) {
    TrackInfoBackupMix = sub
  } else {
    TrackInfoBackup = sub
  }

  const tmpDir = getTmpDir()
  const videoName = getFileName(videoPath)
  const hash = md5(
    [
      videoPath,
      sourceLang,
      targetLang,
      sub.id,
      firstFontSize,
      secondFontSize,
      firstSubColor,
      secondSubColor,
      firstSubFontface,
      secondSubFontface,
    ].join("-"),
  )
  const subOriginPath = sub.external
    ? normalizePath(sub.externalFilename!)
    : normalize(`${tmpDir}/${hash}.${videoName}.${sourceLang}.srt`)
  const srtSubPath = normalize(
    `${tmpDir}/${hash}.${videoName}.${sourceLang}.srt`,
  )
  const srtOutputPath = normalize(
    `${tmpDir}/${hash}.${videoName}.${sourceLang}.${targetLang}.srt`,
  )

  const pattern = /https?:\/\/[^\s]+/
  const match = subOriginPath.match(pattern)
  if (match) {
    const url = match[0]
    const text = await fetch(url).then((i) => i.text())
    const tmp = getTmpPath()
    writeFile(tmp, text)
    await convertSubtitle(tmp, srtSubPath)
  }
  if (sub.external && !existsSync(srtSubPath)) {
    await convertSubtitle(subOriginPath, srtSubPath)
  }
  if (!existsSync(srtSubPath)) {
    if (
      !(await saveSrt(videoPath, sub.id, srtSubPath)) ||
      !existsSync(srtSubPath)
    ) {
      printAndOsd("save subtitle error")
      return
    }
  }
  const text = readFile(srtSubPath)
  const srt = await translateSrt(text, targetLang as Lang, sourceLang as Lang)
  writeFile(srtOutputPath, srt)
  if (mix) {
    const srtMixPath = normalize(
      `${tmpDir}/${hash}.${videoName}.${sourceLang}.${targetLang}.mix.srt`,
    )
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
    subAdd(srtMixPath, "select", `${targetLang}-mix`, targetLang)
  } else {
    subAdd(srtOutputPath, "select", targetLang, targetLang)
  }
}
