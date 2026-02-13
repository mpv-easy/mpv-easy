import React from "react"
import { Button } from "@mpv-easy/react"
import * as ICON from "../../icon"
import { i18nSelector, iconButtonStyle } from "../../store"
import { dispatch, useSelector } from "../../models"
import { useTitle } from "../../hooks"

export const Screenshot = () => {
  const i18n = useSelector(i18nSelector)
  const style = useSelector(iconButtonStyle)
  return (
    <Button
      {...style}
      id="mpv-easy-button-screenshot"
      title={useTitle(i18n.screenshot)}
      text={ICON.Camera}
      onMouseDown={() => {
        dispatch.screenshot()
      }}
    />
  )
}
