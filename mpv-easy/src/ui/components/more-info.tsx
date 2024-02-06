import { Button } from "@mpv-easy/ui"
import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  pauseSelector,
  Dispatch,
  i18nSelector,
  mouseHoverStyleSelector,
} from "../../store"
import { command } from "@mpv-easy/tool"

export const MoreInfo = () => {
  const button = useSelector(buttonStyleSelector)
  const pause = useSelector(pauseSelector)
  const i18n = useSelector(i18nSelector)
  const [consoleShow, setConsoleShow] = useState(false)

  // const dispatch = useDispatch<Dispatch>()
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  return (
    <Button
      id="mpv-easy-button-more-info"
      text={ICON.Info}
      title={i18n.moreInfo}
      width={button.width}
      height={button.height}
      display="flex"
      justifyContent="center"
      alignItems="center"
      enableMouseStyle={mouseHoverStyle}
      padding={button.padding}
      backgroundColor={button.backgroundColor}
      font={button.font}
      fontSize={button.fontSize}
      color={button.color}
      onMouseDown={(e) => {
        // dispatch.context.setPause(!pause)
        // e.stopPropagation()
        console.log("move-info", consoleShow)
        if (consoleShow) {
          // command('set display-stats-toggle yes')
          command("script-binding console/enable")
        } else {
          command("script-message-to console type")
        }
        setConsoleShow((c) => !c)
        // command('script-message-to console type')
      }}
      colorHover={button.colorHover}
      backgroundColorHover={button.backgroundColorHover}
    />
  )
}
