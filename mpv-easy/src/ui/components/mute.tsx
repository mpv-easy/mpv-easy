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
  muteSelector,
} from "../../store"

export const Mute = () => {
  const button = useSelector(buttonStyleSelector)
  const mute = useSelector(muteSelector)
  const dispatch = useDispatch<Dispatch>()
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  const i18n = useSelector(i18nSelector)
  return (
    <Button
      id="mpv-easy-button-mute"
      title={mute ? i18n.unmute : i18n.mute}
      text={mute ? ICON.Unmute : ICON.Mute}
      width={button.width}
      height={button.height}
      display="flex"
      justifyContent="center"
      alignItems="center"
      enableMouseStyle={mouseHoverStyle}
      padding={button.padding}
      colorHover={button.colorHover}
      backgroundColorHover={button.backgroundColorHover}
      backgroundColor={button.backgroundColor}
      font={button.font}
      fontSize={button.fontSize}
      color={button.color}
      onMouseDown={(e) => {
        dispatch.context.setMute(!mute)
        // e.stopPropagation()
      }}
    />
  )
}
