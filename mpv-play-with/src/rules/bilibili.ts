import { bilibili } from "@mpv-easy/tool"
import { PlayWith, PlayItem, Rule } from "../type"

export const Bilibili: Rule = {
  match: (url: string): boolean => bilibili.isBilibili(url),
  getVideos: async (url: string): Promise<PlayWith | undefined> => {
    if (bilibili.SpaceReg.test(url)) {
      const list: PlayItem[] = []
      for (const i of Array.from(document.querySelectorAll("a.title"))) {
        const url = i.getAttribute("href")
        const title = i.getAttribute("title")
        if (!url?.length || !title?.length || url === "javascript:;") {
          continue
        }

        list.push({
          url: location.protocol + url,
          title,
        })
      }
      return {
        playlist: { list },
      }
    }

    if (bilibili.LiveReg.test(url)) {
      return { playlist: { list: [{ url, title: document.title }] } }
    }

    if (bilibili.BangumiReg.test(url)) {
      const list: PlayItem[] = []

      const name =
        document.querySelector("a[class^=mediainfo_mediaTitle_]")
          ?.textContent || ""
      let start = 0
      for (const i of Array.from(
        document.querySelectorAll(
          "div[class^=numberListItem_number_list_item__]",
        ),
      )) {
        const href = i.querySelector("a")?.getAttribute("href")
        const title = i?.textContent

        if (!href?.length || !title?.length) {
          continue
        }
        if (i.getAttribute("class")?.includes("select")) {
          start = list.length
        }
        list.push({
          url: location.origin + href,
          title: `${name} ${title}`.trim(),
        })
      }

      return { playlist: { list }, start }
    }
    if (bilibili.PopularReg.test(url)) {
      const list: PlayItem[] = []
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
        list.push({
          url: location.protocol + href,
          title,
        })
      }

      if (list.length) {
        return { playlist: { list } }
      }

      const ranks = document.querySelectorAll(".rank-list .rank-item .info > a")
      for (const i of Array.from(ranks)) {
        const href = i.getAttribute("href")
        const title = i.getAttribute("title")

        if (!href?.length || !title?.length) {
          continue
        }
        list.push({
          url: location.protocol + href,
          title,
        })
      }

      if (list.length) {
        return { playlist: { list } }
      }

      return
    }

    if (document.querySelector(".video-sections-content-list")) {
      const episodes = bilibili.getEpisodes()
      if (!episodes.length) {
        return { playlist: { list: [] } }
      }
      const list = episodes.map((i) => {
        return {
          url: `${location.origin}/video/${i.bvid}`,
          title: i.title,
          args: [],
        }
      })

      const bvid = bilibili.getBvid()
      const start = episodes.findIndex((i) => i.bvid === bvid)
      return {
        start: start === -1 ? 0 : start,
        playlist: { list },
      }
    }

    if (document.querySelector("#multi_page")) {
      const bv = bilibili.getBvid()
      const videoData = bilibili.getVideoData()
      const pages = videoData.pages
      if (!bv?.length || !pages.length) return

      const list: PlayItem[] = []
      let start = 0
      const p = +(new URLSearchParams(location.search).get("p") || "1")
      for (const i of pages) {
        let url = i.weblink
        const title = i.part
        if (!url.length) {
          url = `${location.origin}/video/${bv}/?p=${i.page}`
        }

        if (i.page === p) {
          start = list.length
        }

        list.push({ url, title })
      }
      return { playlist: { list }, start }
    }

    if (bilibili.VideoReg.test(url)) {
      const title = document
        .querySelector(".video-title")
        ?.getAttribute("data-title")
      if (!title?.length) {
        return
      }
      return {
        playlist: {
          list: [
            {
              url,
              title,
            },
          ],
        },
      }
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
        })
      }
      return { playlist: { list } }
    }

    return
  },
}
