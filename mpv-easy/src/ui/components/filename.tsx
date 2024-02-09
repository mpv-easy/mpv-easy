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
} from "../../store"

export const Filename = () => {
  const button = useSelector(buttonStyleSelector)
  const fileName = useSelector(filenameSelector)
  const w = useSelector(osdDimensionsSelector).w
  const fullscreen = useSelector(fullscreenSelector)
  const buttonCount = fullscreen ? 6 : 3
  const space = w - buttonCount * button.width
  let text = fileName
  if (w && text.length * button.fontSize > space) {
    const len = Math.floor(space / button.fontSize)
    text = text.slice(0, len) + "..."
  }
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
