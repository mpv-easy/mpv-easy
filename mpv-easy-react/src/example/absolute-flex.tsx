import { Box } from "@mpv-easy/react"
import React from "react"

export function AbsoluteFlex() {
  return (
    <Box
      id="AbsoluteFlexMain"
      width={"100%"}
      height={"100%"}
      backgroundColor="#FF0000"
      display="flex"
      justifyContent="center"
      alignItems="center"
      position="relative"
    >
      <Box
        id="AbsoluteFlex"
        width={"100%"}
        height={"100%"}
        backgroundColor="#FF0000"
        display="flex"
        justifyContent="center"
        alignItems="center"
        position="absolute"
      >
        <Box id="text" text="center" />
      </Box>
    </Box>
  )
}
