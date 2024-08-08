import { getOsdSize } from "@mpv-easy/tool"
import { Box } from "@mpv-easy/react"
import React, { useState } from "react"

const row = 3
const col = 3
import { COLORS } from "e-color"

const colorList = Object.values(COLORS).map((i) =>
  i.toString(16).padStart(6, "0"),
)

export function BoxClick() {
  const { width, height } = getOsdSize()!
  const [select, setSelect] = useState(-1)
  const boxW = width / col
  const boxH = height / row

  return new Array(row * col).fill(0).map((_, k) => {
    return (
      <Box
        key={k}
        id={k.toString()}
        width={boxW}
        height={boxH}
        backgroundColor={select === k ? "000000" : colorList[k]}
        onClick={() => {
          console.log("k:", k)
          setSelect(k)
        }}
      />
    )
  })
}
