import { Button } from "@mpv-easy/ui"
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  pauseSelector,
  type Dispatch,
  i18nSelector,
  mouseHoverStyleSelector,
} from "../../store"
import { command } from "@mpv-easy/tool"

export const Close = () => {
  const button = useSelector(buttonStyleSelector)
  const pause = useSelector(pauseSelector)
  const i18n = useSelector(i18nSelector)
  const dispatch = useDispatch<Dispatch>()
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  return (
    <Button
      id="mpv-easy-button-close"
      title={i18n.close}
      width={button.width}
      height={button.height}
      display="flex"
      justifyContent="center"
      alignItems="center"
      enableMouseStyle={mouseHoverStyle}
      padding={button.padding}
      colorHover={button.colorHover}
      backgroundColorHover={button.backgroundColorHover}
      text={ICON.ChromeClose}
      backgroundColor={button.backgroundColor}
      font={button.font}
      fontSize={button.fontSize}
      color={button.color}
      onMouseDown={(e) => {
        dispatch.context.exit()
      }}
    />
  )
}
