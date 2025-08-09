import { type DropdownItem } from "@mpv-easy/react"
import React from "react"
import { Dropdown } from "@mpv-easy/react"
import * as ICON from "../../icon"
import { getSubtitleTracks } from "@mpv-easy/tool"
import {
  i18nSelector,
  sidSelector,
  commonDropdownStyleSelector,
  commonDropdownItemStyleSelector,
} from "../../store"
import { dispatch, useSelector } from "../../models"

export const SubtitleTrack = () => {
  const i18n = useSelector(i18nSelector)
  const itemStyle = useSelector(commonDropdownItemStyleSelector)
  const sid = useSelector(sidSelector)
  const tracks = getSubtitleTracks()
  const style = useSelector(commonDropdownStyleSelector)

  const items = tracks.map(({ title, lang, external, id }, k): DropdownItem => {
    const key = [title, lang, external, k].join("-")
    const prefix = sid === id ? ICON.Ok : ICON.CheckboxBlankCircleOutline
    const label = `${prefix} ${title ?? lang ?? "default"}`
    return {
      label,
      key,
      onSelect: (_, e) => {
        dispatch.setSid(id === sid ? -1 : id)
        e.stopPropagation()
      },
      style: itemStyle,
    }
  })
  return (
    <Dropdown
      {...style}
      id="mpv-easy-button-subtitle-track"
      direction="top"
      title={i18n.subtitleTrack}
      items={items}
      text={ICON.Subtitles}
    />
  )
}
