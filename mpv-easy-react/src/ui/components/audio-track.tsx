import { type DropdownItem } from "@mpv-easy/react"
import React from "react"
import { Dropdown } from "@mpv-easy/react"
import * as ICON from "../../icon"
import {
  i18nSelector,
  aidSelector,
  commonDropdownStyleSelector,
  commonDropdownItemStyleSelector,
} from "../../store"
import {
  type TrackItem,
  getPropertyNative,
  setPropertyNative,
} from "@mpv-easy/tool"
import { dispatch, useSelector } from "../../models"

function getAudioTracks() {
  const trackList = getPropertyNative("track-list") || []
  return trackList.filter((i) => i.type === "audio")
}
export const AudioTrack = () => {
  const itemStyle = useSelector(commonDropdownItemStyleSelector)
  const i18n = useSelector(i18nSelector)
  const tracks = getAudioTracks()
  const aid = useSelector(aidSelector)
  const style = useSelector(commonDropdownStyleSelector)
  const items = tracks.map(
    ({ title, lang, external, selected, id }, k): DropdownItem => {
      const key = [title, lang, external, k].join("-")
      const prefix =
        selected || aid === id ? ICON.Ok : ICON.CheckboxBlankCircleOutline
      const label = `${prefix} ${title ?? lang ?? "default"}`
      return {
        label,
        key,
        onSelect: (_, e) => {
          setPropertyNative("aid", id)
          dispatch.setAid(id)
          e.stopPropagation()
        },
        style: itemStyle,
      }
    },
  )
  return (
    <Dropdown
      {...style}
      id="mpv-easy-button-audio-track"
      items={items}
      text={ICON.Waveform}
      title={i18n.audioTrack}
      direction="top"
    />
  )
}
