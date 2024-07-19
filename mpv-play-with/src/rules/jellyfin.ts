import { getTitle } from "../share"
import { PlayWith, Rule } from "../type"
import { jellyfin } from "@mpv-easy/tool"

export const Jellyfin: Rule = {
  match: (url: string): boolean => {
    return [
      jellyfin.MoviesReg,
      jellyfin.detailsReg,
      jellyfin.StreamReg,
      jellyfin.ListReg,
      jellyfin.videoReg,
    ].some((i) => i.test(url))
  },
  getVideos: async (url: string): Promise<PlayWith | undefined> => {
    if (jellyfin.detailsReg.test(url)) {
      const dom = document.querySelector(".detailImageContainer > .card")
      if (!dom) {
        return
      }
      const id = dom.getAttribute("data-id")
      const titleDom = document.querySelector(".nameContainer > .itemName")
      const title = titleDom?.textContent?.trim()

      const streamUrl = `${location.origin}/Videos/${id}/stream?Static=true`
      return {
        playlist: {
          list: [
            {
              url: streamUrl,
              title: getTitle(title || "") || "",
            },
          ],
        },
      }
    }

    if (jellyfin.videoReg.test(url)) {
      const video = document.querySelector("video")
      const src = video?.getAttribute("src")
      if (!src?.length) {
        return
      }
      const reg = /^(https?):\/\/(.*?)\/Videos\/(.*?)\/stream/
      const ret = src.match(reg)
      if (!ret) {
        return
      }

      const id = ret[3]
      if (!id.length) {
        return
      }
      const streamUrl = `${location.origin}/Videos/${id}/stream?Static=true`
      const title = document.title
      return {
        playlist: {
          list: [
            {
              url: streamUrl,
              title: getTitle(title || "") || "",
            },
          ],
        },
      }
    }

    if (jellyfin.MoviesReg.test(url)) {
      const pageEl = Array.from(document.querySelectorAll(".page")).find(
        (i) => !i.classList.contains("hide"),
      )
      if (!pageEl) {
        return
      }
      const dom = pageEl.querySelectorAll(
        "#moviesTab > .itemsContainer > .card",
      )
      const list = Array.from(dom).map((i) => {
        const id = i.getAttribute("data-id")
        const streamUrl = `${location.origin}/Videos/${id}/stream?Static=true`
        const btn = i.querySelector(".cardText > button")
        const title = btn?.getAttribute("title")
        return {
          url: streamUrl,
          title: getTitle(title || "") || "",
        }
      })

      return { playlist: { list } }
    }

    return
  },
}
