import React, { useRef } from "react"
import { Box } from "@mpv-easy/react"
import * as ICON from "../../icon"
import { dispatch, iconButtonStyle, logoStyle, useSelector } from "../../store"
import { openDialog, existsSync, getLogoPath } from "@mpv-easy/tool"
import { LOGO_IMAGE_ID } from "../../const"
const TEXT = "Drop files or URLs to play here."

const logoPath = getLogoPath()
const hasLogo = existsSync(logoPath)
const logoSize = 256
export const Logo = () => {
  const style = useSelector(logoStyle)
  const buttonStyle = useSelector(iconButtonStyle)
  const selecting = useRef(false)
  const select = () => {
    if (selecting.current) {
      return
    }
    selecting.current = true
    const list = openDialog()
    if (list.length) {
      dispatch.setPlaylist(list, 0)
    }
    selecting.current = false
  }
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
      {hasLogo ? (
        <Box
          id={LOGO_IMAGE_ID}
          width={logoSize}
          height={logoSize}
          backgroundImage={logoPath}
          backgroundImageFormat="bgra"
          onClick={select}
        />
      ) : (
        <Box text={ICON.Play} {...style} onClick={select} />
      )}
      <Box
        text={TEXT}
        font={buttonStyle.font}
        color={buttonStyle.color}
        fontSize={buttonStyle.fontSize}
        onClick={select}
      />
    </Box>
  )
}
