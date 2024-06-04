import { AssDraw } from "@mpv-easy/assdraw"
import { usePropertyBool } from "@mpv-easy/hook"
import { PropertyBool, command, observeProperty } from "@mpv-easy/tool"
import { Box, render } from "@mpv-easy/ui"
import React, { useEffect, useState } from "react"

export function AbsoluteFlex() {
  return (
    <Box
      id="AbsoluteFlexMain"
      width={"100%"}
      height={"100%"}
      backgroundColor="FF0000"
      display="flex"
      justifyContent="center"
      alignItems="center"
      position="relative"
    >
      <Box
        id="AbsoluteFlex"
        width={"100%"}
        height={"100%"}
        backgroundColor="FF0000"
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
