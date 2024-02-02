import { Button, Dropdown } from "@mpv-easy/ui"
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  pauseSelector,
  Dispatch,
  i18nSelector,
  mouseHoverStyleSelector,
  dropdownStyleSelector,
} from "../../store"

export const AudioTrack = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const dispatch = useDispatch<Dispatch>()
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)

  const dropdown = useSelector(dropdownStyleSelector)
  return (
    <Dropdown
      id="mpv-easy-button-audio-track"
      text={ICON.Waveform}
      title={i18n.AudioTrack}
      width={button.width}
      height={button.height}
      direction="top"
      items={[
        {
          label: "cn",
          key: "cn",
          onSelect: () => {},
        },
        {
          label: "en",
          key: "en",
          onSelect: () => {},
        },
      ]}
      dropdownStyle={dropdown.button}
      display="flex"
      justifyContent="center"
      alignItems="center"
      enableMouseStyle={mouseHoverStyle}
      colorHover={dropdown.colorHover}
      backgroundColorHover={dropdown.backgroundColorHover}
      padding={dropdown.padding}
      backgroundColor={dropdown.backgroundColor}
      font={dropdown.font}
      fontSize={dropdown.fontSize}
      color={dropdown.color}
      onMouseDown={(e) => {
        // dispatch.context.screenshot()
        // e.stopPropagation()
      }}
    />
  )
}
