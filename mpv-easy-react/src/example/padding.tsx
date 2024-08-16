import React from "react"
import { Box } from "@mpv-easy/react"

export function BoxPadding() {
  return (
    <Box fontSize={32}>
      <Box text="A" backgroundColor="#FF0000" />
      <Box text="A" padding={100} backgroundColor="#00FF00" />
    </Box>
  )
}
