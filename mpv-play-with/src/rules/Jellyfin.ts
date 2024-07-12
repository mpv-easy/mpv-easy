import { Icon } from "../icons"
import { getTitle } from "../share"
import { PlayItem } from "../type"
import { Rule } from "./rule"
import { jellyfin } from "@mpv-easy/tool"

export const Jellyfin: Rule = {
  match: (url: string): boolean => {
    return jellyfin.isJellyfin(url)
  },
  getLogo: (_: string): string => Icon.Jellyfin,
  getVideos: (url: string): PlayItem[] => {
    if (jellyfin.detailsReg.test(url)) {
      const dom = document.querySelector(
        "#itemDetailPage > div.detailPageWrapperContainer.padded-bottom-page > div.detailPagePrimaryContainer.padded-left.padded-right.detailRibbon > div.infoWrapper > div.detailImageContainer.padded-left > div",
      )
      if (!dom) {
        return []
      }
      const id = dom.getAttribute("data-id")
      const titleDom = document.querySelector(
        "#itemDetailPage > div.detailPageWrapperContainer.padded-bottom-page > div.detailPagePrimaryContainer.padded-left.padded-right.detailRibbon > div.infoWrapper > div.nameContainer > h1",
      )
      const title = titleDom?.textContent?.trim()
      const args: string[] = []

      const streamUrl = `${location.origin}/Videos/${id}/stream?Static=true`
      const play: PlayItem = {
        url: streamUrl,
        args,
        title: getTitle(title || "") || "",
      }

      return [play]
    }

    if (jellyfin.MoviesReg.test(url)) {
      const dom = document.querySelectorAll(
        "#moviesTab > div.itemsContainer.padded-left.padded-right.padded-right-withalphapicker.vertical-wrap > div",
      )
      return Array.from(dom).map((i) => {
        const id = i.getAttribute("data-id")
        const streamUrl = `${location.origin}/Videos/${id}/stream?Static=true`
        const btn = i.querySelector(".cardText > button")
        const title = btn?.getAttribute("title")
        return {
          url: streamUrl,
          args: [],
          title: getTitle(title || "") || "",
        }
      })
    }

    return []
  },
}