import { pluginName } from "../../main"
import { Box } from "@mpv-easy/ui"
import React from "react"
import { useSelector } from "react-redux"
import {
  RootState,
  buttonStyleSelector,
  controlStyleSelector,
  filenameSelector,
} from "../../store"

export const Filename = () => {
  const button = useSelector(buttonStyleSelector)
  const fileName = useSelector(filenameSelector)

  return (
    (fileName?.length ?? 0) > 0 && (
      <Box
        height={button.height}
        display="flex"
        flexDirection="column"
        justifyContent="start"
        alignItems="end"
        text={fileName}
        padding={button.padding}
        backgroundColor={button.backgroundColor}
        font={button.font}
        fontSize={button.fontSize}
        color={button.color}
      />
    )
  )
}
