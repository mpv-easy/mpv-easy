import { isBilibili } from "./bilibili"
import { isTwitch } from "./twitch"
import { isYoutube } from "./youtube"
import { detectCmd } from "./ext"
import { existsSync, dirname } from "./fs"
import { getMpvExeDir, joinPath } from "./mpv"

export function isYtdlp(path: string) {
  return [isYoutube, isBilibili, isTwitch].some((f) => f(path))
}

const CookieFileNames = ["cookies.txt", "cookie.txt"]

let YTDLP_PATH: string | undefined | false
export function detectYtdlp(): false | string {
  if (YTDLP_PATH) return YTDLP_PATH
  YTDLP_PATH = detectCmd("yt-dlp")
  return YTDLP_PATH
}

export function detectCookies(): string | undefined {
  const dirs: string[] = []

  // 1. mpv.exe directory
  try {
    const mpvDir = getMpvExeDir()
    if (mpvDir) dirs.push(mpvDir)
  } catch {}

  // 2. yt-dlp executable directory
  try {
    const ytdlpPath = detectYtdlp()
    if (ytdlpPath) {
      const ytdlpDir = dirname(ytdlpPath)
      if (ytdlpDir) dirs.push(ytdlpDir)
    }
  } catch {}

  for (const dir of dirs) {
    for (const name of CookieFileNames) {
      const p = joinPath(dir, name)
      if (existsSync(p)) {
        return p
      }
    }
  }

  return undefined
}
