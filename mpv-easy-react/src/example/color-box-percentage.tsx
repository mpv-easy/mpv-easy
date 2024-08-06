import { Box, render } from "@mpv-easy/react"
import React from "react"

import { COLORS } from "e-color"

const row = 4
const col = 8
const N = row * col
const boxW = `${(1 / col) * 100}%`
const boxH = `${(1 / row) * 100}%`

const colorList = Object.values(COLORS).map((i) =>
  i.toString(16).padStart(6, "0"),
)

export function ColorBoxPercentage() {
  console.log(boxW, boxH, N, colorList.length, colorList.join(","))
  return new Array(N).fill(0).map((_, k) => {
    return (
      <Box
        key={k}
        id={k.toString()}
        width={boxW}
        height={boxH}
        backgroundColor={colorList[k]}
      />
    )
  })
}
