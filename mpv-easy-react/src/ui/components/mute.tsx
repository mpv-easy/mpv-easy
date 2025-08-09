import React from "react"
import { Button } from "@mpv-easy/react"
import * as ICON from "../../icon"
import { i18nSelector, iconButtonStyle, muteSelector } from "../../store"
import { dispatch, useSelector } from "../../models"

export const Mute = () => {
  const mute = useSelector(muteSelector)
  const i18n = useSelector(i18nSelector)
  const style = useSelector(iconButtonStyle)
  return (
    <Button
      {...style}
      id="mpv-easy-button-mute"
      title={mute ? i18n.unmute : i18n.mute}
      text={mute ? ICON.Unmute : ICON.Mute}
      onMouseDown={(_e) => {
        dispatch.setMute(!mute)
      }}
    />
  )
}
