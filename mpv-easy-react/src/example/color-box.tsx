import { getOsdSize } from "@mpv-easy/tool"
import { Box, render } from "@mpv-easy/react"
import React, { useEffect, useState } from "react"

const row = 10
const col = 10
import { COLORS } from "e-color"

const colorList = Object.values(COLORS).map((i) =>
  i.toString(16).padStart(6, "0"),
)

export function ColorBox() {
  const { width, height } = getOsdSize()!
  const [count, setCount] = useState(0)

  useEffect(() => {
    setInterval(() => {
      setCount((c) => c + 1)
    }, 100)
  }, [])

  const boxW = width / col
  const boxH = height / row

  // console.log(boxW, boxH, colorList.join(","))
  return new Array(row * col).fill(0).map((_, k) => {
    return (
      <Box
        key={k}
        id={k.toString()}
        width={boxW}
        height={boxH}
        backgroundColor={colorList[k]}
        text={`${count}`}
      />
    )
  })
}
