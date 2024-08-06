import { Button } from "@mpv-easy/react"
import React from "react"
import { useSelector } from "react-redux"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  i18nSelector,
  mouseHoverStyleSelector,
} from "../../store"
import { command } from "@mpv-easy/tool"

export const PreviousFrame = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  return (
    <Button
      id="mpv-easy-button-previous-frame"
      title={i18n.previousFrame}
      text={ICON.FastBackward}
      width={button.width}
      height={button.height}
      display="flex"
      justifyContent="center"
      alignItems="center"
      enableMouseStyle={mouseHoverStyle}
      colorHover={button.colorHover}
      backgroundColorHover={button.backgroundColorHover}
      padding={button.padding}
      backgroundColor={button.backgroundColor}
      font={button.font}
      fontSize={button.fontSize}
      color={button.color}
      onMouseDown={() => {
        command("no-osd frame-back-step")
      }}
    />
  )
}
