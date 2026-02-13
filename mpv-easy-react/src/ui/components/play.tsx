import React from "react"
import { Button } from "@mpv-easy/react"
import * as ICON from "../../icon"
import { pauseSelector, i18nSelector, iconButtonStyle } from "../../store"
import { dispatch, useSelector } from "../../models"
import { useTitle } from "../../hooks"

export const Play = () => {
  const pause = useSelector(pauseSelector)
  const i18n = useSelector(i18nSelector)
  const style = useSelector(iconButtonStyle)
  return (
    <Button
      {...style}
      id="mpv-easy-button-play"
      title={useTitle(pause ? i18n.play : i18n.pause)}
      text={pause ? ICON.Play : ICON.Pause}
      onMouseDown={(_e) => {
        dispatch.setPause(!pause)
      }}
    />
  )
}
