import { Box } from "@mpv-easy/ui"
import React from "react"
import { useSelector } from "react-redux"
import {
  buttonStyleSelector,
  filenameSelector,
  toolbarStyleSelector,
} from "../../store"
import { textEllipsis } from "../../common"

export const Filename = () => {
  const button = useSelector(buttonStyleSelector)
  const fileName = useSelector(filenameSelector)

  // TODO: text-overflow: ellipsis;
  const maxLen = useSelector(toolbarStyleSelector).maxTitleLength
  const text = textEllipsis(fileName, maxLen)

  return (
    (fileName?.length ?? 0) > 0 && (
      <Box
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
      />
    )
  )
}
