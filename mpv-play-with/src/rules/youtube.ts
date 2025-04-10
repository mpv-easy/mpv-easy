import { youtube } from "@mpv-easy/tool"
import { PlayItem, PlayWith, Rule } from "../type"

export const Youtube: Rule = {
  match: (url: string): boolean =>
    youtube.isYoutube(url) ||
    [youtube.MainPageReg, youtube.MyVideosReg, youtube.VideoReg].some((i) =>
      i.test(url),
    ),
  getVideos: async (url: string): Promise<PlayWith | undefined> => {
    if (youtube.ResultReg.test(url)) {
      const list: PlayItem[] = []
      for (const i of Array.from(document.querySelectorAll("a#video-title"))) {
        const title = i.getAttribute("title") || ""
        const href = i.getAttribute("href") || ""
        const url = location.origin + href

        if (title?.length && href.length) {
          list.push({
            video: {
              url,
              title,
            },
          })
        }
      }
      return { playlist: { list } }
    }

    if (youtube.ListReg.test(url)) {
      const list: PlayItem[] = []
      const videoTitleLinkList = Array.from(
        document.querySelectorAll("#wc-endpoint"),
      )
      for (const i of [...videoTitleLinkList]) {
        const href = i.getAttribute("href") || ""
        const url = location.origin + href
        const titleDom = i.querySelector("#video-title")
        const title = titleDom?.textContent?.trim() || ""
        if (href.length) {
          list.push({
            video: {
              url,
              title,
            },
          })
        }
      }
      return { playlist: { list } }
    }

    if (youtube.VideoReg.test(url)) {
      const title = document.querySelector(
        "yt-formatted-string.style-scope.ytd-watch-metadata",
      )?.textContent
      if (title?.length) {
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
    }

    if (
      youtube.MainPageReg.test(url) ||
      youtube.MyVideosReg.test(url) ||
      youtube.ResultReg.test(url)
    ) {
      const list: PlayItem[] = []

      const browser = Array.from(document.querySelectorAll("ytd-browse")).find(
        // @ts-ignore
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
          list.push({
            video: {
              url,
              title,
            },
          })
        }
      }
      return { playlist: { list } }
    }

    return {
      playlist: {
        list: [
          {
            video: {
              url,
              title: document.title,
            },
          },
        ],
      },
    }
  },
}
