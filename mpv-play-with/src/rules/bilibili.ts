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

    if (bilibili.MainReg.test(url)) {
      const list: PlayItem[] = []
      for (const i of Array.from(
        document.querySelectorAll(".feed-card .bili-video-card__info--tit"),
      )) {
        const a = i.querySelector("a")
        const href = a?.getAttribute("href")
        const title = a?.textContent

        if (!href?.length || !title?.length) {
          continue
        }

        list.push({
          url: href,
          title,
          args: [],
        })
      }
    }

    return []
  },
}
