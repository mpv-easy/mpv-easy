export const VideoReg = /^https?:\/\/(.*?)\.bilibili.com\/video\/BV(.*?)\//

export const MainReg =
  /^https?:\/\/(.*?)\.bilibili\.com\/(\?spm_id_from=(.*?))?\/?/


export const PopularReg = /^https?:\/\/(.*?)\.bilibili\.com\/v\/popular/

export function isBilibili(url: string) {
  return [VideoReg, MainReg, PopularReg].some((i) => i.test(url))
}

export function getBV(url: string) {
  if (!isBilibili(url)) {
    return
  }
  const ret = url.match(VideoReg)
  return ret?.[2]
}

export function getAid(): string | undefined {
  // @ts-ignore
  return globalThis?.__INITIAL_STATE__.aid
}

export function getBvAid(): string | undefined {
  // @ts-ignore
  return globalThis?.__INITIAL_STATE__.bvid
}