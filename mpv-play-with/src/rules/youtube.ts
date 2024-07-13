import { isYoutube } from "@mpv-easy/tool"
import { PlayItem, Rule } from "../type"

const MainPageReg = /^(?:https?:\/\/)(.*?)\.youtube\.(.*?)\/?$/
const MyVideosReg = /^(?:https?:\/\/)(.*?).youtube\.(.*?)\/@(.*?)\/videos\/?/
const ListReg =
  /^(?:https?:\/\/)(.*?).youtube\.(.*?)\/watch\?v=(.*?)&list=(.*?)/
const VideoReg = /^(?:https?:\/\/)(.*?).youtube\.(.*?)\/watch\?v=(.*?)$/

export const Youtube: Rule = {
  match: (url: string): boolean =>
    isYoutube(url) ||
    [MainPageReg, MyVideosReg, VideoReg].some((i) => i.test(url)),
  getVideos: (url: string): PlayItem[] => {
    if (ListReg.test(url)) {
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
            url,
            title,
            args: [],
          })
        }
      }
      return list
    }

    if (VideoReg.test(url)) {
      const title = document.querySelector(
        "yt-formatted-string.style-scope.ytd-watch-metadata",
      )?.textContent
      if (title?.length) {
        return [
          {
            url,
            title,
            args: [],
          },
        ]
      }
    }

    if (MainPageReg.test(url) || MyVideosReg.test(url)) {
      const list: PlayItem[] = []
      const videoTitleLinkList = Array.from(
        document.querySelectorAll("#video-title-link"),
      )
      const videoTitleList = Array.from(
        document.querySelectorAll("#video-title"),
      )
      for (const i of [...videoTitleLinkList, ...videoTitleList]) {
        const title = i.getAttribute("title") || ""
        const href = i.getAttribute("href") || ""
        const url = location.origin + href

        if (title?.length && href.length) {
          list.push({
            url,
            title,
            args: [],
          })
        }
      }
      return list
    }

    const args: string[] = []
    const play = {
      url,
      args,
      title: "",
    }
    return [play]
  },
}
