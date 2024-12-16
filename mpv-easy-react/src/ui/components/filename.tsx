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
import { useSelector } from "../../models"

export const Filename = () => {
  const path = useSelector(pathSelector)
  const title = getVideoTitle(path) || getVideoName(path) || ""
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
            openBrowser(path)
            return
          }
          if (existsSync(path)) {
            openExplorer(path)
            return
          }
        }}
      />
    )
  )
}
