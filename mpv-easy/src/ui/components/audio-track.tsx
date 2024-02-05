import { Dropdown, DropdownItem, dispatchEvent } from "@mpv-easy/ui"
import React, { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  i18nSelector,
  mouseHoverStyleSelector,
  dropdownStyleSelector,
  aidSelector,
  Dispatch,
} from "../../store"
import {
  getPropertyBool,
  getPropertyNative,
  getPropertyNumber,
  getPropertyString,
  observeProperty,
  setPropertyNative,
  setPropertyNumber,
  todo,
} from "@mpv-easy/tool"

type AudioTrack = {
  title?: string
  lang?: string
  external: boolean
  selected: boolean
  id: number
}
function getAudioTracks() {
  const tracks: AudioTrack[] = []
  const trackCount = getPropertyNumber("track-list/count") || 0
  for (let i = 0; i < trackCount; i++) {
    const type = getPropertyString(`track-list/${i}/type`)
    if (type === "audio") {
      const title = getPropertyString(`track-list/${i}/title`)
      const lang = getPropertyString(`track-list/${i}/lang`)
      const selected = getPropertyBool(`track-list/${i}/selected`)
      const external = getPropertyBool(`track-list/${i}/external`)
      const id = getPropertyNumber(`track-list/${i}/id`) || 0
      tracks.push({
        title,
        lang,
        external,
        selected,
        id,
      })
    }
  }
  return tracks
}
// ./mpv.com D:/迅雷下载/拾荒者统治(2023)/Scavengers.Reign.S01E06.1080p.WEB.h264.mkv   --log - file=./log.txt
export const AudioTrack = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  const tracks = getAudioTracks()
  const aid = useSelector(aidSelector)
  const dispatch = useDispatch<Dispatch>()
  const items = tracks.map(
    ({ title, lang, external, selected, id }, k): DropdownItem => {
      const key = [title, lang, external, k].join("-")
      const prefix =
        selected || aid === id ? ICON.Ok : ICON.CheckboxBlankCircleOutline
      const label = prefix + " " + (title ?? lang ?? "default")
      return {
        label,
        key: key,
        onSelect: () => {
          setPropertyNative("aid", id)
          dispatch.context.setAid(id)
        },
        style: {
          // postfix: ("  " + (external ? i18n.externalTrack : i18n.builtinTrack)),
        },
      }
    },
  )
  const dropdown = useSelector(dropdownStyleSelector)
  return (
    <Dropdown
      id="mpv-easy-button-audio-track"
      items={items}
      text={ICON.Waveform}
      title={i18n.audioTrack}
      width={button.width}
      height={button.height}
      direction="top"
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
      // onMouseDown={(e) => {
      //   // dispatch.context.screenshot()
      //   // e.stopPropagation()
      //   // todo()
      // }}
    />
  )
}
