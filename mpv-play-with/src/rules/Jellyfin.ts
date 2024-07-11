import { Icon } from "../icons"
import { getTitle, PlayItem } from "../share"
import { Rule } from "./rule"
import { jellyfin } from "@mpv-easy/tool"

export const Jellyfin: Rule = {
  match: (url: string): boolean => {
    return jellyfin.isJellyfin(url)
  },
  getLogo: (url: string): string => Icon.Jellyfin,
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
      const title = titleDom?.textContent
      const args: string[] = []
      if (title?.length) {
        args.push(`--force-media-title=${getTitle(title.trim())}`)
      }

      const streamUrl = `${location.origin}/Videos/${id}/stream?Static=true`
      const play: PlayItem = {
        url: streamUrl,
        args,
      }

      return [play]
    }

    return []
  },
}
