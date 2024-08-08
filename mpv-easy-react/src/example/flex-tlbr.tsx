import { AssDraw } from "@mpv-easy/assdraw"
import { usePropertyBool } from "@mpv-easy/react"
import { PropertyBool, command, observeProperty } from "@mpv-easy/tool"
import { Box, render } from "@mpv-easy/react"
import React, { useEffect, useState } from "react"

export function FlexTLBR() {
  return (
    <Box
      id="flexMain"
      width={"50%"}
      height={"50%"}
      position="relative"
      display="flex"
      backgroundColor="FF0000"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        id="flex_1"
        width={"25%"}
        height={"25%"}
        left={"25%"}
        top={"25%"}
        backgroundColor="00FF00"
        display="flex"
      >
        {/* <Box
          text="ABCD"
          fontSize={32}
        ></Box> */}
        <Box id="flex_2" width={100} height={100} backgroundColor="0000FF" />
      </Box>
      {/* <Box id="flex_2" width={100} height={100} backgroundColor="0000FF" />
      <Box id="flex_3" width={100} height={200} backgroundColor="0FFFF0" /> */}
    </Box>
  )
}
