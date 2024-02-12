import React from "react"

import { Box, AutoHide, render } from "@mpv-easy/ui"
import { Progress } from "./progress"

export function AutoHideBox() {
  return (
    <Box
      height={"50%"}
      width={"50%"}
      left={"25%"}
      top={"25%"}
      display="flex"
      justifyContent="center"
      alignItems="center"
      backgroundColor="00FF00A0"
    >
      <AutoHide
        showDelay={0}
        hideDelay={0}
        initHide={false}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Box width={500} height={500} backgroundColor="00FFFFA0"></Box>
      </AutoHide>
    </Box>
  )
}
