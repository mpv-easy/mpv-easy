import { Playlist } from "@mpv-easy/tool"

export type PlayWith = {
  playlist: Playlist
  start?: number
  args?: string[]
  log?: string
}

export type Rule = {
  match(url: string): boolean
  getVideos(url: string): Promise<PlayWith | undefined>
}
