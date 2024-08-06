import { Box } from "@mpv-easy/react"
import React from "react"

export function Relative() {
  return (
    <Box width={"100%"} height={"100%"}>
      <Box
        left={0}
        top={0}
        backgroundColor="FF0000"
        width={"25%"}
        height={"25%"}
      />

      <Box
        right={0}
        top={0}
        backgroundColor="00FF00"
        width={"25%"}
        height={"25%"}
      />
      <Box
        left={0}
        bottom={0}
        backgroundColor="0FF000"
        width={"25%"}
        height={"25%"}
      />
      <Box
        right={0}
        bottom={0}
        backgroundColor="0000FF"
        width={"25%"}
        height={"25%"}
      />
    </Box>
  )
}
