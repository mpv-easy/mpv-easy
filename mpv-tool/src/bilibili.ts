export const VideoReg = /^https?:\/\/(.*?)\.bilibili.com\/video\/BV(.*?)\//

export const MainReg =
  /^https?:\/\/(.*?)\.bilibili\.com\/(\?spm_id_from=(.*?))?\/?/

export const PopularReg = /^https?:\/\/(.*?)\.bilibili\.com\/v\/popular/

export const BangumiReg = /^https?:\/\/(.*?)\.bilibili\.com\/bangumi/

export const LiveReg = /^https?:\/\/live.bilibili.com\/(.*?)/

export const SpaceReg = /^https?:\/\/space.bilibili.com\/(.*?)/

export function isBilibili(url: string) {
  return [VideoReg, MainReg, PopularReg, BangumiReg, LiveReg, SpaceReg].some(
    (i) => i.test(url),
  )
}

export function getBV(url: string) {
  if (!isBilibili(url)) {
    return
  }
  const ret = url.match(VideoReg)
  return ret?.[2]
}

export function getAid(): string | undefined {
  // @ts-expect-error
  return globalThis?.__INITIAL_STATE__.aid
}

export function getBvid(): string | undefined {
  // @ts-expect-error
  return globalThis?.__INITIAL_STATE__.bvid
}

export function getCids(): Record<number, string> | undefined {
  const bvid = getBvid()
  // @ts-expect-error
  return globalThis?.__INITIAL_STATE__.cidMap[bvid].cids
}

export type Section = {
  episodes: Episode[]
  id: number
  title: string
}
export function getSections(): Section[] {
  // @ts-expect-error
  return globalThis?.__INITIAL_STATE__.sections as any
}

export type Episode = {
  aid: number
  cid: number
  title: string
  id: number
  season_id: number
  section_id: number
  bvid: string
}

export function getEpisodes() {
  const s = getSections()
  const list = []
  for (const i in s) {
    const e = s[i].episodes
    list.push(e)
  }

  return list.flat()
}

export type VideoData = {
  pages: {
    cid: number
    page: number
    from: string
    part: string
    duration: number
    vid: string
    weblink: string
  }[]
}

export function getVideoData(): VideoData {
  // @ts-expect-error
  return globalThis?.__INITIAL_STATE__.videoData as any
}
