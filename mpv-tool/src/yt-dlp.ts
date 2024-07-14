import { isBilibili } from "./bilibili"
import { isTwitch } from "./twitch"
import { isYoutube } from "./youtube"

export function isYtdlp(path: string) {
  return [isYoutube, isBilibili, isTwitch].some((f) => f(path))
}
