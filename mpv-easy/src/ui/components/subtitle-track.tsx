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
  setPropertyNumber,
  setPropertyString,
} from "@mpv-easy/tool"
import {
  buttonStyleSelector,
  type Dispatch,
  i18nSelector,
  mouseHoverStyleSelector,
  dropdownStyleSelector,
  sidSelector,
  smallFontSizeSelector,
} from "../../store"

function getExtraSub(path: string) {
  const prefix = path.split(".").slice(0, -1).join(".")
  const subs: string[] = []
  for (const i of SubtitleTypes) {
    const subPath = `${prefix}.${i}`
    if (existsSync(subPath)) {
      subs.push(subPath)
    }
  }

  return subs
}

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
        onSelect: () => {
          if (sid === id) {
            dispatch.context.setSid(-1)
            setPropertyNative("sid", "no")
          } else {
            dispatch.context.setSid(id)
            setPropertyNative("sid", "yes")
            setPropertyNative("sid", id)
          }
        },
        style: {
          // postfix: ('  ' + (external ? i18n.externalTrack : i18n.builtinTrack)),
          justifyContent: "space-between",
        },
      }
    },
  )
  const fontSize = useSelector(smallFontSizeSelector)
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
      justifyContent="start"
      alignItems="center"
      enableMouseStyle={mouseHoverStyle}
      colorHover={dropdown.colorHover}
      backgroundColorHover={dropdown.backgroundColorHover}
      padding={dropdown.padding}
      backgroundColor={dropdown.backgroundColor}
      font={dropdown.font}
      fontSize={fontSize}
      color={dropdown.color}
      onMouseDown={(e) => {
        // e.stopPropagation()
        // todo()
      }}
    />
  )
}
