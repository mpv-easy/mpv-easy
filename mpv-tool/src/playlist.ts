import { getProperty, getPropertyNative } from "./mpv"

export type PlaylistItem = {
  filename: string
  current: boolean
  playing: boolean
  title: string
  id: number
  "playlist-path": string
}

export function getPlaylist(): PlaylistItem[] {
  return getPropertyNative<PlaylistItem[]>("playlist") || []
}

export function getPlaylistPath(): string | undefined {
  return getProperty("playlist-path")
}
