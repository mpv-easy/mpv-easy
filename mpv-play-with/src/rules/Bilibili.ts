import { Icon } from "../icons"
import { PlayItem } from "../share"
import { Rule } from "./rule"

export const Bilibili: Rule = {
  match: (url: string): boolean => url.includes("bilibili"),
  getLogo: (url: string): string => Icon.Bilibili,
  getVideos: (url: string): PlayItem[] => [],
}
