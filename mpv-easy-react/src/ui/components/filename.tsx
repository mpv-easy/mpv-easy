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

export const Filename = () => {
  const path = useSelector(pathSelector)
  const title =
    (isRemote(path) ? getVideoTitle(path) : getVideoName(path)) || ""

  // TODO: text-overflow: ellipsis;
  const maxLen = useSelector(toolbarStyleSelector).maxTitleLength
  const text = textEllipsis(title, maxLen)
  const showTitle = text !== title
  const style = useSelector(iconButtonStyle)
  return (
    (text?.length ?? 0) > 0 && (
      <Button
        {...style}
        title={showTitle ? title : ""}
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
