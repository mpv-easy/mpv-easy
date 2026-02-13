import React from "react"
import { Button } from "@mpv-easy/react"
import {
  iconButtonStyle,
  pathSelector,
  toolbarStyleSelector,
} from "../../store"
import { getVideoName, getVideoTitle, textEllipsis } from "../../common"
import {
  existsSync,
  isRemote,
  isYtdlp,
  openBrowser,
  openExplorer,
} from "@mpv-easy/tool"
import { dispatch, useSelector } from "../../models"
import { useTitle } from "../../hooks"

export const Filename = () => {
  const path = useSelector(pathSelector)
  const titleText =
    (isRemote(path) ? getVideoTitle(path) : getVideoName(path)) || ""

  // TODO: text-overflow: ellipsis;
  const maxLen = useSelector(toolbarStyleSelector).maxTitleLength
  const text = textEllipsis(titleText, maxLen)
  const showTitle = text !== titleText
  const style = useSelector(iconButtonStyle)
  const title = useTitle(showTitle ? titleText : "")
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
