import {
  getLang,
  getPropertyBool,
  observeProperty,
  registerScriptMessage,
  setPropertyBool,
  playAudio,
  detectCmd,
  getCurrentSubtitle,
  detectFfmpeg,
  showNotification,
  getPropertyNative,
} from "@mpv-easy/tool"
import React, { useEffect, useRef, useState } from "react"
import { Box, Button, MpDomProps } from "@mpv-easy/react"
import { google } from "./google"
import { TrackInfoBackup, TrackInfoBackupMix, translate } from "./tool"
import { defaultSubConfig, SubConfig } from "./const"
import { de2en, en2zh, WordInfo } from "./interactive-translate"

async function getWordInfo(
  word: string,
  targetLang: string,
  sourceLang: string,
): Promise<WordInfo> {
  if (targetLang.startsWith("zh") && sourceLang.startsWith("en")) {
    return en2zh(word)
  }
  if (targetLang.startsWith("en") && sourceLang.startsWith("de")) {
    return de2en(word)
  }
  const text = await google(word, targetLang, sourceLang)
  return Promise.resolve({
    word,
    detail: [text],
  })
}

function split(str: string): string[] {
  return str.trim().replaceAll(/\s+/g, " ").replaceAll(" ", "  ").split(" ")
}

// FIXME: regex doesn't work
// const PunctuationRegex = /[!"#$%&()*+,./:;<=>?@\[\]\^\{\|\}~]/g
// function cleanWord(w: string): string {
//   return w.replaceAll(PunctuationRegex, "")
// }
const PunctuationList = `!"#$%&()*+,./:;<=>?@[]^{|}~`.split("")
function cleanWord(w: string): string {
  for (const i of PunctuationList) {
    w = w.replaceAll(i, "")
  }
  return w
}

export function Word({
  word,
  showTitle,
  subConfig,
  skipTranslate,
  videoScale,
}: {
  word: string
  showTitle: boolean
  subConfig: SubConfig
  skipTranslate: boolean
  videoScale: number
}) {
  const [info, setInfo] = useState<WordInfo>({
    word: "",
    detail: [],
  })
  const loading = useRef(false)
  // FIXME: find a way to convert the srt text size and the text size in libass
  const firstFontSize = Math.round(subConfig.subFontSize * videoScale * 2)
  // FIXME: magic number, font scale differently in libass and srt
  const secondFontSize = Math.round(firstFontSize / 1.5)
  const fontSize = skipTranslate ? firstFontSize : secondFontSize
  const fontBorderSize = skipTranslate
    ? subConfig.subOutlineSize * videoScale
    : (subConfig.subOutlineSize * videoScale) / 2
  useEffect(() => {
    if (loading.current || !word.length || skipTranslate) return
    loading.current = true
    const currentWord = word
    getWordInfo(
      cleanWord(word),
      subConfig.targetLang,
      subConfig.sourceLang,
    ).then((info) => {
      if (currentWord === word) {
        setInfo(info)
      }
      loading.current = false
    })
  }, [word])
  return word.length ? (
    <Button
      onClick={async (e) => {
        if (e.event.key_name === "MBTN_LEFT") {
          if (info.audio?.length) {
            playAudio(info.audio)
          }
          // e.stopPropagation()
          // e.preventdetailault()
        }
      }}
      display="flex"
      position="relative"
      fontSize={fontSize}
      color={subConfig.subColor}
      fontBorderSize={fontBorderSize}
      fontBorderColor={subConfig.subOutlineColor}
      fontWeight={subConfig.subBold ? "bold" : "normal"}
      colorHover={skipTranslate ? subConfig.subColor : subConfig.subColorHover}
      backgroundColorHover={
        skipTranslate ? subConfig.subBackColor : subConfig.subBackColorHover
      }
      backgroundColor={subConfig.subBackColor}
      title={
        showTitle ? (skipTranslate ? "" : info.detail.join("\n").trim()) : ""
      }
      text={word}
    />
  ) : (
    <Box
      width={word === "" ? subConfig.subFontSize / 2 : undefined}
      height={word === "" ? subConfig.subFontSize / 2 : undefined}
    />
  )
}

function Line({
  line,
  subConfig,
  lineIndex,
  isMix,
  videoScale,
}: {
  line: string
  subConfig: SubConfig
  lineIndex: number
  isMix: boolean
  videoScale: number
}) {
  const words = split(line)
  const [showTitle, setShowTitle] = useState(true)
  const loading = useRef(false)
  const [title, setTitle] = useState("")

  const skipTranslate = isMix && !(lineIndex & 1)
  useEffect(() => {
    if (loading.current || !line.length || skipTranslate) return
    loading.current = true
    const currentLine = line
    google(line, getLang()).then((info) => {
      if (currentLine === line) {
        setTitle(info.trim())
      }
      loading.current = false
    })
  }, [line])

  return (
    <Box
      position="relative"
      display="flex"
      width="100%"
      justifyContent="center"
      alignItems="end"
      alignContent="stretch"
      onClick={(e) => {
        if (e.event.key_name === "MBTN_MID") {
          setShowTitle((v) => !v)
        }
      }}
      title={showTitle ? "" : title}
    >
      {words.map((i, k) => (
        <Word
          videoScale={videoScale}
          showTitle={showTitle}
          key={[i, k].join(",")}
          word={i.trim()}
          subConfig={subConfig}
          skipTranslate={skipTranslate}
        />
      ))}
    </Box>
  )
}

export type TranslationProps = MpDomProps & SubConfig

export function Translation(props: Partial<TranslationProps>) {
  const {
    subFontSize,
    subColor,
    subBackColor,
    subBackColorHover,
    subColorHover,
    subBold,
    subScale,
    subOutlineSize,
    subOutlineColor,
    subZIndex,
    targetLang: defTargetLang,
    sourceLang: defSourceLang,
    subSrtScale,
    firstSubColor,
    firstSubFontface,
    secondSubFontface,
    secondSubColor,
  } = {
    ...defaultSubConfig,
    ...props,
  }
  const [active, setActive] = useState(false)
  const [text, setText] = useState("")
  const textCache = useRef("")

  const update = useRef<((s: string) => void) | null>(null)
  update.current = (s: string) => {
    if (active) {
      setText(s || "")
    }
  }
  const targetLang = defTargetLang.toLocaleLowerCase()
  let sourceLang = defSourceLang.toLocaleLowerCase()

  if (!sourceLang.length) {
    if (TrackInfoBackup) {
      sourceLang = TrackInfoBackup.lang || TrackInfoBackup.title || ""
    }

    if (TrackInfoBackupMix) {
      sourceLang = TrackInfoBackupMix.lang || TrackInfoBackupMix.title || ""
    }

    if (!sourceLang.length) {
      const sub = getCurrentSubtitle()
      if (sub) {
        sourceLang = (sub.lang || sub.title || "").toLocaleLowerCase()
      }
    }
  }
  const firstFontSize = Math.round(subSrtScale * subFontSize * subScale)
  const secondFontSize = Math.round(firstFontSize / 2)

  const videoParams = getPropertyNative("video-params") || {
    w: 0,
    h: 0,
    aspect: 0,
  }
  const videoTargetParams = getPropertyNative("video-target-params") || {
    w: 0,
    h: 0,
    aspect: 0,
  }

  const aspect = videoTargetParams.w / videoTargetParams.h
  let scaleW = videoTargetParams.w
  let scaleH = videoTargetParams.h
  if (aspect <= videoParams.aspect) {
    scaleH = videoTargetParams.w / videoParams.aspect
  } else {
    scaleW = videoTargetParams.w / videoParams.aspect
  }
  const sx = scaleW / videoParams.w
  const sy = scaleH / videoParams.h
  const videoScale = Math.min(sx, sy)
  useEffect(() => {
    registerScriptMessage("translate", () => {
      const sub = getCurrentSubtitle()
      if (!sub) {
        showNotification("subtitle not found")
      }
      if (!detectFfmpeg()) {
        showNotification("ffmpeg not found")
        return
      }
      if (!detectCmd("curl")) {
        showNotification("curl not found")
        return
      }
      translate({
        targetLang,
        sourceLang,
        mix: false,
        firstFontSize,
        secondFontSize,
        firstSubColor,
        firstSubFontface,
        secondSubFontface,
        secondSubColor,
      })
    })
    registerScriptMessage("mix-translate", () => {
      const sub = getCurrentSubtitle()
      if (!sub) {
        showNotification("subtitle not found")
      }
      if (!detectFfmpeg()) {
        showNotification("ffmpeg not found")
        return
      }
      if (!detectCmd("curl")) {
        showNotification("curl not found")
        return
      }
      translate({
        targetLang,
        sourceLang,
        mix: true,
        firstFontSize,
        secondFontSize,
        firstSubColor,
        firstSubFontface,
        secondSubFontface,
        secondSubColor,
      })
    })
    registerScriptMessage("interactive-translate", () => {
      const sub = getCurrentSubtitle()
      if (!sub) {
        showNotification("subtitle not found")
      }
      if (!detectCmd("curl")) {
        showNotification("curl not found")
        return
      }
      setText(textCache.current)
      setActive((v) => !v)
      setPropertyBool("sub-visibility", !getPropertyBool("sub-visibility"))
    })

    observeProperty("sub-text", "string", (_, value) => {
      update.current?.(value)
      textCache.current = value
    })
  }, [])
  const isMix = !!TrackInfoBackupMix
  return (
    active && (
      <Box
        display="flex"
        position="absolute"
        width="100%"
        height="100%"
        flexDirection="row"
        justifyContent="end"
        alignItems="center"
        {...props}
      >
        {text
          .trim()
          .replaceAll("\r\n", "\n")
          .split("\n")
          .map((i, k) => (
            <Line
              videoScale={videoScale}
              isMix={isMix}
              key={[i, k].join()}
              line={i}
              lineIndex={k}
              subConfig={{
                subFontSize,
                subColor,
                subBackColor,
                subBackColorHover,
                subColorHover,
                subBold,
                subScale,
                subOutlineSize,
                subOutlineColor,
                targetLang,
                sourceLang,
                subZIndex,
                subSrtScale,
                firstSubColor,
                firstSubFontface,
                secondSubFontface,
                secondSubColor,
              }}
            />
          ))}
      </Box>
    )
  )
}
