import React from "react"
import { Button } from "@mpv-easy/react"
import * as ICON from "../../icon"
import { i18nSelector, iconButtonStyle } from "../../store"
import { dispatch, useSelector } from "../../models"

export const Restore = () => {
  const i18n = useSelector(i18nSelector)
  const style = useSelector(iconButtonStyle)
  return (
    <Button
      {...style}
      id="mpv-easy-button-restore"
      title={i18n.restore}
      text={ICON.ChromeRestore}
      onMouseDown={() => {
        dispatch.setFullscreen(false)
      }}
    />
  )
}
