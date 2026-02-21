import { execAsync } from "./common"
import { getProperty } from "./mpv"
import { getLang } from "./os"
import { getSubtitleTracks } from "./subtitle"
import { loadfile, subAdd } from "./type"

export const YoutubeRegex =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

export const MainPageReg = /^(?:https?:\/\/)(.*?)\.youtube\.(.*?)\/?$/

export const MyVideosReg =
  /^(?:https?:\/\/)(.*?).youtube\.(.*?)\/@(.*?)\/videos\/?/

export const ListReg =
  /^(?:https?:\/\/)(.*?).youtube\.(.*?)\/watch\?v=(.*?)&list=(.*?)/

export const VideoReg = /^(?:https?:\/\/)(.*?).youtube\.(.*?)\/watch\?v=(.*?)/

export const ResultReg =
  /^(?:https?:\/\/)(.*?).youtube\.(.*?)\/results\?search_query=(.*?)/

export function isYoutube(s: string): boolean {
  return [
    YoutubeRegex,
    MainPageReg,
    MyVideosReg,
    ListReg,
    VideoReg,
    ResultReg,
  ].some((i) => i.test(s))
}

export type YoutubeThumbnail = {
  url: string
  height: number
  width: number
}

export type YoutubeEntry = {
  title: string
  thumbnails: YoutubeThumbnail[]
  duration: number | null
  timestamp: number | null
  ie_key: string
  id: string
  _type: string
  url: string
  __x_forwarded_for_ip: string | null
}

export type YoutubeRecommendationsResult = {
  entries: YoutubeEntry[]
}

export async function getYoutubeRecommendations(
  cookiesPath?: string,
  url = "https://www.youtube.com/",
): Promise<YoutubeEntry[]> {
  const args = ["yt-dlp", "--flat-playlist", "-J", url]
  if (cookiesPath) {
    args.push(`--cookies=${cookiesPath}`)
  }
  const stdout = await execAsync(args)
  const result: YoutubeRecommendationsResult = JSON.parse(stdout)
  return result.entries
}

export type YoutubeSubtitleFormat = {
  ext: string
  url: string
  name: string
  protocol?: string
}

export type YoutubeSubtitles = Record<string, YoutubeSubtitleFormat[]>

export type YoutubeSubtitlesResult = {
  subtitles: YoutubeSubtitles
  automatic_captions: YoutubeSubtitles
}

export async function getYoutubeSubtitles(
  url: string,
  cookiesPath?: string,
): Promise<YoutubeSubtitlesResult | undefined> {
  const args = ["yt-dlp", "-J", "--no-warnings", "--skip-download", url]
  if (cookiesPath) {
    args.push(`--cookies=${cookiesPath}`)
  }
  try {
    const stdout = await execAsync(args)
    return JSON.parse(stdout)
  } catch (e) {
    print(e)
  }
}

function getSub(
  subs: Record<string, YoutubeSubtitleFormat[]>,
  lang: string,
): undefined | { lang: string; format: YoutubeSubtitleFormat } {
  const langPrefix = lang.split("-")[0]
  const enLang = "en"
  let enFormat: undefined | YoutubeSubtitleFormat
  for (const [code, formats] of Object.entries(subs)) {
    const format = formats.find((f) => f.ext === "srt")
    if (code.startsWith(langPrefix)) {
      if (format) {
        return { lang, format }
      }
    }
    if (!enFormat && enLang === code) {
      enFormat = format
    }
  }
  if (enFormat) {
    return { lang: enLang, format: enFormat }
  }
}

export async function loadYoutubeSubtitles(url: string, cookiesPath?: string) {
  const lang = getLang()
  const hasSub = getSubtitleTracks().find(
    (i) => i.lang?.toLowerCase() === lang.toLowerCase(),
  )
  if (hasSub) {
    return
  }
  try {
    const result = await getYoutubeSubtitles(url, cookiesPath)
    if (!result) {
      return
    }
    const subs = { ...result.automatic_captions, ...result.subtitles }
    const sub = getSub(subs, lang)
    // Prevent the video from changing when asynchronous return
    if (sub && getProperty("path") === url) {
      // FIXME: Should we always load en-US?
      subAdd(sub.format.url, "cached", sub.format.name, sub.lang)
    }
  } catch (e) {
    print("getYoutubeSubtitles error:", e)
  }
}

export async function playYoutubeVideo(
  url: string,
  cookiesPath?: string,
): Promise<void> {
  loadfile(url, "replace")
  await loadYoutubeSubtitles(url, cookiesPath)
}
