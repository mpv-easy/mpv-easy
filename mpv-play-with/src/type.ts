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
