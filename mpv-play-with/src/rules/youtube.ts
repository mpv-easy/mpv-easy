import { isYoutube } from "@mpv-easy/tool"
import { PlayItem, Rule } from "../type"

export const Youtube: Rule = {
  match: (url: string): boolean => isYoutube(url),
  getVideos: (url: string): PlayItem[] => {
    const args: string[] = []
    const play = {
      url,
      args,
      title: "",
    }
    return [play]
  },
}
