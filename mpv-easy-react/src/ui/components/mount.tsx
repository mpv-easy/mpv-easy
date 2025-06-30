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
import {
  existsSync,
  isDir,
  isPlayable,
  normalize,
  readFile,
  showNotification,
  webdavList,
} from "@mpv-easy/tool"
import { dispatch, store, useSelector } from "../../models"
import { getPlayableList, pluginName as AutoloadName } from "@mpv-easy/autoload"
import { Playlist } from "serde-m3u"

export const Mount = () => {
  const itemStyle = useSelector(commonDropdownItemStyleSelector)
  const i18n = useSelector(i18nSelector)
  const mount = useSelector(mountSelector)
  const mountIndex = useSelector(mountIndexSelector)
  const style = useSelector(commonDropdownStyleSelector)
  const playlistHide = useSelector(playlistHideSelector)

  const items = mount.map(
    ({ name, url, username, password }, k): DropdownItem => {
      const key = [name, url, username, password].join("-")
      const prefix =
        mountIndex === k ? ICON.Ok : ICON.CheckboxBlankCircleOutline
      const label = `${prefix} ${name}`
      const auth = username && password ? `${username}:${password}` : undefined
      return {
        label,
        key,
        onSelect: async (_, e) => {
          const exists = existsSync(url)
          if (exists && isDir(url)) {
            // local dir
            const videoList = getPlayableList(
              store.getState()[AutoloadName],
              undefined,
              url,
              undefined,
            )
            dispatch.setPlaylist(videoList, 0)
          } else if (exists && url.endsWith(".m3u")) {
            // m3u
            const s = readFile(url)
            const m3u = Playlist.fromString(s)
            const videoList = m3u.list.map((i) => i.url)
            dispatch.setPlaylist(videoList, 0)
          } else {
            // try webdav
            const origin = new URL(url).origin
            try {
              const v = webdavList(url, auth)
                .map((i) =>
                  normalize(
                    origin +
                      i
                        .split("/")
                        .map((k) => encodeURIComponent(k))
                        .join("/"),
                  ),
                )
                .filter((p) => isPlayable(p))
              const authList = v.map((i) => {
                const auth = `${username}:${password}`
                return i.replace("://", `://${auth}@`)
              })
              dispatch.setPlaylist(authList, 0)
            } catch {
              showNotification(`mount error: ${name} ${url}`)
            }
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
      title={i18n.mount}
      direction="top"
    />
  )
}
