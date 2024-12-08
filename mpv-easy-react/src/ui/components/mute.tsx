import { Button, type ButtonProps } from "@mpv-easy/react"
import React from "react"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  i18nSelector,
  mouseHoverStyleSelector,
  muteSelector,
} from "../../store"
import { dispatch, useSelector } from "../../models"

export const Mute = (props: Partial<ButtonProps> = {}) => {
  const button = useSelector(buttonStyleSelector)
  const mute = useSelector(muteSelector)
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
        dispatch.setMute(!mute)
      }}
      {...props}
    />
  )
}
