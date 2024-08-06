import { Box } from "@mpv-easy/react"
import React from "react"

export function BoxZIndex() {
  return (
    <Box
      id="flex-main"
      width={"50%"}
      height={"50%"}
      backgroundColor="FF0000"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        id="flex-1"
        width={"50%"}
        height={"50%"}
        backgroundColor="0000FF"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="center"
        alignContent="stretch"
      >
        <Box
          id="flex-2"
          width={"20%"}
          height={"20%"}
          backgroundColor="00FFFF"
          display="flex"
        />
        <Box
          id="flex-3"
          width={"30%"}
          height={"30%"}
          backgroundColor="FFFFFF"
          display="flex"
        />

        <Box
          id="flex-4"
          width={"20%"}
          backgroundColor="000000"
          display="flex"
          position="absolute"
        />
      </Box>
    </Box>
  )
}
