import React from "react"
import { Button } from "@mpv-easy/react"
import * as ICON from "../../icon"
import { i18nSelector, iconButtonStyle } from "../../store"
import { frameStep } from "@mpv-easy/tool"
import { useSelector } from "../../models"

export const NextFrame = () => {
  const i18n = useSelector(i18nSelector)
  const style = useSelector(iconButtonStyle)
  return (
    <Button
      {...style}
      id="mpv-easy-button-next-frame"
      title={i18n.nextFrame}
      text={ICON.FastForward}
      onMouseDown={(_e) => {
        frameStep()
      }}
    />
  )
}
