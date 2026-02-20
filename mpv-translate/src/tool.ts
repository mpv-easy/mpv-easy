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
  getHomeDir,
  getMpvExeDir,
  getDesktopDir,
  expandPath,
} from "@mpv-easy/tool"
import { google, googleDetect } from "./google"
import { readFile } from "@mpv-easy/tool"
import { normalize } from "@mpv-easy/tool"

function compile(str: string, vars: Record<string, string>) {
  return str.replace(/\$(\w+)/g, (_, key) => vars[key] ?? "")
}

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
  return await googleDetect(text.slice(0, MAX_CHARS))
}

export let TrackInfoBackup: SubtitleTrack | undefined
export let TrackInfoBackupDual: SubtitleTrack | undefined

export function resetTrackInfo() {
  TrackInfoBackup = undefined
  TrackInfoBackupDual = undefined
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
  subOutputPath: string
}

function DualSrt(
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
  if (dual && TrackInfoBackupDual && sub.title === `dual.${targetLang}`) {
    setPropertyNative("sid", TrackInfoBackupDual.id)
    subRemove(sub.id)
    TrackInfoBackupDual = undefined
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
  if (!dual && TrackInfoBackupDual) {
    setPropertyNative("sid", TrackInfoBackupDual.id)
    subRemove(sub.id)
    TrackInfoBackupDual = undefined
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
  } else if (sub.title === `dual.${targetLang}` && TrackInfoBackupDual) {
    sourceTrack = TrackInfoBackupDual
  }

  if (dual) {
    TrackInfoBackupDual = sourceTrack
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
  const subOutputPath = option.subOutputPath || ""
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

  const resolveOutputPath = (src: string, lang: string) => {
    // If it is a network path, use temp folder
    if (!existsSync(videoPath)) {
      return src
    }

    try {
      const dir = dirname(videoPath)!
      const lastDotIndex = videoName.lastIndexOf(".")
      const name =
        lastDotIndex === -1 ? videoName : videoName.substring(0, lastDotIndex)

      // Default template when empty: use temp directory
      const pathTemplate = subOutputPath || "$TMP/$NAME.$LANG.srt"

      // Get various directory paths
      const homeDir = getHomeDir() || getTmpDir()
      const mpvDir = getMpvExeDir() || tmpDir
      const mpvConfigDir = expandPath("~~home/") || tmpDir
      const desktopDir = getDesktopDir() || tmpDir

      // Prepare template variables
      const templateVars = {
        HOME: homeDir,
        NAME: name,
        LANG: lang,
        SOURCE_LANG: sourceLang || "en-US",
        TARGET_LANG: targetLang || "en-US",
        TMP: tmpDir,
        FOLDER: dir,
        MPV: mpvDir,
        MPV_CONFIG: mpvConfigDir,
        DESKTOP: desktopDir,
      }
      const dest = normalizePath(compile(pathTemplate, templateVars))

      // Skip copy if source and destination are the same
      if (normalizePath(src) === dest) {
        return src
      }

      writeFile(dest, readFile(src))
      return dest
    } catch (error) {
      printAndOsd(`Template error: ${error}, using temp path`)
      return src
    }
  }

  if (dual) {
    const srtDualPath = getPath(`dual.${sourceLang}.${targetLang}.srt`)
    if (!existsSync(srtDualPath)) {
      DualSrt(
        srtOutputPath,
        srtSubPath,
        srtDualPath,
        firstFontSize,
        secondFontSize,
        firstSubColor,
        secondSubColor,
        firstSubFontface,
        secondSubFontface,
      )
    }
    const dualLang = `${sourceLang}.${targetLang}`
    const finalPath = resolveOutputPath(srtDualPath, dualLang)
    subAdd(finalPath, "select", `dual.${targetLang}`, dualLang)
  } else {
    const finalPath = resolveOutputPath(srtOutputPath, targetLang)
    subAdd(finalPath, "select", targetLang, targetLang)
  }
  return true
}
