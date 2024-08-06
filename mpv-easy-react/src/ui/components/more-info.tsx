import { Button } from "@mpv-easy/react"
import React, { useState } from "react"
import { useSelector } from "react-redux"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  i18nSelector,
  mouseHoverStyleSelector,
} from "../../store"
import { command } from "@mpv-easy/tool"

export const MoreInfo = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const [consoleShow, setConsoleShow] = useState(false)

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
      onMouseDown={() => {
        if (consoleShow) {
          command("script-message-to console disable")
        } else {
          command("script-message-to console enable")
        }
        setConsoleShow((c) => !c)
      }}
      colorHover={button.colorHover}
      backgroundColorHover={button.backgroundColorHover}
    />
  )
}
