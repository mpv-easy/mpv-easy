import { Box, render } from "@mpv-easy/react"
import React from "react"

const size = 200
export function BorderBox() {
  return (
    <Box
      position="absolute"
      x={size}
      y={size}
      width={size}
      height={size}
      backgroundColor="00FFFF"
      borderColor="00FF00A0"
      borderSize={size}
      fontBorderColor="00FF00A0"
      padding={size}
    />
  )
}
