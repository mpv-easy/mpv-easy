import { Button } from "@mpv-easy/ui"
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  pauseSelector,
  Dispatch,
  i18nSelector,
  mouseHoverStyleSelector,
} from "../../store"

export const Play = () => {
  const button = useSelector(buttonStyleSelector)
  const pause = useSelector(pauseSelector)
  const i18n = useSelector(i18nSelector)
  const dispatch = useDispatch<Dispatch>()
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  return (
    <Button
      id="mpv-easy-button-play"
      title={pause ? i18n.play : i18n.pause}
      width={button.width}
      height={button.height}
      display="flex"
      justifyContent="center"
      alignItems="center"
      enableMouseStyle={mouseHoverStyle}
      text={pause ? ICON.Play : ICON.Pause}
      padding={button.padding}
      backgroundColor={button.backgroundColor}
      font={button.font}
      fontSize={button.fontSize}
      color={button.color}
      onMouseDown={(e) => {
        dispatch.context.setPause(!pause)
        // e.stopPropagation()
      }}
      colorHover={button.colorHover}
      backgroundColorHover={button.backgroundColorHover}
    />
  )
}
