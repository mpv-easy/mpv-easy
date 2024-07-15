import { youtube } from "@mpv-easy/tool"
import { PlayItem, PlayList, Rule } from "../type"

export const Youtube: Rule = {
  match: (url: string): boolean =>
    youtube.isYoutube(url) ||
    [youtube.MainPageReg, youtube.MyVideosReg, youtube.VideoReg].some((i) =>
      i.test(url),
    ),
  getVideos: async (url: string): Promise<PlayList | undefined> => {
    if (youtube.ListReg.test(url)) {
      const items: PlayItem[] = []
      const videoTitleLinkList = Array.from(
        document.querySelectorAll("#wc-endpoint"),
      )
      for (const i of [...videoTitleLinkList]) {
        const href = i.getAttribute("href") || ""
        const url = location.origin + href
        const titleDom = i.querySelector("#video-title")
        const title = titleDom?.textContent?.trim() || ""
        if (href.length) {
          items.push({
            url,
            title,
          })
        }
      }
      return { items }
    }

    if (youtube.VideoReg.test(url)) {
      const title = document.querySelector(
        "yt-formatted-string.style-scope.ytd-watch-metadata",
      )?.textContent
      if (title?.length) {
        return {
          items: [
            {
              url,
              title,
            },
          ],
        }
      }
    }

    if (youtube.MainPageReg.test(url) || youtube.MyVideosReg.test(url)) {
      const items: PlayItem[] = []

      // @ts-ignore
      const browser = Array.from(document.querySelectorAll("ytd-browse")).find(
        (i) => !i.hidden,
      )

      if (!browser) {
        return
      }

      const videoTitleLinkList = Array.from(
        browser.querySelectorAll("#video-title-link"),
      )
      const videoTitleList = Array.from(
        browser.querySelectorAll("#video-title"),
      )
      for (const i of [...videoTitleLinkList, ...videoTitleList]) {
        const title = i.getAttribute("title") || ""
        const href = i.getAttribute("href") || ""
        const url = location.origin + href

        if (title?.length && href.length) {
          items.push({
            url,
            title,
          })
        }
      }
      return { items }
    }

    const args: string[] = []
    const play = {
      url,
      args,
      title: "",
    }
    return { items: [play] }
  },
}
