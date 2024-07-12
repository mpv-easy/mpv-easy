import { isYoutube } from "@mpv-easy/tool"
import { PlayItem, Rule } from "../type"

const MainPageReg = /(.*?).youtube.com/

export const Youtube: Rule = {
  match: (url: string): boolean =>
    isYoutube(url) || [MainPageReg].some((i) => i.test(url)),
  getVideos: (url: string): PlayItem[] => {
    if (MainPageReg.test(url)) {
      return Array.from(document.querySelectorAll("#video-title-link")).map(
        (i) => {
          const title = i.getAttribute("title") || ""
          const url = location.origin + i.getAttribute("href") || ""
          return {
            url,
            title,
            args: [],
          }
        },
      )
    }

    const args: string[] = []
    const play = {
      url,
      args,
      title: "",
    }
    return [play]
  },
}
