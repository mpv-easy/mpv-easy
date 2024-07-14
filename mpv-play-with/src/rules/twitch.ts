import { twitch } from "@mpv-easy/tool"
import { PlayItem, PlayList, Rule } from "../type"

export const Twitch: Rule = {
  match: (url: string): boolean => twitch.isTwitch(url),
  getVideos: async (url: string): Promise<PlayList | undefined> => {
    if (twitch.TvReg.test(url) || twitch.VideoReg.test(url)) {
      const title = document.querySelector(
        ".channel-info-content .tw-title",
      )?.textContent
      if (!title?.length) {
        return
      }
      const url = location.href
      return {
        items: [{ url, title }],
      }
    }

    return
  },
}
