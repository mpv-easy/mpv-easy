import { Icon } from "../icons"
import { Rule } from "./rule"

export const Youtube: Rule = {
  match: (url: string): boolean => url.includes("youtube"),
  getLogo: (url: string): string => Icon.Youtube,
  getVideos: (url: string): string[] => [url],
}
