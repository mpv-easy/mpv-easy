import { AssDraw } from "@mpv-easy/assdraw"
import { usePropertyBool } from "@mpv-easy/hook"
import { PropertyBool, command, observeProperty } from "@mpv-easy/tool"
import { Box, render } from "@mpv-easy/ui"
import React, { useEffect, useState } from "react"

function Flex() {
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
        justifyContent="center"
        alignItems="center"
      >
        <Box
          id="flex-2"
          width={"50%"}
          height={"50%"}
          backgroundColor="00FFFF"
          display="flex"
        ></Box>
      </Box>
    </Box>
  )
}

render(<Flex />)
