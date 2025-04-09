import { getTitle } from "../share"
import { PlayWith, Rule } from "../type"
import { jellyfin } from "@mpv-easy/tool"

type Servers = {
  AccessToken: string
}

type MediaStreams = {
  Index: number
  Path: string
  Type: string
  IsExternal: boolean
  IsDefault: boolean
  Codec: string
  Language: string
  Level: number
}
type MediaSources = {
  MediaStreams: MediaStreams[]
}

type VideoInfo = {
  MediaSources: MediaSources[]
}

function getApiKey(): string | undefined {
  try {
    const s = localStorage.getItem("jellyfin_credentials")
    if (!s) {
      return
    }
    const item: Servers[] = JSON.parse(s)?.Servers || []
    return item.map((i) => i.AccessToken)[0]
  } catch {
    return
  }
}

function splitVideoId(id: string): string {
  return [
    id.slice(0, 8),
    id.slice(8, 12),
    id.slice(12, 16),
    id.slice(16, 20),
    id.slice(20, id.length),
  ].join("-")
}
async function getSubtitleById(
  id: string,
): Promise<Record<string, string> | undefined> {
  const apiKey = getApiKey()
  if (!apiKey) {
    return
  }
  const videoApi = `/Items/${id}?api_key=${apiKey}`
  try {
    const videoInfo: VideoInfo = await fetch(videoApi).then((i) => i.json())

    const sub = videoInfo?.MediaSources[0].MediaStreams.find(
      (i) => i.IsExternal && i.Type === "Subtitle",
    )
    if (!sub) {
      return
    }

    const subId = sub.Index
    const vid = splitVideoId(id)
    const url = `http://localhost:8096/Videos/${vid}/${id}/Subtitles/${subId}/0/Stream.srt?api_key=${apiKey}`
    return {
      "sub-file": url,
    }
  } catch {
    return
  }
}

export const Jellyfin: Rule = {
  match: (url: string): boolean => {
    return [
      jellyfin.MoviesReg,
      jellyfin.detailsReg,
      jellyfin.StreamReg,
      jellyfin.ListReg,
      jellyfin.videoReg,
      jellyfin.HomeReg,
    ].some((i) => i.test(url))
  },
  getVideos: async (url: string): Promise<PlayWith | undefined> => {
    if (jellyfin.detailsReg.test(url)) {
      const id = [
        ".detailImageContainer > .card",
        '[is="emby-ratingbutton"]',
        '[is="emby-playstatebutton"]',
      ]
        .map((i) => document.querySelector(i)?.getAttribute("data-id"))
        .find((i) => !!i)
      if (!id) {
        return
      }
      const titleDom = document.querySelector(".nameContainer > .itemName")
      const title = titleDom?.textContent?.trim()

      const streamUrl = `${location.origin}/Videos/${id}/stream?Static=true`
      return {
        playlist: {
          list: [
            {
              url: streamUrl,
              title: getTitle(title || "") || "",
              vlc_opt: await getSubtitleById(id),
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
              vlc_opt: await getSubtitleById(id),
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
      const list = (
        await Promise.all(
          Array.from(dom).map(async (i) => {
            const id = i.getAttribute("data-id")
            const streamUrl = `${location.origin}/Videos/${id}/stream?Static=true`
            const btn = i.querySelector(".cardText > button")
            const title = btn?.getAttribute("title")
            if (!id) {
              return
            }
            return {
              url: streamUrl,
              title: getTitle(title || "") || "",
              vlc_opt: await getSubtitleById(id),
            }
          }),
        )
      ).filter((i) => !!i)

      return { playlist: { list } }
    }

    if (jellyfin.HomeReg.test(url)) {
      const embyList = Array.from(
        document.querySelectorAll('[is="emby-itemscontainer"]'),
      )
      if (!embyList.length) {
        return
      }

      const list = (
        await Promise.all(
          embyList.flatMap((dom) => {
            const cards = Array.from(dom.querySelectorAll(".card-withuserdata"))
            return cards.map(async (i) => {
              const id = i.getAttribute("data-id")
              if (i.getAttribute("data-type") === "CollectionFolder") {
                return
              }
              const url = `${location.origin}/Videos/${id}/stream?Static=true`
              const title = i
                .querySelector(`a[data-id="${id}"]`)
                ?.textContent?.trim()
              if (!id || !title) {
                return
              }
              return {
                url,
                title,
                vlc_opt: await getSubtitleById(id),
              }
            })
          }),
        )
      ).filter((i) => !!i)

      return { playlist: { list } }
    }

    return
  },
}
