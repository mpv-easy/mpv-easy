import { Box, Button } from "@mpv-easy/ui"
import React from "react"
import { useSelector } from "react-redux"
import {
  buttonStyleSelector,
  filenameSelector,
  pathSelector,
  toolbarStyleSelector,
} from "../../store"
import { textEllipsis } from "../../common"
import {
  existsSync,
  isHttp,
  isYtdlp,
  openBrowser,
  openExplorer,
} from "@mpv-easy/tool"

export const Filename = () => {
  const button = useSelector(buttonStyleSelector)
  const fileName = useSelector(filenameSelector)

  // TODO: text-overflow: ellipsis;
  const maxLen = useSelector(toolbarStyleSelector).maxTitleLength
  const text = textEllipsis(fileName, maxLen)
  const path = useSelector(pathSelector)
  return (
    (fileName?.length ?? 0) > 0 && (
      <Button
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
          if (isYtdlp(path) || isHttp(path)) {
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
