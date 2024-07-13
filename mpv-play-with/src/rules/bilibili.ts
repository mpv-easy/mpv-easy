import { bilibili } from "@mpv-easy/tool"
import { PlayItem, Rule } from "../type"

export const Bilibili: Rule = {
  match: (url: string): boolean => bilibili.isBilibili(url),
  getVideos: (url: string): PlayItem[] => {
    if (bilibili.VideoReg.test(url)) {
      const title = document
        .querySelector(".video-title")
        ?.getAttribute("data-title")
      if (!title?.length) {
        return []
      }
      return [
        {
          url,
          title,
          args: [],
        },
      ]
    }

    return []
  },
}
