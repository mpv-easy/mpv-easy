import { Button } from "@mpv-easy/react"
import React from "react"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  i18nSelector,
  mouseHoverStyleSelector,
} from "../../store"
import { dispatch, useSelector } from "../../models"

export const Minimize = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  return (
    <Button
      id="mpv-easy-button-minimize"
      title={i18n.minimize}
      width={button.width}
      height={button.height}
      display="flex"
      justifyContent="center"
      alignItems="center"
      enableMouseStyle={mouseHoverStyle}
      padding={button.padding}
      colorHover={button.colorHover}
      backgroundColorHover={button.backgroundColorHover}
      text={ICON.ChromeMinimize}
      backgroundColor={button.backgroundColor}
      font={button.font}
      fontSize={button.fontSize}
      color={button.color}
      onMouseDown={() => {
        dispatch.setWindowMinimized(true)
        // e.stopPropagation()
      }}
    />
  )
}
