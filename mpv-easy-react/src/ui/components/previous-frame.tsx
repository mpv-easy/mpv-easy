import React from "react"
import { Button } from "@mpv-easy/react"
import * as ICON from "../../icon"
import { i18nSelector, iconButtonStyle } from "../../store"
import { frameBackStep } from "@mpv-easy/tool"
import { useSelector } from "../../models"

export const PreviousFrame = () => {
  const i18n = useSelector(i18nSelector)
  const style = useSelector(iconButtonStyle)
  return (
    <Button
      {...style}
      id="mpv-easy-button-previous-frame"
      title={i18n.previousFrame}
      text={ICON.FastBackward}
      onMouseDown={() => {
        frameBackStep()
      }}
    />
  )
}
