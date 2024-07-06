import { execSync } from "../common"
import { getRsExtExePath } from "./share"

export const MoviesReg =
  /^https?:\/\/(.*?)\/web\/index.html#!\/movies.html\?topParentId=(.*?)/

// http://localhost:8096/web/index.html#!/list.html?parentId=9c7fd714fe6d7ff24e4efb3c224058f1&serverId=2083222010f64f9d83397a375a2ef38f
export const ListReg =
  /^https?:\/\/(.*?)\/web\/index.html#!\/list.html\?parentId=(.*?)&serverId=(.*?)/

export const IdReg =
  /^https?:\/\/(.*?)\/web\/index.html#!\/details\?id=(.*?)&serverId=(.*?)/

export const StreamReg = /^https?:\/\/(.*?)\/Videos\/(.*?)\/stream/

export type Info = {
  topParentId?: string
  id?: string
  serverId?: string
  host: string
}

export type Item = {
  path: string
  name: string
}

export function isJellyfin(url: string): boolean {
  return [MoviesReg, IdReg, StreamReg, ListReg].some((i) => i.test(url))
}

export function getInfo(url: string): Info | undefined {
  const movieRet = url.match(MoviesReg)
  if (movieRet) {
    return {
      host: movieRet[1],
      topParentId: movieRet[2],
    }
  }

  const idRet = url.match(IdReg)
  if (idRet) {
    return {
      host: idRet[1],
      id: idRet[2],
      serverId: idRet[3],
    }
  }

  const listRet = url.match(ListReg)
  if (listRet) {
    return {
      host: listRet[1],
      topParentId: listRet[2],
    }
  }

  return undefined
}

export type User = {
  Name: string
  Id: string
  ServerId: string
}
export type MediaSource = {
  Protocol: string
  Id: string
  Path: string
}

export type PlaybackInfo = {
  MediaSources: MediaSource[]
  PlaySessionId: string
}

export type ViewItem = {
  Name: string
  ServerId: string
  Id: string
  Path: string
  ParentId: string
}

export type View = {
  Items: ViewItem[]
  TotalRecordCount: number
  StartIndex: number
}
export type PlayItem = {
  Name: string
  Id: string
  MediaType: string
}

export type PlayList = {
  Items: PlayItem[]
  TotalRecordCount: number
  StartIndex: number
}

const CommandName = "jellyfin"
export function getUserId(
  host: string,
  apiKey: string,
  userName: string,
  exe = getRsExtExePath(),
) {
  return execSync([exe, CommandName, "userid", host, apiKey, userName])
}

export function getView(
  host: string,
  apiKey: string,
  userName: string,
  exe = getRsExtExePath(),
): View {
  const txt = execSync([exe, CommandName, "view", host, apiKey, userName])
  return JSON.parse(txt) as View
}

export function getPlaylist(
  host: string,
  apiKey: string,
  userName: string,
  parentId: string,
  exe = getRsExtExePath(),
): PlayList {
  const txt = execSync([
    exe,
    CommandName,
    "playlist",
    host,
    apiKey,
    userName,
    parentId,
  ])
  return JSON.parse(txt) as PlayList
}

export function getPlaybackinfo(
  host: string,
  apiKey: string,
  userName: string,
  id: string,
  exe = getRsExtExePath(),
): PlaybackInfo {
  const txt = execSync([
    exe,
    CommandName,
    "playbackinfo",
    host,
    apiKey,
    userName,
    id,
  ])
  return JSON.parse(txt) as PlaybackInfo
}

const nameCache: Record<string, string> = {}

export function getPlayableListFromUrl(
  url: string,
  apiKey: string,
  userName: string,
): {
  path: string
  name: string
}[] {
  const info = getInfo(url)
  if (!info) return []

  const { host, topParentId, id } = info
  if (topParentId) {
    const list = getPlaylist(host, apiKey, userName, topParentId)
    return list.Items.map((i) => {
      const { Id, Name } = i
      const path = `http://${host}/Videos/${Id}/stream?Static=true`
      nameCache[path] = Name
      return {
        name: Name,
        path,
      }
    })
  }

  if (id) {
    const playback = getPlaybackinfo(host, apiKey, userName, id)
    return playback.MediaSources.map((i) => {
      const path = `http://${host}/Videos/${i.Id}/stream?Static=true`
      nameCache[path] = i.Path
      return {
        path,
        name: i.Path,
      }
    })
  }
  return []
}

export function getNameFromUrl(url: string) {
  return nameCache[url]
}
