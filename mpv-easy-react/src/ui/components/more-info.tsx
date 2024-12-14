import React, { useState } from "react"
import * as ICON from "../../icon"
import { i18nSelector, iconButtonStyle } from "../../store"
import { command } from "@mpv-easy/tool"
import { useSelector } from "../../models"
import { Button } from "@mpv-easy/react"

export const MoreInfo = () => {
  const i18n = useSelector(i18nSelector)
  const [consoleShow, setConsoleShow] = useState(false)
  const style = useSelector(iconButtonStyle)
  return (
    <Button
      {...style}
      id="mpv-easy-button-more-info"
      text={ICON.Info}
      title={i18n.moreInfo}
      onMouseDown={() => {
        if (consoleShow) {
          command("script-message-to console disable")
        } else {
          command("script-message-to console enable")
        }
        setConsoleShow((c) => !c)
      }}
    />
  )
}
