import { Box } from "@mpv-easy/react"
import React from "react"

const size = 400
const color = "#000000A0"
export function AlphaMix() {
  return (
    <>
      <Box
        position="absolute"
        x={size}
        y={size}
        width={size}
        height={size}
        backgroundColor={color}
      />
      <Box
        position="absolute"
        x={size * 1.5}
        y={size * 1.5}
        width={size}
        height={size}
        backgroundColor={color}
      />
    </>
  )
}
