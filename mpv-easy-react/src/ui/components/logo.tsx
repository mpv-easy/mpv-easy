import React from "react"
import { Box } from "@mpv-easy/react"
import * as ICON from "../../icon"
import { iconButtonStyle, logoStyle, useSelector } from "../../store"
const TEXT = "Drop files or URLs to play here."
export const Logo = () => {
  const style = useSelector(logoStyle)
  const buttonStyle = useSelector(iconButtonStyle)
  return (
    <Box
      display="flex"
      position="absolute"
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
      flexDirection="row"
    >
      <Box text={ICON.Play} {...style} />
      <Box
        text={TEXT}
        font={buttonStyle.font}
        color={buttonStyle.color}
        fontSize={buttonStyle.fontSize}
      />
    </Box>
  )
}
