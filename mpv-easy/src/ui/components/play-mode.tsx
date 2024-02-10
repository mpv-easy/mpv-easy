import { Dropdown, DropdownItem } from "@mpv-easy/ui"
import React, { useState } from "react"
import { useSelector } from "react-redux"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  dropdownStyleSelector,
  i18nSelector,
  mouseHoverStyleSelector,
  smallFontSizeSelector,
} from "../../store"
import { getPropertyNative, setPropertyNative } from "@mpv-easy/tool"

export const PlayMode = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  const [mode, setMode] = useState(i18n.loopPlaylist)

  const items: DropdownItem[] = [i18n.loopFile, i18n.loopPlaylist].map(
    (i): DropdownItem => {
      return {
        label:
          (mode === i ? ICON.Ok : ICON.CheckboxBlankCircleOutline) + " " + i,
        key: i,
        onSelect: () => {
          setMode(i)
          if (i === i18n.loopFile) {
            setPropertyNative("loop-playlist", false)
            setPropertyNative("loop-file", true)
          } else if (i === i18n.loopPlaylist) {
            setPropertyNative("loop-file", false)
            setPropertyNative("loop-playlist", true)
          }
        },
        style: {
          justifyContent: "start",
        },
      }
    },
  )
  const dropdown = useSelector(dropdownStyleSelector)
  const fontSize = useSelector(smallFontSizeSelector)
  return (
    <Dropdown
      id="mpv-easy-button-play-mode"
      items={items}
      title={i18n.playMode}
      width={button.width}
      height={button.height}
      display="flex"
      justifyContent="center"
      alignItems="center"
      direction="top"
      dropdownStyle={dropdown.button}
      colorHover={dropdown.colorHover}
      backgroundColorHover={dropdown.backgroundColorHover}
      padding={dropdown.padding}
      backgroundColor={dropdown.backgroundColor}
      font={dropdown.font}
      fontSize={fontSize}
      color={dropdown.color}
      enableMouseStyle={mouseHoverStyle}
      text={mode === i18n.loopPlaylist ? ICON.Refresh : ICON.Sync}
    />
  )
}
