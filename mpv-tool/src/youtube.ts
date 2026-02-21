import { execAsync } from "./common"
import { getLang } from "./os"
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

export async function playYoutubeVideo(
  url: string,
  cookiesPath?: string,
): Promise<void> {
  loadfile(url, "replace")
  const lang = getLang()
  const langPrefix = lang.split("-")[0]

  try {
    const result = await getYoutubeSubtitles(url, cookiesPath)
    if (!result) {
      return
    }
    const allSubs = { ...result.subtitles, ...result.automatic_captions }

    for (const [code, formats] of Object.entries(allSubs)) {
      if (code.startsWith(langPrefix)) {
        const srtFormat = formats.find((f) => f.ext === "srt")
        if (srtFormat) {
          subAdd(srtFormat.url, "cached", srtFormat.name, code)
        }
      }
    }
  } catch (e) {
    print("getYoutubeSubtitles error:", e)
  }
}
