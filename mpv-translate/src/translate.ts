import {
  command,
  existsSync,
  getFileName,
  getLang,
  getPropertyString,
  getSubtitleTracks,
  getTmpDir,
  Lang,
  saveSrt,
  setPropertyNative,
  Srt,
  writeFile,
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

export type TrackInfo = {
  sid: number
}

let TrackInfoBackup: TrackInfo | undefined

export type TranslateOption = {
  targetLang: string
  sourceLang: string
}

export async function translate(option: Partial<TranslateOption> = {}) {
  const sub = getSubtitleTracks().find((i) => i.selected)
  if (!sub) {
    return
  }
  const videoPath = getPropertyString("path")!

  if (!existsSync(videoPath)) {
    return
  }
  const targetLang = option.targetLang?.length ? option.targetLang : getLang()
  const sourceLang = option.sourceLang?.length ? option.sourceLang : sub.lang

  if (TrackInfoBackup && sub.title === targetLang) {
    setPropertyNative("sid", TrackInfoBackup.sid)
    command(`sub-remove ${sub.id}`)
    TrackInfoBackup = undefined
    return
  }

  TrackInfoBackup = {
    sid: sub.id,
  }

  const tmpDir = getTmpDir()
  const videoName = getFileName(videoPath)
  const srtOriPath = normalize(`${tmpDir}/${videoName}.${sourceLang}.srt`)
  const srtPath = normalize(
    `${tmpDir}/${videoName}.${sourceLang}.${targetLang}.srt`,
  )

  if (!existsSync(srtPath)) {
    saveSrt(videoPath, sub.id, srtOriPath)
    const text = readFile(srtOriPath)
    const srt = await translateSrt(text, targetLang as Lang, sourceLang as Lang)
    writeFile(srtPath, srt)
  }

  command(`sub-add "${srtPath}" select ${targetLang} ${targetLang}`)
}
