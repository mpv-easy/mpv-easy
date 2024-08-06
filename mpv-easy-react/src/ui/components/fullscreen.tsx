import { Button } from "@mpv-easy/react"
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  type Dispatch,
  i18nSelector,
  mouseHoverStyleSelector,
} from "../../store"

export const Fullscreen = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const dispatch = useDispatch<Dispatch>()
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)

  return (
    <Button
      id="mpv-easy-button-fullscreen"
      title={i18n.fullscreen}
      width={button.width}
      height={button.height}
      display="flex"
      justifyContent="center"
      alignItems="center"
      enableMouseStyle={mouseHoverStyle}
      colorHover={button.colorHover}
      backgroundColorHover={button.backgroundColorHover}
      text={ICON.ChromeMaximize}
      padding={button.padding}
      backgroundColor={button.backgroundColor}
      font={button.font}
      fontSize={button.fontSize}
      color={button.color}
      onMouseDown={(e) => {
        dispatch.context.setFullscreen(true)
      }}
    />
  )
}
