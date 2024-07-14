export const TvReg = /^(?:https?:\/\/)(.*?).twitch\.tv\/(.*?)$/
export const VideoReg = /^(?:https?:\/\/)(.*?).twitch\.tv\/(.*?)\/video\/(.*?)$/

export function isTwitch(url: string) {
  return [TvReg, VideoReg].some((i) => i.test(url))
}
