import { Button } from "@mpv-easy/react"
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  pauseSelector,
  type Dispatch,
  i18nSelector,
  mouseHoverStyleSelector,
} from "../../store"
import { command } from "@mpv-easy/tool"

export const NextFrame = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  return (
    <Button
      id="mpv-easy-button-next-frame"
      title={i18n.nextFrame}
      text={ICON.FastForward}
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
      onMouseDown={(e) => {
        command("no-osd frame-step")
      }}
    />
  )
}
