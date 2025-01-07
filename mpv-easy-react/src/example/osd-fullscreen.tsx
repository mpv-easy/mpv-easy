import { Box, useProperty } from "@mpv-easy/react"
import React from "react"

export function OsdFullscreen() {
  const { w, h } = useProperty("osd-dimensions")[0]

  return (
    <Box
      id="box-main"
      width={w}
      height={h}
      display="flex"
      backgroundColor="#FF0000"
      justifyContent="center"
      alignItems="center"
    >
      <Box id="box-text" text={`${w} ${h}`} fontSize={w / 8} color="#00FF00" />
    </Box>
  )
}

export default OsdFullscreen
