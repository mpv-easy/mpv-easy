import { PlayItem } from "@mpv-easy/tool"
import { PlayWith, Rule } from "../type"

export const AList: Rule = {
  match: (_: string): boolean => {
    return (
      document.querySelector('meta[name="generator"][content="AList V3"]') !==
      null
    )
  },
  getVideos: async (_: string): Promise<PlayWith | undefined> => {
    const list: PlayItem[] = []
    // const domList = document.querySelectorAll(".list-item")
    // if (domList.length) {
    //   for (const i of Array.from(domList)) {
    //     const url = location.href + i.getAttribute("href")
    //     const title = i.querySelector("name")?.textContent!
    //     list.push({
    //       video: {
    //         url,
    //         title,
    //       },
    //     })
    //   }
    //   return { playlist: { list } }
    // }
    const video = document.querySelector("video")
    const title = document
      .querySelector(".hope-switch")
      ?.parentElement?.querySelector(
        '.hope-stack > button[role="combobox"]',
      )?.textContent
    if (video && title) {
      list.push({
        video: {
          url: video.src,
          title,
        },
      })
    }

    return { playlist: { list } }
  },
}
