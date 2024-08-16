import { getOsdSize } from "@mpv-easy/tool"
import { Box } from "@mpv-easy/react"
import React, { useEffect, useState } from "react"

const row = 10
const col = 10

export function Rgb() {
  const { width, height } = getOsdSize()!
  const [blue, setBlue] = useState(0)
  useEffect(() => {
    setInterval(() => {
      setBlue((c) => (c + 5) % 255)
    }, 100)
  }, [])

  const boxW = width / col
  const boxH = height / row

  return new Array(row * col).fill(0).map((_, k) => {
    const x = (k / col) | 0
    const y = k % col
    const r = (((x / row) * 255) | 0).toString(16).padStart(2, "0")
    const g = (((y / col) * 255) | 0).toString(16).padStart(2, "0")
    const b = blue.toString(16).padStart(2, "0")
    const c = `#${r}${g}${b}`
    return (
      <Box
        key={k}
        id={k.toString()}
        width={boxW}
        height={boxH}
        backgroundColor={c}
      />
    )
  })
}

export default Rgb
