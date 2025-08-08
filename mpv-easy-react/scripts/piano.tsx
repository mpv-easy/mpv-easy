import "@mpv-easy/polyfill"
import { Box, render, useProperty } from "@mpv-easy/react"
import {
  addKeyBinding,
  getOptions,
  getScriptDir,
  joinPath,
  playAudio,
  setPropertyBool,
} from "@mpv-easy/tool"
import React, { useEffect, useState } from "react"
import {
  Notes,
  getBlackKeys,
  getBlackOffsetX,
  getChar,
  getWhiteKeys,
} from "free-piano"

const White = "#FFFFFF"
const Black = "#000000"
const Gray = "#D3D3D3"
const Yellow = "#00FFFF"
const AudiosDir = "audios"

type Config = {
  blackHeight: number
  blackBg: string
  blackColor: string
  blackBorderColor: string
  blackBorderSize: number
  blackPressBg: string
  blackPressColor: string
  blackPressBorderColor: string

  whiteHeight: number
  whiteBg: string
  whiteColor: string
  whiteBorderColor: string
  whiteBorderSize: number
  whitePressBg: string
  whitePressColor: string
  whitePressBorderColor: string

  audiosDir: string
}
const DefaultBorderSize = 0.002
const DefaultWhiteHeight = 0.5
const DefaultBlackHeight = 0.25
const DefaultConfig: Config = {
  blackHeight: DefaultBlackHeight,
  blackBg: Black,
  blackColor: White,
  blackBorderColor: Gray,
  blackBorderSize: DefaultBorderSize,
  blackPressBg: Yellow,
  blackPressColor: White,
  blackPressBorderColor: White,

  whiteHeight: DefaultWhiteHeight,
  whiteBg: White,
  whiteColor: Black,
  whiteBorderColor: Gray,
  whiteBorderSize: DefaultBorderSize,
  whitePressBg: Yellow,
  whitePressColor: Black,
  whitePressBorderColor: Black,
  audiosDir: joinPath(getScriptDir(), AudiosDir),
}

const {
  blackHeight,
  blackBg,
  blackColor,
  blackBorderColor,
  blackBorderSize,
  blackPressBg,
  blackPressColor,
  blackPressBorderColor,

  whiteHeight,
  whiteBg,
  whiteColor,
  whiteBorderColor,
  whiteBorderSize,
  whitePressBg,
  whitePressColor,
  whitePressBorderColor,
  audiosDir,
} = {
  ...DefaultConfig,
  ...getOptions("mpv-easy-piano", {
    "audios-dir": {
      type: "string",
      key: "audiosDir",
    },

    "black-height": {
      type: "number",
      key: "blackHeight",
    },
    "black-bg": {
      type: "color",
      key: "blackBg",
    },
    "black-color": {
      type: "color",
      key: "blackColor",
    },
    "black-press-color": {
      type: "color",
      key: "blackPressColor",
    },
    "black-press-bg": {
      type: "color",
      key: "blackPressBg",
    },
    "black-border-color": {
      type: "color",
      key: "blackBorderColor",
    },
    "black-border-size": {
      type: "number",
      key: "blackBorderSize",
    },
    "black-press-border-color": {
      type: "color",
      key: "blackPressBorderColor",
    },

    "white-height": {
      type: "number",
      key: "whiteHeight",
    },
    "white-bg": {
      type: "color",
      key: "whiteBg",
    },
    "white-color": {
      type: "color",
      key: "whiteColor",
    },
    "white-press-color": {
      type: "color",
      key: "whitePressColor",
    },
    "white-press-bg": {
      type: "color",
      key: "whitePressBg",
    },
    "white-border-color": {
      type: "color",
      key: "whiteBorderColor",
    },
    "white-border-size": {
      type: "number",
      key: "whiteBorderSize",
    },
    "white-press-border-color": {
      type: "color",
      key: "whitePressBorderColor",
    },
  }),
}

console.log(Notes.length)

const BlackKeys = getBlackKeys("Small")
const WhiteKeys = getWhiteKeys("Small")
const N = WhiteKeys.length
const WhiteZIndex = 100
const BlackZIndex = 200

const CharMap: string[] = []

for (const i of [...BlackKeys, ...WhiteKeys]) {
  CharMap[i.midi] = getChar(i.midi)
}

function App({
  blackHeight,
  blackBg,
  blackColor,
  blackBorderColor,
  blackBorderSize,
  blackPressBg,
  blackPressColor,
  blackPressBorderColor,

  whiteHeight,
  whiteBg,
  whiteColor,
  whiteBorderColor,
  whiteBorderSize,
  whitePressBg,
  whitePressColor,
  whitePressBorderColor,
  audiosDir,
}: Config) {
  const { w, h } = useProperty("osd-dimensions")[0]
  const [pressMap, setPressMap] = useState<Record<number, boolean>>({})
  const whiteBorderW = whiteBorderSize * w
  const whiteWidth = w / N
  const whiteKeyH = h * whiteHeight

  const blackKeyH = h * blackHeight
  const blackBorderW = blackBorderSize * w
  const blackWidth = w / N
  const y = h - whiteKeyH

  const onKeydown = (midi: number) => {
    const url = `${audiosDir}/${midi}.mp3`
    playAudio(url)
    setPressMap({
      ...pressMap,
      [midi]: true,
    })
  }

  const onKeyup = (midi: number) => {
    setPressMap({
      ...pressMap,
      [midi]: false,
    })
  }

  useEffect(() => {
    setPropertyBool("pause", true)
    for (let midi = 0; midi < CharMap.length; midi++) {
      if (!CharMap[midi]) {
        continue
      }
      addKeyBinding(
        CharMap[midi],
        `MPV_EASY_PIANO${midi}`,
        (event) => {
          if (event.event === "down") {
            onKeydown(midi)
          } else if (event.event === "up") {
            onKeyup(midi)
          }
        },
        {
          complex: true,
          repeatable: true,
          forced: false,
        },
      )
    }
  }, [])

  return (
    <Box display="flex" position="relative" width={w} height={h}>
      {WhiteKeys.map((i, index) => {
        const x = whiteWidth * index
        const wbg = pressMap[i.midi] ? whitePressBg : whiteBg
        const wbc = pressMap[i.midi] ? whitePressBorderColor : whiteBorderColor
        const wc = pressMap[i.midi] ? whitePressColor : whiteColor
        return (
          <Box
            display="flex"
            key={i.midi}
            flexDirection="column"
            position="relative"
            zIndex={WhiteZIndex}
            width={whiteWidth - 2 * whiteBorderW}
            height={whiteKeyH}
            x={x}
            y={y}
            backgroundColor={wbg}
            borderSize={whiteBorderW}
            borderColor={wbc}
            fontSize={whiteWidth / 2}
            color={wc}
          >
            <Box
              display="flex"
              position="relative"
              width={"100%"}
              height={whiteWidth * 2}
              bottom={0}
            >
              <Box
                width={"100%"}
                height={whiteWidth}
                justifyContent="center"
                display="flex"
                position="relative"
                color={wc}
                fontSize={(whiteWidth / 2) * 1.5}
                text={CharMap[i.midi]}
              />
              <Box
                width={"100%"}
                justifyContent="center"
                display="flex"
                position="relative"
                color={wc}
                fontSize={whiteWidth / 2}
                text={i.name}
              />
            </Box>
          </Box>
        )
      })}

      {BlackKeys.map((i, index) => {
        const x = blackWidth * getBlackOffsetX(index, "Small")
        const bbg = pressMap[i.midi] ? blackPressBg : blackBg
        const bbc = pressMap[i.midi] ? blackPressBorderColor : blackBorderColor
        const bc = pressMap[i.midi] ? blackPressColor : blackColor
        return (
          <Box
            key={i.midi}
            flexDirection="column"
            alignItems="end"
            textAlign="center"
            position="relative"
            zIndex={BlackZIndex}
            width={blackWidth - 2 * blackBorderW}
            height={blackKeyH}
            x={x}
            y={y}
            backgroundColor={bbg}
            borderSize={blackBorderW}
            borderColor={bbc}
            color={bc}
            fontSize={blackWidth / 2}
          >
            <Box
              display="flex"
              position="relative"
              width={"100%"}
              height={blackWidth * 2}
              bottom={0}
            >
              <Box
                width={"100%"}
                height={blackWidth}
                justifyContent="center"
                display="flex"
                position="relative"
                color={bc}
                fontSize={(blackWidth / 2) * 1.5}
                text={CharMap[i.midi]}
              />
              <Box
                width={"100%"}
                justifyContent="center"
                display="flex"
                position="relative"
                color={bc}
                fontSize={blackWidth / 2}
                text={i.name.replaceAll("#", "")}
              />
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

render(
  <App
    blackHeight={blackHeight}
    blackBg={blackBg}
    blackColor={blackColor}
    blackBorderColor={blackBorderColor}
    blackBorderSize={blackBorderSize}
    blackPressBg={blackPressBg}
    blackPressColor={blackPressColor}
    blackPressBorderColor={blackPressBorderColor}
    whiteHeight={whiteHeight}
    whiteBg={whiteBg}
    whiteColor={whiteColor}
    whiteBorderColor={whiteBorderColor}
    whiteBorderSize={whiteBorderSize}
    whitePressBg={whitePressBg}
    whitePressColor={whitePressColor}
    whitePressBorderColor={whitePressBorderColor}
    audiosDir={audiosDir}
  />,
)
