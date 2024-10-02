import {
  getLang,
  getPropertyBool,
  observeProperty,
  registerScriptMessage,
  setPropertyBool,
} from "@mpv-easy/tool"
import React, { useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import {
  buttonStyleSelector,
  Dispatch,
  fontSizeSelector,
  IconButtonSizeSelector,
} from "../store"
import { Box, Button } from "@mpv-easy/react"
import { bingClientSearch } from "@mpv-easy/translate"
import { playAuido } from "../../../mpv-tool/src/audio"
import { useSelector } from "react-redux"
import { google } from "../../../mpv-translate/src/google"

type WordInfo = {
  word: string
  detail: string[]
  audio?: string
}

async function getWordInfo(w: string): Promise<WordInfo> {
  const text = await bingClientSearch(w)
  const detail = (text.match(/data-detailinition="(.*?)"/)?.[1] || "").split(
    ";",
  )
  const word = text.match(/data-word="(.*?)"/)?.[1] || w
  const audio = text.match(/audiomd5="(.*?)"/)?.[1] || ""

  return {
    word,
    detail,
    audio,
  }
}

function split(str: string): string[] {
  return str.trim().replaceAll(/\s+/g, " ").replaceAll(" ", "  ").split(" ")
}

const PunctuationRegex = /[!"#$%&()*+,./:;<=>?@\[\]\^\{\|\}~]/g
function cleanWord(w: string): string {
  return w.replaceAll(PunctuationRegex, "")
}

function Word({ word, showTitle }: { word: string; showTitle: boolean }) {
  const fontSize = useSelector(fontSizeSelector)
  const [info, setInfo] = useState<WordInfo>({
    word: "",
    detail: [],
  })
  const loading = useRef(false)
  const style = useSelector(buttonStyleSelector)

  useEffect(() => {
    if (loading.current || !word.length) return
    loading.current = true
    getWordInfo(cleanWord(word)).then((info) => {
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
      fontSize={fontSize}
      color={style.color}
      colorHover={style.colorHover}
      // backgroundColorHover={style.backgroundColorHover}
      title={showTitle ? info.detail.join("\n").trim() : ""}
      text={word}
    />
  ) : (
    <Box
      width={word === "" ? fontSize / 2 : undefined}
      height={word === "" ? fontSize / 2 : undefined}
    />
  )
}

function Line({ line }: { line: string }) {
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
        <Word showTitle={showTitle} key={[i, k].join(",")} word={i.trim()} />
      ))}
    </Box>
  )
}

export function Translation() {
  const [active, setActive] = useState(false)
  const dispatch = useDispatch<Dispatch>()
  const [text, setText] = useState("")

  const update = useRef<(s: string) => void>()
  update.current = (s: string) => {
    setText(active ? s || "" : "")
  }
  useEffect(() => {
    registerScriptMessage("translate", () => {
      dispatch.context.translate()
    })

    registerScriptMessage("interactive-translate", async () => {
      setActive((v) => !v)
      const v = getPropertyBool("sub-visibility")
      setPropertyBool("sub-visibility", !v)
    })

    observeProperty("sub-text", "string", (_, value) => {
      update.current?.(value)
    })
  }, [])
  const h = useSelector(IconButtonSizeSelector)

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
      bottom={h * 2}
    >
      {text
        .trim()
        .replaceAll("\r\n", "\n")
        .split("\n")
        .map((i, k) => (
          <Line key={[i, k].join()} line={i} />
        ))}
    </Box>
  )
}
