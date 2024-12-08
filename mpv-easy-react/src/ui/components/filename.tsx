import { Button } from "@mpv-easy/react"
import React from "react"
import {
  buttonStyleSelector,
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
  const button = useSelector(buttonStyleSelector)
  const path = useSelector(pathSelector)
  const title = getVideoTitle(path) || getVideoName(path) || ""
  // TODO: text-overflow: ellipsis;
  const maxLen = useSelector(toolbarStyleSelector).maxTitleLength
  const text = textEllipsis(title, maxLen)
  const showTitle = text !== title
  return (
    (text?.length ?? 0) > 0 && (
      <Button
        title={showTitle ? title : ""}
        id="mpv-easy-button-filename"
        height={button.height}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        text={text}
        padding={button.padding}
        backgroundColor={button.backgroundColor}
        font={button.font}
        fontSize={button.fontSize}
        color={button.color}
        colorHover={button.colorHover}
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
