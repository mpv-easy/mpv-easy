import { Box, Button } from "@mpv-easy/react"
import React from "react"

export function FlexAlignContent() {
  return (
    <Box
      id="flex-main"
      width={"50%"}
      height={"50%"}
      backgroundColor="#FF0000"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        id="flex-1"
        width={"50%"}
        height={"50%"}
        backgroundColor="#0000FF"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        alignContent="stretch"
      >
        <Box
          id="flex-2"
          width={"20%"}
          height={"20%"}
          backgroundColor="#00FFFF"
          display="flex"
        />
        <Box
          id="flex-3"
          width={"30%"}
          height={"30%"}
          backgroundColor="#FFFFFF"
          display="flex"
        />
        <Box
          id="flex-4"
          // width={100}
          // height={100}

          text="aaa"
          backgroundColor="#000000"
          display="flex"
        />

        <Button
          id="flex-5"
          text="bbb"
          backgroundColor="#000000"
          display="flex"
        />
      </Box>
    </Box>
  )
}
