import { Button } from "@mpv-easy/react"
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  type Dispatch,
  historyHideSelector,
  i18nSelector,
  mouseHoverStyleSelector,
} from "../../store"

export const History = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const dispatch = useDispatch<Dispatch>()
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  const historyHide = useSelector(historyHideSelector)
  return (
    <Button
      text={ICON.History}
      id="mpv-easy-button-history"
      title={i18n.history}
      width={button.width}
      height={button.height}
      display="flex"
      justifyContent="center"
      alignItems="center"
      enableMouseStyle={mouseHoverStyle}
      colorHover={button.colorHover}
      backgroundColorHover={button.backgroundColorHover}
      padding={button.padding}
      backgroundColor={button.backgroundColor}
      font={button.font}
      fontSize={button.fontSize}
      color={button.color}
      onMouseDown={(e) => {
        dispatch.context.setPlaylistHide(true)
        dispatch.context.setHistoryHide(!historyHide)
        e.stopPropagation()
      }}
    />
  )
}
