import {
  cacheSync,
  command,
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
  getPropertyNumber,
  SubtitleTrack,
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
}

function mixSrt(first: string, second: string, output: string) {
  const firstString = readFile(first)
  const secondString = readFile(second)
  const firstSrt = new Srt(firstString)
  const secondSrt = new Srt(secondString)
  const subFontSize = getPropertyNumber("sub-font-size") || 55

  // FIXME: why div 2.5?
  const firstSize = Math.round(subFontSize / 2.5)
  const secondSize = Math.round(firstSize / 2)
  const outputSrt = new Srt(firstString)

  for (let i = 0; i < outputSrt.blocks.length; i++) {
    const a = firstSrt.blocks[i].text.split("\n")
    const b = secondSrt.blocks[i].text.split("\n")
    const c: string[] = []
    for (let k = 0; k < a.length; k++) {
      c.push(
        `<font size="${firstSize}">${a[k] || ""}</font>\n<font size="${secondSize}">${b[k] || ""}</font>`,
      )
    }

    outputSrt.blocks[i].text = c.join("\n")
  }
  const outputString = outputSrt.toString()
  writeFile(output, outputString)
}

export async function translate(option: Partial<TranslateOption> = {}) {
  const { mix } = option
  let sub = getCurrentSubtitle()
  if (!sub) {
    printAndOsd("subtitle not found")
    return
  }
  const videoPath = getPropertyString("path")!

  if (!existsSync(videoPath)) {
    printAndOsd("not support remote video")
    return
  }
  const targetLang = option.targetLang?.length ? option.targetLang : getLang()
  const sourceLang = option.sourceLang?.length ? option.sourceLang : sub.lang
  if (mix && TrackInfoBackupMix && sub.title === `${targetLang}-mix`) {
    setPropertyNative("sid", TrackInfoBackupMix.id)
    command(`sub-remove ${sub.id}`)
    TrackInfoBackupMix = undefined
    return
  }
  if (!mix && TrackInfoBackup && sub.title === targetLang) {
    setPropertyNative("sid", TrackInfoBackup.id)
    command(`sub-remove ${sub.id}`)
    TrackInfoBackup = undefined
    return
  }

  if (mix && TrackInfoBackup) {
    setPropertyNative("sid", TrackInfoBackup.id)
    command(`sub-remove ${sub.id}`)
    TrackInfoBackup = undefined
    // return
  }
  if (!mix && TrackInfoBackupMix) {
    setPropertyNative("sid", TrackInfoBackupMix.id)
    command(`sub-remove ${sub.id}`)
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
  const hash = md5([videoPath, sourceLang, targetLang, sub.id].join("-"))
  const srtOriPath = normalize(
    `${tmpDir}/${hash}.${videoName}.${sourceLang}.srt`,
  )
  const srtPath = sub.external
    ? sub.externalFilename!
    : normalize(
        `${tmpDir}/${hash}.${videoName}.${sourceLang}.${targetLang}.srt`,
      )
  if (!existsSync(srtPath)) {
    if (
      !(await saveSrt(videoPath, sub.id, srtOriPath)) ||
      !existsSync(srtOriPath)
    ) {
      printAndOsd("save subtitle error")
      return
    }
    const text = readFile(srtOriPath)
    const srt = await translateSrt(text, targetLang as Lang, sourceLang as Lang)
    writeFile(srtPath, srt)
  }
  const srtMixPath = normalize(
    `${tmpDir}/${hash}.${videoName}.${sourceLang}.${targetLang}.mix.srt`,
  )
  if (mix) {
    if (!existsSync(srtMixPath)) {
      mixSrt(srtPath, srtOriPath, srtMixPath)
    }
    command(`sub-add "${srtMixPath}" select ${targetLang}-mix ${targetLang}`)
  } else {
    command(`sub-add "${srtPath}" select ${targetLang} ${targetLang}`)
  }
}
