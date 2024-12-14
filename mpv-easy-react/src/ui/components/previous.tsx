import React from "react"
import { Button } from "@mpv-easy/react"
import * as ICON from "../../icon"
import { i18nSelector, iconButtonStyle } from "../../store"
import { dispatch, useSelector } from "../../models"

export const Previous = () => {
  const i18n = useSelector(i18nSelector)
  const style = useSelector(iconButtonStyle)
  return (
    <Button
      {...style}
      id="mpv-easy-button-previous"
      title={i18n.previous}
      text={ICON.ChevronLeft}
      onMouseDown={() => {
        dispatch.previous()
      }}
    />
  )
}
