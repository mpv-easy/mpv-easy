import { Box, render } from "@mpv-easy/ui"
import React from "react"

const size = 200
function BorderBox() {
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
    ></Box>
  )
}

render(<BorderBox />)
