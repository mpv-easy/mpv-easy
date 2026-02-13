import React from "react"
import { Button } from "@mpv-easy/react"
import * as ICON from "../../icon"
import { historyHideSelector, i18nSelector, iconButtonStyle } from "../../store"
import { dispatch, useSelector } from "../../models"
import { useTitle } from "../../hooks"

export const History = () => {
  const i18n = useSelector(i18nSelector)
  const historyHide = useSelector(historyHideSelector)
  const style = useSelector(iconButtonStyle)
  return (
    <Button
      {...style}
      text={ICON.History}
      id="mpv-easy-button-history"
      title={useTitle(i18n.history)}
      onMouseDown={(e) => {
        dispatch.setPlaylistHide(true)
        dispatch.setHistoryHide(!historyHide)
        e.stopPropagation()
      }}
    />
  )
}
