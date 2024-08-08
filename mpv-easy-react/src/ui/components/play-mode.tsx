import { Dropdown, type DropdownItem } from "@mpv-easy/react"
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  dropdownStyleSelector,
  i18nSelector,
  mouseHoverStyleSelector,
  playModeSelector,
  type Dispatch,
} from "../../store"
import { setPropertyBool } from "@mpv-easy/tool"
import { PlayModeList } from "../../mpv-easy-theme"

export const PlayMode = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  const playMode = useSelector(playModeSelector)
  const dropdown = useSelector(dropdownStyleSelector)
  const LoopIcon = {
    loopOne: ICON.Sync,
    loopAll: ICON.Refresh,
    shuffle: ICON.Shuffle,
  }
  const dispatch = useDispatch<Dispatch>()
  const items: DropdownItem[] = PlayModeList.map((i): DropdownItem => {
    return {
      label: `${playMode === i ? ICON.Ok : ICON.CheckboxBlankCircleOutline} ${i18n[i]}`,
      key: i,
      onSelect: (_, e) => {
        dispatch.context.setPlayMode(i)
        if (i === i18n.loopOne) {
          setPropertyBool("loop-playlist", false)
          setPropertyBool("loop-file", true)
          setPropertyBool("shuffle", false)
        } else if (i === i18n.loopAll) {
          setPropertyBool("loop-file", false)
          setPropertyBool("loop-playlist", true)
          setPropertyBool("shuffle", false)
        } else if (i === i18n.shuffle) {
          setPropertyBool("shuffle", true)
          setPropertyBool("loop-file", false)
          setPropertyBool("loop-playlist", true)
        }
        e.stopPropagation()
      },
      style: {
        ...dropdown.item,
        justifyContent: "start",
      },
    }
  })
  return (
    <Dropdown
      id="mpv-easy-button-play-mode"
      items={items}
      title={i18n.playMode}
      text={LoopIcon[playMode]}
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
      pageDown={{ style: dropdown.item, text: ICON.TriangleDown }}
      pageUp={{ style: dropdown.item, text: ICON.TriangleUp }}
    />
  )
}
