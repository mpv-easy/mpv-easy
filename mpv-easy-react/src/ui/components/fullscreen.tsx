import React from "react"
import { Button } from "@mpv-easy/react"
import * as ICON from "../../icon"
import { i18nSelector, iconButtonStyle } from "../../store"
import { dispatch, useSelector } from "../../models"

export const Fullscreen = () => {
  const i18n = useSelector(i18nSelector)
  const style = useSelector(iconButtonStyle)
  return (
    <Button
      {...style}
      id="mpv-easy-button-fullscreen"
      title={i18n.fullscreen}
      text={ICON.ChromeMaximize}
      onMouseDown={(_e) => {
        dispatch.setFullscreen(true)
      }}
    />
  )
}
