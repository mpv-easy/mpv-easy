import { getOsdSize } from "@mpv-easy/tool"
import { Box } from "@mpv-easy/react"
import React, { useEffect, useState } from "react"

const row = 10
const col = 10
import { COLORS } from "e-color"

const colorList = Object.values(COLORS).map(
  (i) => `#${i.toString(16).padStart(6, "0")}`,
)

export function ColorBoxDirty() {
  const { width, height } = getOsdSize()!
  const [count, setCount] = useState(0)

  useEffect(() => {
    setInterval(() => {
      setCount((c) => c + 1)
    }, 100)
  }, [])

  const boxW = width / col
  const boxH = height / row

  return (
    <Box
      id="color-box-dirty"
      position="relative"
      display="flex"
      width={"100%"}
      height={"100%"}
      alignContent="stretch"
    >
      {new Array(row * col).fill(0).map((_, k) => {
        return (
          <Box
            key={k}
            id={k.toString()}
            width={boxW}
            height={boxH}
            backgroundColor={colorList[k]}
            text={`${k}`}
          />
        )
      })}
      <Box
        position="absolute"
        display="flex"
        id={"count"}
        width={boxW}
        height={boxH}
        backgroundColor={colorList[0]}
        text={`${count}`}
      />
    </Box>
  )
}
