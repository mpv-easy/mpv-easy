export const MainRegex = /^(?:https?:\/\/)(.*?).nicovideo\.jp/
export const VideoRegex = /^(?:https?:\/\/)(.*?).nicovideo\.jp\/watch\/(sm\d+)/

export function isNicovideo(s: string): boolean {
  return [MainRegex, VideoRegex].some((i) => i.test(s))
}
