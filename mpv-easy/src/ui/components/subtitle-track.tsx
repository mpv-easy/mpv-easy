import { Dropdown, type DropdownItem } from "@mpv-easy/ui"
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import * as ICON from "../../icon"
import {
  SubtitleTypes,
  existsSync,
  getPropertyBool,
  getPropertyNumber,
  getPropertyString,
  setPropertyNative,
} from "@mpv-easy/tool"
import {
  buttonStyleSelector,
  type Dispatch,
  i18nSelector,
  mouseHoverStyleSelector,
  dropdownStyleSelector,
  sidSelector,
} from "../../store"

type SubtitleTrack = {
  title?: string
  lang?: string
  selected: boolean
  id: number
  external: boolean
}
function getSubtitleTracks(): SubtitleTrack[] {
  const tracks: SubtitleTrack[] = []
  const trackCount = getPropertyNumber("track-list/count") || 0
  for (let i = 0; i < trackCount; i++) {
    const type = getPropertyString(`track-list/${i}/type`)
    if (type === "sub") {
      const title = getPropertyString(`track-list/${i}/title`)
      const lang = getPropertyString(`track-list/${i}/lang`)
      const selected = getPropertyBool(`track-list/${i}/selected`)
      const external = getPropertyBool(`track-list/${i}/external`)
      const id = getPropertyNumber(`track-list/${i}/id`) || 0
      tracks.push({
        title,
        lang,
        selected,
        id,
        external,
      })
    }
  }

  return tracks
}
export const SubtitleTrack = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const dispatch = useDispatch<Dispatch>()
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  const dropdown = useSelector(dropdownStyleSelector)
  const sid = useSelector(sidSelector)
  const tracks = getSubtitleTracks()
  const items = tracks.map(
    ({ title, lang, external, selected, id }, k): DropdownItem => {
      const key = [title, lang, external, k].join("-")
      const prefix = sid === id ? ICON.Ok : ICON.CheckboxBlankCircleOutline
      const label = `${prefix} ${title ?? lang ?? "default"}`
      return {
        label,
        key: key,
        onSelect: (_, e) => {
          if (sid === id) {
            dispatch.context.setSid(-1)
            setPropertyNative("sid", "no")
          } else {
            dispatch.context.setSid(id)
            setPropertyNative("sid", "yes")
            setPropertyNative("sid", id)
          }
          e.stopPropagation()
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
      id="mpv-easy-button-subtitle-track"
      direction="top"
      title={i18n.subtitleTrack}
      items={items}
      text={ICON.Subtitles}
      dropdownStyle={dropdown.button}
      width={button.width}
      height={button.height}
      display="flex"
      justifyContent="center"
      alignItems="center"
      enableMouseStyle={mouseHoverStyle}
      colorHover={dropdown.button.colorHover}
      backgroundColorHover={dropdown.button.backgroundColorHover}
      padding={dropdown.button.padding}
      backgroundColor={dropdown.button.backgroundColor}
      font={dropdown.button.font}
      fontSize={button.fontSize}
      color={dropdown.button.color}
      dropdownListStyle={dropdown.list}
    />
  )
}
