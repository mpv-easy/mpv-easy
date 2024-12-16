import { type DropdownItem } from "@mpv-easy/react"
import React from "react"
import { Dropdown } from "@mpv-easy/react"
import * as ICON from "../../icon"
import {
  commonDropdownItemStyleSelector,
  commonDropdownStyleSelector,
  i18nSelector,
  playModeSelector,
} from "../../store"
import { setPropertyBool } from "@mpv-easy/tool"
import { PlayModeList } from "../../mpv-easy-theme"
import { dispatch, useSelector } from "../../models"

export const PlayMode = () => {
  const i18n = useSelector(i18nSelector)
  const playMode = useSelector(playModeSelector)
  const itemStyle = useSelector(commonDropdownItemStyleSelector)
  const LoopIcon = {
    loopOne: ICON.Sync,
    loopAll: ICON.Refresh,
    shuffle: ICON.Shuffle,
  }
  const style = useSelector(commonDropdownStyleSelector)
  const items: DropdownItem[] = PlayModeList.map((i): DropdownItem => {
    return {
      label: `${playMode === i ? ICON.Ok : ICON.CheckboxBlankCircleOutline} ${i18n[i]}`,
      key: i,
      onSelect: (_, e) => {
        dispatch.setPlayMode(i)
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
      style: itemStyle,
    }
  })
  return (
    <Dropdown
      {...style}
      id="mpv-easy-button-play-mode"
      items={items}
      title={i18n.playMode}
      text={LoopIcon[playMode]}
      direction="top"
    />
  )
}
