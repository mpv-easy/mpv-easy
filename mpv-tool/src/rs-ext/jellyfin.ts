import { execAsync, execSync } from "../common"
import { JSONParse } from "../json"
import { getRsExtExePath } from "./share"

export const MoviesReg =
  /^(https?):\/\/(.*?)\/web\/index.html#\!\/movies.html\?topParentId=(.*?)$/

export const ListReg =
  /^(https?):\/\/(.*?)\/web\/index.html#!\/list.html\?parentId=(.*?)&serverId=(.*?)$/

export const IdReg =
  /^(https?):\/\/(.*?)\/web\/index.html#!\/details\?id=(.*?)&serverId=(.*?)$/

export const StreamReg = /^(https?):\/\/(.*?)\/Videos\/(.*?)\/stream/

export type Info = {
  topParentId?: string
  id?: string
  serverId?: string
  host: string
  protocol: string
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
      protocol: movieRet[1],
      host: movieRet[2],
      topParentId: movieRet[3],
    }
  }

  const idRet = url.match(IdReg)
  if (idRet) {
    return {
      protocol: idRet[1],
      host: idRet[2],
      id: idRet[3],
      serverId: idRet[4],
    }
  }

  const listRet = url.match(ListReg)
  if (listRet) {
    return {
      protocol: listRet[1],
      host: listRet[2],
      topParentId: listRet[3],
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
  server: string,
  apiKey: string,
  userName: string,
  exe = getRsExtExePath(),
) {
  return execSync([exe, CommandName, "userid", server, apiKey, userName])
}

export function getUserIdAsync(
  server: string,
  apiKey: string,
  userName: string,
  exe = getRsExtExePath(),
) {
  return execAsync([exe, CommandName, "userid", server, apiKey, userName])
}

export function getView(
  server: string,
  apiKey: string,
  userName: string,
  exe = getRsExtExePath(),
): View {
  const txt = execSync([exe, CommandName, "view", server, apiKey, userName])
  return JSON.parse(txt) as View
}

export async function getViewAsync(
  server: string,
  apiKey: string,
  userName: string,
  exe = getRsExtExePath(),
): Promise<View> {
  const txt = await execAsync([
    exe,
    CommandName,
    "view",
    server,
    apiKey,
    userName,
  ])
  return JSONParse<View>(txt)
}

export function getPlaylist(
  server: string,
  apiKey: string,
  userName: string,
  parentId: string,
  exe = getRsExtExePath(),
): PlayList {
  const txt = execSync([
    exe,
    CommandName,
    "playlist",
    server,
    apiKey,
    userName,
    parentId,
  ])
  return JSON.parse(txt) as PlayList
}

export async function getPlaylistAsync(
  server: string,
  apiKey: string,
  userName: string,
  parentId: string,
  exe = getRsExtExePath(),
): Promise<PlayList> {
  const txt = await execAsync([
    exe,
    CommandName,
    "playlist",
    server,
    apiKey,
    userName,
    parentId,
  ])
  return JSONParse<PlayList>(txt)
}

export function getPlaybackinfo(
  server: string,
  apiKey: string,
  userName: string,
  id: string,
  exe = getRsExtExePath(),
): PlaybackInfo {
  const txt = execSync([
    exe,
    CommandName,
    "playbackinfo",
    server,
    apiKey,
    userName,
    id,
  ])
  return JSON.parse(txt) as PlaybackInfo
}

export async function getPlaybackinfoAsync(
  server: string,
  apiKey: string,
  userName: string,
  id: string,
  exe = getRsExtExePath(),
): Promise<PlaybackInfo> {
  const txt = await execAsync([
    exe,
    CommandName,
    "playbackinfo",
    server,
    apiKey,
    userName,
    id,
  ])
  return JSONParse<PlaybackInfo>(txt)
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

  const { host, topParentId, id, protocol } = info
  const server = `${protocol}://${host}`
  if (topParentId) {
    const list = getPlaylist(server, apiKey, userName, topParentId)
    return list.Items.map((i) => {
      const { Id, Name } = i
      const path = `${server}/Videos/${Id}/stream?Static=true`
      nameCache[path] = Name
      return {
        name: Name,
        path,
      }
    })
  }

  if (id) {
    const playback = getPlaybackinfo(server, apiKey, userName, id)
    return playback.MediaSources.map((i) => {
      const path = `${server}/Videos/${i.Id}/stream?Static=true`
      nameCache[path] = i.Path
      return {
        path,
        name: i.Path,
      }
    })
  }
  return []
}

export async function getPlayableListFromUrlAsync(
  url: string,
  apiKey: string,
  userName: string,
): Promise<
  {
    path: string
    name: string
  }[]
> {
  const info = getInfo(url)
  if (!info) return []

  const { host, topParentId, id, protocol } = info
  const server = `${protocol}://${host}`
  if (topParentId) {
    const list = await getPlaylistAsync(server, apiKey, userName, topParentId)
    return list.Items.map((i) => {
      const { Id, Name } = i
      const path = `${server}/Videos/${Id}/stream?Static=true`
      nameCache[path] = Name
      return {
        name: Name,
        path,
      }
    })
  }

  if (id) {
    const playback = await getPlaybackinfoAsync(server, apiKey, userName, id)
    return playback.MediaSources.map((i) => {
      const path = `${server}/Videos/${i.Id}/stream?Static=true`
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
