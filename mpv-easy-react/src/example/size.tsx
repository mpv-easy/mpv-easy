import { Box } from "@mpv-easy/react"
import React from "react"

export function BoxSize() {
  return (
    <Box width={"50%"} height={"50%"} backgroundColor="FF0000">
      <Box width={"50%"} height={"50%"} backgroundColor="00FF00">
        <Box width={"50%"} height={"50%"} backgroundColor="0000FF" />
      </Box>
    </Box>
  )
}
