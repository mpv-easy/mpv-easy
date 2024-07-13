export const VideoReg = /^https?:\/\/(.*?)\.bilibili.com\/video\/BV(.*?)\//

export const MainReg =
  /^https?:\/\/(.*?)\.bilibili\.com\/(\?spm_id_from=(.*?))?\/?/

export function isBilibili(url: string) {
  return [VideoReg, MainReg].some((i) => i.test(url))
}

export function getBV(url: string) {
  if (!isBilibili(url)) {
    return
  }
  const ret = url.match(VideoReg)
  return ret?.[2]
}
