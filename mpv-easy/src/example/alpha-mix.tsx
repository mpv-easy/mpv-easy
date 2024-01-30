import { Box, render } from "@mpv-easy/ui"
import React from "react"

const size = 400
const color = "000000A0"
function AlphaMix() {
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

render(<AlphaMix />)
