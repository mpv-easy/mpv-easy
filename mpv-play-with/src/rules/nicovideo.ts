import { nicovideo } from "@mpv-easy/tool"
import { PlayWith, Rule } from "../type"

export const Nicovideo: Rule = {
  match: (url: string): boolean => nicovideo.isNicovideo(url),
  getVideos: async (url: string): Promise<PlayWith | undefined> => {
    if (nicovideo.VideoRegex.test(url)) {
      const title =
        document.querySelector("h1")?.textContent?.trim() || document.title
      return { playlist: { list: [{ url, title }] } }
    }

    if (nicovideo.MainRegex.test(url)) {
      const list = Array.from(document.querySelectorAll(".NC-Card-main"))
        .map((i) => {
          const url = i
            .querySelector(".NC-VideoThumbnail")
            ?.getAttribute("data-watchlater-item-id")
          const title = i.querySelector(".NC-CardTitle")?.textContent?.trim()
          if (!url || !title) {
            return
          }
          return { url: `https://www.nicovideo.jp/watch/${url}`, title }
        })
        .filter((i) => !!i)
      return { playlist: { list } }
    }
    return
  },
}
