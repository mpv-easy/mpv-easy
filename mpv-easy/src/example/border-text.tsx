import { Box, render } from "@mpv-easy/ui"
import React from "react"

const size = 200
function BorderText() {
  return (
    <Box
      position="absolute"
      x={size}
      y={size}
      text="ABCD"
      fontBorderSize={8}
      fontSize={48}
      fontBorderColor={"FF0000C0"}
      backgroundColor="00FFFFA0"
    ></Box>
  )
}

render(<BorderText />)
