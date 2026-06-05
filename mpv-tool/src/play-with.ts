import { getScriptDir, getMpvExeDir } from "./mpv"
import { findByPrefix } from "./fs"

export type Subtitle = {
  url: string
  title?: string
  default?: boolean
  lang?: string
}

export type PlayItem = {
  video: Video
  subtitles?: Subtitle[]
}

export type Video = {
  url: string
  title: string
  time?: number
}

export type Playlist = {
  list: PlayItem[]
}

let _playWithPathCache: string | undefined

/** Detect the mpv-easy-play-with binary via prefix search (cached) */
export function detectPlayWith(): string {
  if (_playWithPathCache) return _playWithPathCache

  _playWithPathCache =
    findByPrefix(getScriptDir(), "mpv-easy-play-with") ??
    findByPrefix(getMpvExeDir(), "mpv-easy-play-with")

  if (!_playWithPathCache) {
    throw new Error(
      `mpv-easy-play-with binary not found in:
  - ${getScriptDir()}
  - ${getMpvExeDir()}`,
    )
  }
  return _playWithPathCache
}
