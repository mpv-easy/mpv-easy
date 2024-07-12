export type PlayItem = {
  url: string
  title: string
  args: string[]
}

export type Rule = {
  match(url: string): boolean
  getVideos(url: string): PlayItem[]
}
