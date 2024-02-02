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

export const SubtitleTrack = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const dispatch = useDispatch<Dispatch>()
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)

  const dropdown = useSelector(dropdownStyleSelector)
  return (
    <Dropdown
      id="mpv-easy-button-subtitle-track"
      direction="top"
      title={i18n.SubtitleTrack}
      items={[
        {
          label: "en",
          key: "en",
          onSelect: () => {},
        },
        {
          label: "cn",
          key: "cn",
          onSelect: () => {},
        },
      ]}
      text={ICON.Subtitles}
      dropdownStyle={dropdown.button}
      width={button.width}
      height={button.height}
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
        // e.stopPropagation()
      }}
    />
  )
}
