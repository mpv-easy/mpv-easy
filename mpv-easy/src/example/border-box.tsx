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
      borderColor="FF0000"
      borderSize={size}
      padding={size}
    ></Box>
  )
}

render(<BorderBox />)
