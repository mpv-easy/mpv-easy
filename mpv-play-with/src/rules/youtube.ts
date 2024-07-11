import { isYoutube } from "@mpv-easy/tool"
import { Icon } from "../icons"
import { Rule } from "./rule"
import { PlayItem } from "../type"

export const Youtube: Rule = {
  match: (url: string): boolean => isYoutube(url),
  getLogo: (_: string): string => Icon.Youtube,
  getVideos: (url: string): PlayItem[] => {
    const args: string[] = []
    const play = {
      url,
      args,
      title: ''
    }
    return [play]
  },
}
