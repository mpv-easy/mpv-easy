import React from "react"
import { Button } from "@mpv-easy/react"
import * as ICON from "../../icon"
import { i18nSelector, iconButtonStyle } from "../../store"
import { setPropertyNumber } from "@mpv-easy/tool"
import { dispatch, useSelector } from "../../models"

export const Stop = () => {
  const i18n = useSelector(i18nSelector)
  const style = useSelector(iconButtonStyle)
  return (
    <Button
      {...style}
      id="mpv-easy-button-stop"
      title={i18n.stop}
      text={ICON.Stop}
      onMouseDown={() => {
        dispatch.setPause(true)
        dispatch.setTimePos(0)
        // setPropertyNumber("time-pos", 0)
      }}
    />
  )
}
