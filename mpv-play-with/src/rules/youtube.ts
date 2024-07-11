import { isYoutube } from "@mpv-easy/tool"
import { Icon } from "../icons"
import { PlayItem } from "../share"
import { Rule } from "./rule"

export const Youtube: Rule = {
  match: (url: string): boolean => isYoutube(url),
  getLogo: (_: string): string => Icon.Youtube,
  getVideos: (url: string): PlayItem[] => {
    const args: string[] = []
    const play = {
      url,
      args,
    }
    return [play]
  },
}
