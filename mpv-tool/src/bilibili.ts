export const VideoReg = /^https?:\/\/(.*?).bilibili.com\/video\/BV(.*?)\//

export function isBilibili(url: string) {
  return [VideoReg].some((i) => i.test(url))
}

export function getBV(url: string) {
  if (!isBilibili(url)) {
    return
  }
  const ret = url.match(VideoReg)
  return ret?.[2]
}
