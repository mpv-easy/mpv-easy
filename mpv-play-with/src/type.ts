export type PlayItem = {
  url: string
  title: string
  time?: number
  vlc_opt?: Record<string, string>
}

export type Playlist = {
  list: PlayItem[]
}

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
