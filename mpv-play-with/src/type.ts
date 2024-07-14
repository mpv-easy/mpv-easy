export type PlayItem = {
  url: string
  title: string
  args?: string[]
}

export type PlayList = {
  items: PlayItem[]
  start?: number
  args?: string[]
}

export type Rule = {
  match(url: string): boolean
  getVideos(url: string): Promise<PlayList | undefined>
}
