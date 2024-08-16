import { Box, Tooltip } from "@mpv-easy/react"
import React from "react"

const size = 400
const dark = "#000000A0"
export function TooltipBox() {
  return (
    <Box id="tooltip-main" title="tooltip-main" width={"100%"} height={"100%"}>
      <Box
        id="left-top"
        title="left-top"
        left={0}
        top={0}
        width={size}
        height={size}
        backgroundColor={dark}
      />
      <Box
        id="right-top"
        title="right-top"
        right={0}
        top={0}
        width={size}
        height={size}
        backgroundColor={dark}
      />
      <Box
        id="left-bottom"
        title="left-bottom"
        left={0}
        bottom={0}
        width={size}
        height={size}
        backgroundColor={dark}
      />
      <Box
        id="right-bottom"
        title="right-bottom"
        right={0}
        bottom={0}
        width={size}
        height={size}
        backgroundColor={dark}
      />

      <Tooltip
        tooltipThrottle={300}
        color="#00FFFF"
        backgroundColor="#00FF00"
      />
    </Box>
  )
}
