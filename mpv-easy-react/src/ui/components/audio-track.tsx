import { Dropdown, type DropdownItem } from "@mpv-easy/react"
import React from "react"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  i18nSelector,
  mouseHoverStyleSelector,
  dropdownStyleSelector,
  aidSelector,
} from "../../store"
import {
  type TrackItem,
  getPropertyNative,
  setPropertyNative,
} from "@mpv-easy/tool"
import { dispatch, useSelector } from "../../models"

function getAudioTracks() {
  const trackList = getPropertyNative<TrackItem[]>("track-list") || []
  return trackList.filter((i) => i.type === "audio")
}
export const AudioTrack = () => {
  const dropdown = useSelector(dropdownStyleSelector)
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  const tracks = getAudioTracks()
  const aid = useSelector(aidSelector)

  const items = tracks.map(
    ({ title, lang, external, selected, id }, k): DropdownItem => {
      const key = [title, lang, external, k].join("-")
      const prefix =
        selected || aid === id ? ICON.Ok : ICON.CheckboxBlankCircleOutline
      const label = `${prefix} ${title ?? lang ?? "default"}`
      return {
        label,
        key: key,
        onSelect: (_, e) => {
          setPropertyNative("aid", id)
          dispatch.setAid(id)
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
      colorHover={dropdown.button.colorHover}
      backgroundColorHover={dropdown.button.backgroundColorHover}
      padding={dropdown.button.padding}
      backgroundColor={dropdown.button.backgroundColor}
      font={dropdown.button.font}
      fontSize={button.fontSize}
      color={dropdown.button.color}
      dropdownListStyle={dropdown.list}
      pageDown={{ style: dropdown.item, text: ICON.TriangleDown }}
      pageUp={{ style: dropdown.item, text: ICON.TriangleUp }}
    />
  )
}
