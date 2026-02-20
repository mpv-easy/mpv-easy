import { execAsync } from "./common"

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
  cookiesPath: string,
  url = "https://www.youtube.com/",
): Promise<YoutubeEntry[]> {
  const args = [
    "yt-dlp",
    "--flat-playlist",
    "-J",
    url,
    `--cookies=${cookiesPath}`,
  ]
  const stdout = await execAsync(args)
  const result: YoutubeRecommendationsResult = JSON.parse(stdout)
  return result.entries
}
