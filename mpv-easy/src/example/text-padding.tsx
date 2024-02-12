import { Box } from "@mpv-easy/ui"
import React from "react"

export function TextPadding() {
  return (
    <Box
      backgroundColor="FF0000"
      width={"50%"}
      height={"50%"}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        backgroundColor="0000FF"
        // width={"25%"}
        // height={"25%"}
        display="flex"
        color="000000"
        justifyContent="center"
        alignItems="center"
        text="ABC"
        fontSize={32}
      ></Box>
      <Box
        backgroundColor="0000FF"
        // width={"25%"}
        // height={"25%"}
        display="flex"
        color="000000"
        justifyContent="center"
        alignItems="center"
        text="EFG"
        fontSize={32}
      ></Box>
    </Box>
  )
}
