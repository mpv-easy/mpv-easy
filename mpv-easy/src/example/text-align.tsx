import { Box, render } from "@mpv-easy/ui"
import React, { useEffect, useState } from "react"

export function TextAlign() {
  return (
    <Box
      position="absolute"
      x={400}
      y={200}
      text="ABCD"
      fontSize={32}
      // width={600}
      // height={400}
      backgroundColor="FF0000"
      color="0000FF"
      justifyContent="center"
      alignItems="center"
    ></Box>
  )
}
