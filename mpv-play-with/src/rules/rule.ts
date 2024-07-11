import { PlayItem } from "../share"

export type Rule = {
  match(url: string): boolean
  getLogo(url: string): string
  getVideos(url: string): PlayItem[]
}
