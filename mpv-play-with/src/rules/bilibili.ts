import { bilibili, PlayItem } from "@mpv-easy/tool"
import { PlayWith, Rule } from "../type"

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
          video: {
            url: location.protocol + url,
            title,
          },
        })
      }
      return {
        playlist: { list },
      }
    }

    if (bilibili.LiveReg.test(url)) {
      return { playlist: { list: [{ video: { url, title: document.title } }] } }
    }

    if (bilibili.BangumiReg.test(url)) {
      const name =
        document.querySelector("a[class^=mediainfo_mediaTitle_]")
          ?.textContent || ""
      let start = 0
      const seen = new Set<string>()
      const items: { href: string; title: string; active: boolean }[] = []
      for (const i of Array.from(
        document.querySelectorAll(
          [
            "div[class^=numberListItem_number_list_item__]",
            'a[class*="EpisodeVirtualList_listItem"]',
            'a[class*="EpisodeVirtualList_numberItem"]',
          ].join(","),
        ),
      )) {
        const a = i.tagName === "A" ? i : i.querySelector("a")
        const href = a?.getAttribute("href")
        const title = a?.getAttribute("title") || a?.textContent

        if (!href?.length || !title?.length || href === "javascript:;") {
          continue
        }
        if (seen.has(href)) {
          continue
        }
        seen.add(href)
        const cls = i.getAttribute("class") || ""
        const active = cls.includes("select") || cls.includes("active")
        if (active) {
          start = items.length
        }
        items.push({ href, title, active })
      }

      const list: PlayItem[] = []
      for (const { href, title } of items) {
        list.push({
          video: {
            url: location.origin + href,
            title: items.length > 1 ? `${name}-${title}` : name || title,
          },
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
          video: {
            url: location.protocol + href,
            title,
          },
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
          video: {
            url: location.protocol + href,
            title,
          },
        })
      }

      if (list.length) {
        return { playlist: { list } }
      }

      return
    }

    if (
      document.querySelector(".video-sections-content-list") ||
      document.querySelector(".video-pod__list.section")
    ) {
      const sectionItems = Array.from(
        document.querySelectorAll(".video-pod__list.section .video-pod__item"),
      )
      if (sectionItems.length) {
        const list: PlayItem[] = []
        let start = 0
        for (const i of sectionItems) {
          const bv = i.getAttribute("data-key")
          const title = i.querySelector(".title")?.getAttribute("title")

          if (!bv?.length || !title?.length) {
            continue
          }
          if (i.querySelector(".active")) {
            start = list.length
          }
          list.push({
            video: {
              url: `${location.origin}/video/${bv}/`,
              title,
            },
          })
        }
        if (list.length) {
          return {
            start,
            playlist: { list },
          }
        }
      }

      const episodes = bilibili.getEpisodes()
      if (!episodes.length) {
        return { playlist: { list: [] } }
      }
      const list = episodes.map((i) => {
        return {
          video: {
            url: `${location.origin}/video/${i.bvid}`,
            title: i.title,
            args: [],
          },
        }
      })

      const bvid = bilibili.getBvid()
      const start = episodes.findIndex((i) => i.bvid === bvid)
      return {
        start: start === -1 ? 0 : start,
        playlist: { list },
      }
    }

    if (
      document.querySelector("#multi_page") ||
      document.querySelector(".video-pod__list.multip")
    ) {
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

        list.push({ video: { url, title } })
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
              video: {
                url,
                title,
              },
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
          video: {
            url: href,
            title,
          },
        })
      }
      return { playlist: { list } }
    }

    return
  },
}
