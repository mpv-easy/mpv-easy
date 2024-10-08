import {
  getLang,
  getPropertyBool,
  observeProperty,
  registerScriptMessage,
  setPropertyBool,
  playAuido,
  detectCmd,
  printAndOsd,
  getCurrentSubtitle,
} from "@mpv-easy/tool"
import React, { useEffect, useRef, useState } from "react"
import { Box, Button, MpDomProps } from "@mpv-easy/react"
import { google } from "./google"
import { translate } from "./translate"
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

const PunctuationRegex = /[!"#$%&()*+,./:;<=>?@\[\]\^\{\|\}~]/g
function cleanWord(w: string): string {
  return w.replaceAll(PunctuationRegex, "")
}

export function Word({
  word,
  showTitle,
  subConfig,
}: {
  word: string
  showTitle: boolean
  subConfig: SubConfig
}) {
  const [info, setInfo] = useState<WordInfo>({
    word: "",
    detail: [],
  })
  const loading = useRef(false)

  useEffect(() => {
    if (loading.current || !word.length) return
    loading.current = true
    getWordInfo(
      cleanWord(word),
      subConfig.targetLang,
      subConfig.sourceLang,
    ).then((info) => {
      setInfo(info)
      loading.current = false
    })
  }, [word])
  return word.length ? (
    <Button
      onClick={async (e) => {
        if (e.event.key_name === "MBTN_LEFT") {
          if (info.audio?.length) {
            playAuido(info.audio)
          }
          // e.stopPropagation()
          // e.preventdetailault()
        }
      }}
      display="flex"
      position="relative"
      fontSize={subConfig.subFontSize}
      color={subConfig.subColor}
      fontBorderSize={subConfig.subOutlineSize}
      fontBorderColor={subConfig.subOutlineColor}
      fontWeight={subConfig.subBold ? "bold" : "normal"}
      colorHover={subConfig.subColorHover}
      backgroundColorHover={subConfig.subBackColorHover}
      backgroundColor={subConfig.subBackColor}
      title={showTitle ? info.detail.join("\n").trim() : ""}
      text={word}
    />
  ) : (
    <Box
      width={word === "" ? subConfig.subFontSize / 2 : undefined}
      height={word === "" ? subConfig.subFontSize / 2 : undefined}
    />
  )
}

function Line({ line, subConfig }: { line: string; subConfig: SubConfig }) {
  const words = split(line)
  const [showTitle, setShowTitle] = useState(true)
  const loading = useRef(false)
  const [title, setTitle] = useState("")
  useEffect(() => {
    if (loading.current || !line.length) return
    loading.current = true
    google(line, getLang()).then((info) => {
      setTitle(info.trim())
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
          showTitle={showTitle}
          key={[i, k].join(",")}
          word={i.trim()}
          subConfig={subConfig}
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
  } = {
    ...defaultSubConfig,
    ...props,
  }
  const [active, setActive] = useState(false)
  const [text, setText] = useState("")

  const update = useRef<(s: string) => void>()
  update.current = (s: string) => {
    if (active) {
      setText(s || "")
    }
  }
  const targetLang = defTargetLang.toLocaleLowerCase()
  let sourceLang = defSourceLang.toLocaleLowerCase()
  if (!sourceLang.length) {
    const sub = getCurrentSubtitle()
    if (sub) {
      sourceLang = (sub.lang || sub.title || "").toLocaleLowerCase()
    }
  }

  useEffect(() => {
    registerScriptMessage("translate", () => {
      const sub = getCurrentSubtitle
      if (!sub) {
        printAndOsd("subtitle not found")
      }
      if (!detectCmd("ffmpeg")) {
        printAndOsd("ffmpeg not found")
        return
      }
      if (!detectCmd("curl")) {
        printAndOsd("curl not found")
        return
      }
      translate({ targetLang, sourceLang })
    })

    registerScriptMessage("interactive-translate", () => {
      const sub = getCurrentSubtitle
      if (!sub) {
        printAndOsd("subtitle not found")
      }
      if (!detectCmd("curl")) {
        printAndOsd("curl not found")
        return
      }
      setActive((v) => !v)
      setPropertyBool("sub-visibility", !getPropertyBool("sub-visibility"))
    })

    observeProperty("sub-text", "string", (_, value) => {
      update.current?.(value)
    })
  }, [])

  return (
    <Box
      display="flex"
      position="absolute"
      width="100%"
      height="100%"
      hide={!active}
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
            key={[i, k].join()}
            line={i}
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
            }}
          />
        ))}
    </Box>
  )
}
