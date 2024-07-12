import { PlayItem, Rule } from "../type"

export const Bilibili: Rule = {
  match: (url: string): boolean => url.includes("bilibili"),
  getVideos: (url: string): PlayItem[] => [],
}
