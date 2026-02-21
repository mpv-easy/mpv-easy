import React from "react"
import { Button } from "@mpv-easy/react"
import {
  iconButtonStyle,
  normalFontSizeSelector,
  osdDimensionsSelector,
  pathSelector,
} from "../../store"
import { getVideoName, getVideoTitle } from "../../common"
import {
  existsSync,
  fitTextToWidth,
  isRemote,
  isYtdlp,
  openBrowser,
  openExplorer,
} from "@mpv-easy/tool"
import { dispatch, useSelector } from "../../models"

export const Filename = () => {
  const path = useSelector(pathSelector)
  const titleText =
    (isRemote(path) ? getVideoTitle(path) : getVideoName(path)) || ""
  const fontSize = useSelector(normalFontSizeSelector).fontSize
  const w = useSelector(osdDimensionsSelector).w
  const style = useSelector(iconButtonStyle)
  const text = fitTextToWidth(
    titleText,
    // 6 toolbar buttons and some padding
    w - fontSize * 8,
    fontSize,
  )
  const showTitle = text !== titleText
  const title = showTitle ? titleText : ""
  return (
    (text?.length ?? 0) > 0 && (
      <Button
        {...style}
        title={title}
        id="mpv-easy-button-filename"
        text={text}
        width="auto"
        onMouseUp={() => {
          if (isYtdlp(path) || isRemote(path)) {
            dispatch.setPause(true)
            openBrowser(path)
            return
          }
          if (existsSync(path)) {
            dispatch.setPause(true)
            openExplorer(path)
            return
          }
        }}
      />
    )
  )
}
