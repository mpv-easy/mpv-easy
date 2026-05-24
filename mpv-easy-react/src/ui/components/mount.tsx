import { type DropdownItem } from "@mpv-easy/react"
import React from "react"
import { Dropdown } from "@mpv-easy/react"
import * as ICON from "../../icon"
import {
  i18nSelector,
  commonDropdownStyleSelector,
  commonDropdownItemStyleSelector,
  mountSelector,
  mountIndexSelector,
  playlistHideSelector,
} from "../../store"
import { showNotification } from "@mpv-easy/tool"
import { dispatch, store, useSelector } from "../../models"
import { pluginName as AutoloadName } from "@mpv-easy/autoload"
import { resolveMountPlaylist } from "@mpv-easy/mount"
import { useTitle } from "../../hooks"

export const Mount = () => {
  const itemStyle = useSelector(commonDropdownItemStyleSelector)
  const i18n = useSelector(i18nSelector)
  const mount = useSelector(mountSelector)?.mount || []
  const mountIndex = useSelector(mountIndexSelector)
  const style = useSelector(commonDropdownStyleSelector)
  const playlistHide = useSelector(playlistHideSelector)

  const items = mount.map(
    ({ name, url, username, password }, k): DropdownItem => {
      const key = [name, url, username, password].join("-")
      const prefix =
        mountIndex === k ? ICON.Ok : ICON.CheckboxBlankCircleOutline
      const label = `${prefix} ${name}`
      return {
        label,
        key,
        onSelect: async (_, e) => {
          try {
            const videoList = await resolveMountPlaylist(
              { name, url, username, password },
              store.getState()[AutoloadName],
            )
            dispatch.setPlaylist(videoList, 0)
          } catch {
            showNotification(`mount error: ${name} ${url}`)
          }
          dispatch.setHistoryHide(true)
          dispatch.setPlaylistHide(!playlistHide)
          dispatch.setMountIndex(k)
          e.stopPropagation()
        },
        style: itemStyle,
      }
    },
  )
  return (
    <Dropdown
      {...style}
      id="mpv-easy-button-mount"
      items={items}
      text={ICON.Web}
      title={useTitle(i18n.mount)}
      direction="top"
    />
  )
}
