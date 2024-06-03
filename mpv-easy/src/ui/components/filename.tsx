import { pluginName } from "../../main"
import { Box } from "@mpv-easy/ui"
import React from "react"
import { useSelector } from "react-redux"
import {
  RootState,
  buttonStyleSelector,
  controlStyleSelector,
  filenameSelector,
  fullscreenSelector,
  osdDimensionsSelector,
  toolbarStyleSelector,
} from "../../store"

export const Filename = () => {
  const button = useSelector(buttonStyleSelector)
  const fileName = useSelector(filenameSelector)

  // TODO: text-overflow: ellipsis;
  const maxLen = useSelector(toolbarStyleSelector).maxTitleLength
  const text = fileName.slice(0, maxLen)

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
