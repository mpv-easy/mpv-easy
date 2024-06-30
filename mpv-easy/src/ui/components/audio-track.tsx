import { Dropdown, type DropdownItem, dispatchEvent } from "@mpv-easy/ui"
import React, { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  i18nSelector,
  mouseHoverStyleSelector,
  dropdownStyleSelector,
  aidSelector,
  type Dispatch,
  smallFontSizeSelector,
} from "../../store"
import {
  type TrackItem,
  getPropertyBool,
  getPropertyNative,
  getPropertyNumber,
  getPropertyString,
  observeProperty,
  setPropertyNative,
  setPropertyNumber,
  todo,
} from "@mpv-easy/tool"

function getAudioTracks() {
  const trackList = getPropertyNative<TrackItem[]>("track-list") || []
  return trackList.filter((i) => i.type === "audio")
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
      const label = `${prefix} ${title ?? lang ?? "default"}`
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
  const fontSize = useSelector(smallFontSizeSelector)
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
    />
  )
}
