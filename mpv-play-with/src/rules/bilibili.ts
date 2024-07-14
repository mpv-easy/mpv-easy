import { bilibili } from "@mpv-easy/tool"
import { PlayList, PlayItem, Rule } from "../type"
import { getBvid } from "../../../mpv-tool/src/bilibili"

export const Bilibili: Rule = {
  match: (url: string): boolean => bilibili.isBilibili(url),
  getVideos: async (url: string): Promise<PlayList | undefined> => {
    if (bilibili.PopularReg.test(url)) {
      const items: PlayItem[] = []
      const cardList = [
        ...Array.from(document.querySelectorAll(".card-list .video-card")),
        ...Array.from(document.querySelectorAll(".video-list .video-card")),
      ]
      for (const i of cardList) {
        const href = i.querySelector("a")?.getAttribute("href")
        const title = i.querySelector(".video-name")?.getAttribute("title")

        if (!href?.length || !title?.length) {
          continue
        }
        items.push({
          url: location.protocol + href,
          title,
        })
      }

      if (items.length) {
        return { items }
      }

      const ranks = document.querySelectorAll(".rank-list .rank-item .info > a")
      for (const i of Array.from(ranks)) {
        const href = i.getAttribute("href")
        const title = i.getAttribute("title")

        if (!href?.length || !title?.length) {
          continue
        }
        items.push({
          url: location.protocol + href,
          title,
        })
      }

      if (items.length) {
        return { items }
      }

      return
    }

    if (document.querySelector(".video-sections-content-list")) {
      const episodes = bilibili.getEpisodes()
      if (!episodes.length) {
        return { items: [] }
      }
      const items = episodes.map((i) => {
        return {
          url: `${location.origin}/video/${i.bvid}`,
          title: i.title,
          args: [],
        }
      })

      const bvid = getBvid()
      const start = episodes.findIndex((i) => i.bvid === bvid)
      return {
        start: start === -1 ? 0 : start,
        items,
      }
    }

    if (bilibili.VideoReg.test(url)) {
      const title = document
        .querySelector(".video-title")
        ?.getAttribute("data-title")
      if (!title?.length) {
        return
      }
      return {
        items: [
          {
            url,
            title,
          },
        ],
      }
    }

    if (bilibili.MainReg.test(url)) {
      const items: PlayItem[] = []
      for (const i of Array.from(
        document.querySelectorAll(".feed-card .bili-video-card__info--tit"),
      )) {
        const a = i.querySelector("a")
        const href = a?.getAttribute("href")
        const title = a?.textContent

        if (!href?.length || !title?.length) {
          continue
        }

        items.push({
          url: href,
          title,
        })
      }
      return { items }
    }

    return
  },
}
