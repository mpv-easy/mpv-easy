import { getProperty, getPropertyNative } from "./mpv"
import { PlaylistItem } from "./type"

export function getPlaylist(): PlaylistItem[] {
  return getPropertyNative<PlaylistItem[]>("playlist") || []
}

export function getPlaylistPath(): string | undefined {
  return getProperty("playlist-path")
}
