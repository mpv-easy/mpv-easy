import { twitch } from "@mpv-easy/tool"
import { PlayWith, Rule } from "../type"

export const Twitch: Rule = {
  match: (url: string): boolean => twitch.isTwitch(url),
  getVideos: async (url: string): Promise<PlayWith | undefined> => {
    if (twitch.TvReg.test(url) || twitch.VideoReg.test(url)) {
      const title = document.querySelector(
        ".channel-info-content .tw-title",
      )?.textContent
      if (!title?.length) {
        return
      }
      const url = location.href
      return {
        playlist: { list: [{ video: { url, title } }] },
      }
    }

    return
  },
}
