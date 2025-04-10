import { PlayWith, Rule } from "../type"
import { jellyfin, PlayItem, Subtitle } from "@mpv-easy/tool"

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
  Name: string
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

function getSubUrl(id: string, subId: number, apiKey: string): string {
  return `${location.origin}/Videos/${splitVideoId(id)}/${id}/Subtitles/${subId}/0/Stream.srt?api_key=${apiKey}`
}
function getVideoUrl(id: string) {
  return `${location.origin}/Videos/${id}/stream?Static=true`
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

async function getJellyVideoInfo(id: string): Promise<VideoInfo | undefined> {
  const apiKey = getApiKey()
  if (!apiKey) {
    return
  }
  const videoApi = `/Items/${id}?api_key=${apiKey}`
  try {
    const videoInfo: VideoInfo = await fetch(videoApi).then((i) => i.json())
    return videoInfo
  } catch {
    return
  }
}

function getJellySubtitles(
  id: string,
  videoInfo: VideoInfo,
): Subtitle[] | undefined {
  const apiKey = getApiKey()
  if (!apiKey) {
    return
  }
  const sublist = videoInfo?.MediaSources[0].MediaStreams.filter(
    (i) => i.IsExternal && i.Type === "Subtitle",
  )
  if (!sublist?.length) {
    return
  }
  return sublist.map((i) => {
    const url = getSubUrl(id, i.Index, apiKey)
    const title = i.Path.replaceAll("\\", "/").split("/").at(-1)
    return { url, default: i.IsDefault, lang: i.Language, title }
  })
}

async function getJellyfinPlayItem(id: string): Promise<PlayItem | undefined> {
  const info = await getJellyVideoInfo(id)
  if (!info) {
    return
  }
  const subtitles = getJellySubtitles(id, info)
  return {
    video: {
      url: getVideoUrl(id),
      title: info.Name,
    },
    subtitles,
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
      return {
        playlist: {
          list: [await getJellyfinPlayItem(id)].filter((i) => !!i),
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
      return {
        playlist: {
          list: [await getJellyfinPlayItem(id)].filter((i) => !!i),
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
            if (!id) {
              return
            }
            return await getJellyfinPlayItem(id)
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
              const title = i
                .querySelector(`a[data-id="${id}"]`)
                ?.textContent?.trim()
              if (!id || !title) {
                return
              }
              return await getJellyfinPlayItem(id)
            })
          }),
        )
      ).filter((i) => !!i)

      return { playlist: { list } }
    }

    return
  },
}
