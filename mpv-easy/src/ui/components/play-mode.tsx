import { Dropdown, type DropdownItem } from "@mpv-easy/ui"
import React, { useState } from "react"
import { useSelector } from "react-redux"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  dropdownStyleSelector,
  i18nSelector,
  mouseHoverStyleSelector,
} from "../../store"
import { setPropertyNative } from "@mpv-easy/tool"

export const PlayMode = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  const [mode, setMode] = useState(i18n.loopPlaylist)
  const dropdown = useSelector(dropdownStyleSelector)

  const items: DropdownItem[] = [i18n.loopFile, i18n.loopPlaylist].map(
    (i): DropdownItem => {
      return {
        label: `${mode === i ? ICON.Ok : ICON.CheckboxBlankCircleOutline} ${i}`,
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
          ...dropdown.item,
          justifyContent: "start",
        },
      }
    },
  )
  return (
    <Dropdown
      id="mpv-easy-button-play-mode"
      items={items}
      title={i18n.playMode}
      text={mode === i18n.loopPlaylist ? ICON.Refresh : ICON.Sync}
      width={button.width}
      height={button.height}
      display="flex"
      justifyContent="center"
      alignItems="center"
      direction="top"
      dropdownStyle={dropdown.button}
      colorHover={dropdown.button.colorHover}
      backgroundColorHover={dropdown.button.backgroundColorHover}
      padding={dropdown.button.padding}
      backgroundColor={dropdown.button.backgroundColor}
      font={dropdown.button.font}
      fontSize={button.fontSize}
      color={dropdown.button.color}
      enableMouseStyle={mouseHoverStyle}
      dropdownListStyle={dropdown.list}
    />
  )
}
