import { Icon } from "../icons"
import { Rule } from "./rule"

export const Bilibili: Rule = {
  match: (url: string): boolean => url.includes("bilibili"),
  getLogo: (url: string): string => Icon.Bilibili,
  getVideos: (url: string): string[] => [url],
}
