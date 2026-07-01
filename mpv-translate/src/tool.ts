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
  createLogger,
} from "@mpv-easy/tool"
import { google, googleDetect } from "./google"
import {
  DEFAULT_MAX_CHUNK_CHARS,
  DEFAULT_MAX_CHUNK_ENCODE_CHARS,
} from "./const"
import { readFile } from "@mpv-easy/tool"
import { normalize } from "@mpv-easy/tool"

const log = createLogger("translate")

function compile(str: string, vars: Record<string, string>) {
  return str.replace(/\$(\w+)/g, (_, key) => vars[key] ?? "")
}

async function translateSrt(
  srt: string,
  targetaLang: Lang,
  sourceLang: Lang,
  maxChars = DEFAULT_MAX_CHUNK_CHARS,
  maxEncodeChars = DEFAULT_MAX_CHUNK_ENCODE_CHARS,
): Promise<string> {
  log.info(
    `translateSrt: ${sourceLang} → ${targetaLang}, ${maxChars}c / ${maxEncodeChars}e`,
  )
  const s = new Srt(srt)
  const blocks = s.blocks
  log.debug(`translateSrt: ${blocks.length} blocks`)
  const chunks: { st: number; text: string }[] = []
  let textList = []
  let charLength = 0
  let i = 0
  const blockLength = blocks.length
  const marker = "\n\n\n"

  while (i < blockLength) {
    const st = i
    while (i < blockLength) {
      const currentBlockText = blocks[i].text
      const nextCharLength = charLength + currentBlockText.length
      if (nextCharLength >= maxChars) break

      const nextTextList = [...textList, currentBlockText]
      const nextEncodedLength = encodeURIComponent(
        nextTextList.join(marker),
      ).length
      if (nextEncodedLength >= maxEncodeChars) break

      charLength = nextCharLength
      textList.push(currentBlockText)
      i++
    }
    // If a single block exceeds limits, we must still process it or we'll loop infinitely
    if (textList.length === 0 && i < blockLength) {
      textList.push(blocks[i].text)
      i++
    }
    chunks.push({ st, text: textList.join(marker) })
    textList = []
    charLength = 0
  }

  log.debug(`translateSrt: ${chunks.length} chunks to translate`)
  const results = await Promise.all(
    chunks.map(async (chunk, idx) => {
      try {
        const raw = await google(chunk.text, targetaLang, sourceLang)
        const ret = raw.split(marker)
        log.verbose(`translateSrt: chunk ${idx + 1}/${chunks.length} done`)
        return { st: chunk.st, ret }
      } catch (e) {
        log.error(`translateSrt: chunk ${idx + 1}/${chunks.length} failed`, e)
        throw e
      }
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
  maxChars = DEFAULT_MAX_CHUNK_CHARS,
): Promise<string | undefined> {
  const s = new Srt(content)
  const blocks = s.blocks
  if (blocks.length === 0) {
    log.warn("guessLanguage: no blocks found")
    return undefined
  }
  const text = blocks
    .filter((b) => b.text.trim().length > 0)
    .slice(0, 10)
    .map((b) => b.text)
    .join(" ")
  const result = await googleDetect(text.slice(0, maxChars))
  log.debug(`guessLanguage: detected ${result}`)
  return result
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
  maxChunkChars: number
  maxChunkEncodeChars: number
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
    maxChunkChars = DEFAULT_MAX_CHUNK_CHARS,
    maxChunkEncodeChars = DEFAULT_MAX_CHUNK_ENCODE_CHARS,
  } = option
  log.info(
    `dual=${dual}, target=${option.targetLang || "auto"}, source=${option.sourceLang || "auto"}`,
  )
  let sub = getCurrentSubtitle()
  if (!sub) {
    log.warn("no subtitle track")
    printAndOsd("subtitle not found")
    return false
  }
  log.debug(
    `sub id=${sub.id} title="${sub.title}" lang=${sub.lang} external=${sub.external}`,
  )
  const videoPath = getPropertyString("path")!
  log.debug(`videoPath=${videoPath}`)

  if (!existsSync(videoPath) && !sub.external) {
    log.warn("remote video with embedded subs, not supported")
    printAndOsd("not support remote video with embedded subtitles")
    return false
  }
  const targetLang = option.targetLang?.length ? option.targetLang : getLang()
  log.debug(`targetLang=${targetLang}`)
  if (dual && TrackInfoBackupDual && sub.title === `dual.${targetLang}`) {
    log.info("restore dual backup")
    setPropertyNative("sid", TrackInfoBackupDual.id)
    subRemove(sub.id)
    TrackInfoBackupDual = undefined
    return true
  }
  if (!dual && TrackInfoBackup && sub.title === targetLang) {
    log.info("restore single backup")
    setPropertyNative("sid", TrackInfoBackup.id)
    subRemove(sub.id)
    TrackInfoBackup = undefined
    return true
  }

  if (dual && TrackInfoBackup) {
    log.info("clear old single backup")
    setPropertyNative("sid", TrackInfoBackup.id)
    subRemove(sub.id)
    TrackInfoBackup = undefined
  }
  if (!dual && TrackInfoBackupDual) {
    log.info("clear old dual backup")
    setPropertyNative("sid", TrackInfoBackupDual.id)
    subRemove(sub.id)
    TrackInfoBackupDual = undefined
  }

  sub = getCurrentSubtitle()
  if (!sub) {
    log.warn("no subtitle after restore")
    printAndOsd("subtitle not found")
    return false
  }

  let sourceTrack = sub
  if (sub.title === targetLang && TrackInfoBackup) {
    log.debug("fallback to backup source")
    sourceTrack = TrackInfoBackup
  } else if (sub.title === `dual.${targetLang}` && TrackInfoBackupDual) {
    log.debug("fallback to dual backup source")
    sourceTrack = TrackInfoBackupDual
  }

  if (dual) {
    TrackInfoBackupDual = sourceTrack
    log.debug(`dual backup saved id=${sourceTrack.id}`)
  } else {
    TrackInfoBackup = sourceTrack
    log.debug(`backup saved id=${sourceTrack.id}`)
  }

  const tmpDir = getTmpDir()
  const videoName = getFileName(videoPath)
  if (!videoName) {
    log.warn("videoName not found")
    printAndOsd("videoName not found")
    return false
  }
  const sourceLang = option.sourceLang?.length
    ? option.sourceLang
    : sourceTrack.lang
  log.debug(`sourceLang=${sourceLang}`)
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
    log.debug(`fetch remote sub ${url}`)
    const text = await fetch(url).then((i) => i.text())
    const tmp = getTmpPath()
    writeFile(tmp, text)
    await convertSubtitle(tmp, srtSubPath)
    log.debug("remote sub converted")
  }
  if (sourceTrack.external && !existsSync(srtSubPath)) {
    log.debug(`convert external sub ${subOriginPath}`)
    await convertSubtitle(subOriginPath, srtSubPath)
  }
  if (!existsSync(srtSubPath)) {
    log.debug(`extract sub track ${sourceTrack.id}`)
    if (
      !(await saveSrt(videoPath, sourceTrack.id, srtSubPath)) ||
      !existsSync(srtSubPath)
    ) {
      log.error(`save srt failed ${srtSubPath}`)
      printAndOsd("save subtitle error")
      return false
    }
    log.debug(`srt saved to ${srtSubPath}`)
  }
  const text = readFile(srtSubPath)
  let guessedLang = sourceTrack.external
    ? getLanguageFromFilename(sourceTrack.externalFilename!)
    : undefined

  if (!guessedLang) {
    log.debug("guessing source language...")
    guessedLang = await guessLanguage(text, maxChunkChars)
  }

  let srt: string | undefined
  if (guessedLang) {
    const gl = guessedLang.split("-")[0].toLowerCase()
    const tl = (targetLang as string).split("-")[0].toLowerCase()
    if (gl === tl) {
      log.info(`already in ${targetLang}, skip`)
      printAndOsd(`Subtitle already in ${targetLang}, reusing content`)
      srt = text
    }
  }

  if (srt === undefined) {
    log.info(`translating ${sourceLang} → ${targetLang}`)
    srt = await translateSrt(
      text,
      targetLang as Lang,
      sourceLang as Lang,
      maxChunkChars,
      maxChunkEncodeChars,
    )
    log.debug(`translation done, writing ${srtOutputPath}`)
  }
  writeFile(srtOutputPath, srt)

  const resolveOutputPath = (src: string, lang: string) => {
    if (!existsSync(videoPath)) {
      log.debug("network source, use temp output")
      return src
    }

    try {
      const dir = dirname(videoPath)!
      const lastDotIndex = videoName.lastIndexOf(".")
      const name =
        lastDotIndex === -1 ? videoName : videoName.substring(0, lastDotIndex)

      const pathTemplate = subOutputPath || "$TMP/$NAME.$LANG.srt"
      const homeDir = getHomeDir() || getTmpDir()
      const mpvDir = getMpvExeDir() || tmpDir
      const mpvConfigDir = expandPath("~~home/") || tmpDir
      const desktopDir = getDesktopDir() || tmpDir

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
      log.debug(`output ${lang}: ${src} → ${dest}`)

      if (normalizePath(src) === dest) {
        return src
      }

      writeFile(dest, readFile(src))
      return dest
    } catch (error) {
      log.error(`template error`, error)
      printAndOsd(`Template error: ${error}, using temp path`)
      return src
    }
  }

  if (dual) {
    const srtDualPath = getPath(`dual.${sourceLang}.${targetLang}.srt`)
    if (!existsSync(srtDualPath)) {
      log.debug("creating dual srt")
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
    log.info(`add dual sub dual.${targetLang} => ${finalPath}`)
    subAdd(finalPath, "select", `dual.${targetLang}`, dualLang)
  } else {
    const finalPath = resolveOutputPath(srtOutputPath, targetLang)
    log.info(`add sub ${targetLang} => ${finalPath}`)
    subAdd(finalPath, "select", targetLang, targetLang)
  }
  log.info("done")
  return true
}
