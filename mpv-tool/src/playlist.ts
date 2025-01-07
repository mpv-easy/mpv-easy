import { getProperty, getPropertyNative } from "./mpv"
import { PlaylistItem } from "./type"

export function getPlaylist(): PlaylistItem[] {
  return getPropertyNative("playlist", [])
}

export function getPlaylistPath(): string | undefined {
  return getProperty("playlist-path")
}
