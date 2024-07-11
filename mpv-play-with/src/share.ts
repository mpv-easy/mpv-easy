import { encode } from "js-base64"

export type PlayItem = {
  url: string
  args: string[]
}

export function getTitle(s: string): string {
  return s.replaceAll("'", "").replaceAll('"', "")
}

export function openMpv(playList: PlayItem[]) {
  const a = document.createElement("a")
  const base64 = encode(JSON.stringify(playList))
  a.href = `mpv-easy://${base64}`
  a.click()
}
