import { Button } from "@mpv-easy/react"
import React from "react"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  i18nSelector,
  mouseHoverStyleSelector,
} from "../../store"
import { setPropertyNumber } from "@mpv-easy/tool"
import { dispatch, useSelector } from "../../models"

export const Stop = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  return (
    <Button
      id="mpv-easy-button-stop"
      title={i18n.stop}
      width={button.width}
      height={button.height}
      display="flex"
      justifyContent="center"
      alignItems="center"
      text={ICON.Stop}
      enableMouseStyle={mouseHoverStyle}
      padding={button.padding}
      colorHover={button.colorHover}
      backgroundColorHover={button.backgroundColorHover}
      backgroundColor={button.backgroundColor}
      font={button.font}
      fontSize={button.fontSize}
      color={button.color}
      onMouseDown={() => {
        dispatch.setPause(true)
        dispatch.setTimePos(0)
        setPropertyNumber("time-pos", 0)
      }}
    />
  )
}
