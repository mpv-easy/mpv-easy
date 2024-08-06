import React, { useEffect, useState } from "react"
import { Box } from "@mpv-easy/react"
import { addKeyBinding, getOsdSize, setPropertyBool } from "@mpv-easy/tool"

const low = 10
const high = 60
const step = 5
const count = (high - low) / step + 1

const bg = "000000"
const color = "FFFFFF"
const cursorSize = 16
export function Fps() {
  const osd = { width: 0, height: 0, ...getOsdSize() }
  const [offset, setOffset] = useState(Array(count).fill(0))
  useEffect(() => {
    setPropertyBool("pause", true)
    addKeyBinding("space", "space", () => {
      console.log("space")

      for (let i = 0; i < count; i++) {
        const inv = i * step + low
        console.log("inv: ", inv)
        setInterval(() => {
          setOffset((list) => {
            const v = list[i]
            const newList = [...list]
            newList[i] = v + 10
            return newList
          })
        }, inv)
      }
    })
  }, [])

  return offset.map((v, k) => {
    const x = 0
    const y = k * (osd.height / count)
    const width = osd.width
    const height = osd.height / count

    const offsetX = v - cursorSize / 2
    const offsetY = y
    return (
      <Box
        position="absolute"
        key={k}
        x={x}
        y={y}
        width={width}
        height={height}
        backgroundColor={bg}
      >
        <Box
          position="absolute"
          x={offsetX}
          y={offsetY}
          width={cursorSize}
          height={height}
          backgroundColor={color}
        />
      </Box>
    )
  })
}
