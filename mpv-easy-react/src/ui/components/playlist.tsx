import React from "react"
import { Button } from "@mpv-easy/react"
import * as ICON from "../../icon"
import {
  i18nSelector,
  iconButtonStyle,
  playlistHideSelector,
} from "../../store"
import { dispatch, useSelector } from "../../models"

export const Playlist = () => {
  const i18n = useSelector(i18nSelector)
  const playlistHide = useSelector(playlistHideSelector)
  const style = useSelector(iconButtonStyle)
  return (
    <Button
      {...style}
      text={ICON.PlaylistPlay}
      id="mpv-easy-button-playlist"
      title={i18n.playlist}
      onMouseDown={(e) => {
        dispatch.setHistoryHide(true)
        dispatch.setPlaylistHide(!playlistHide)
        e.stopPropagation()
      }}
    />
  )
}
