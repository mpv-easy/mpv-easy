export type Rule = {
  match(url: string): boolean
  getLogo(url: string): string
  getVideos(url: string): string[]
}
