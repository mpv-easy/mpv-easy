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

export function resetTrackInfo() {
  TrackInfoBackup = undefined
  TrackInfoBackupMix = undefined
}

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

  // Detect if current sub is a generated one and fallback to backup
  let sourceTrack = sub
  if (sub.title === targetLang && TrackInfoBackup) {
    sourceTrack = TrackInfoBackup
  } else if (sub.title === `${targetLang}-mix` && TrackInfoBackupMix) {
    sourceTrack = TrackInfoBackupMix
  }

  if (mix) {
    TrackInfoBackupMix = sourceTrack
  } else {
    TrackInfoBackup = sourceTrack
  }

  const tmpDir = getTmpDir()
  const videoName = getFileName(videoPath)
  if (!videoName) {
    printAndOsd("videoName not found")
    return
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
      return
    }
  }
  const text = readFile(srtSubPath)
  const srt = await translateSrt(text, targetLang as Lang, sourceLang as Lang)
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

  if (mix) {
    const srtMixPath = getPath(`${sourceLang}.${targetLang}.mix.srt`)
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
    const finalPath = copyToVideoDir(srtMixPath, `srt`)
    subAdd(finalPath, "select", `${targetLang}-mix`, targetLang)
  } else {
    const finalPath = copyToVideoDir(srtOutputPath, `srt`)
    subAdd(finalPath, "select", targetLang, targetLang)
  }
}
