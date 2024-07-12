import { PlayItem } from "./type"
import { strToU8, gzipSync } from "fflate"

export function getTitle(s: string): string {
  return s.replaceAll("'", "").replaceAll('"', "")
}

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

// Use a lookup table to find the index.
const lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256)
for (let i = 0; i < chars.length; i++) {
  lookup[chars.charCodeAt(i)] = i
}

export function encode(arraybuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arraybuffer)
  const len = bytes.length
  let base64 = ""

  for (let i = 0; i < len; i += 3) {
    base64 += chars[bytes[i] >> 2]
    base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)]
    base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)]
    base64 += chars[bytes[i + 2] & 63]
  }

  if (len % 3 === 2) {
    base64 = `${base64.substring(0, base64.length - 1)}=`
  } else if (len % 3 === 1) {
    base64 = `${base64.substring(0, base64.length - 2)}==`
  }

  return base64
}

export function getMpvUrl(playList: PlayItem[]): string {
  const jsonStr = JSON.stringify(playList)
  const zipBuf = gzipSync(strToU8(jsonStr))
  const base64 = encode(zipBuf)
  return `mpv-easy://${base64}`
}

export function openUrl(url: string) {
  const a = document.createElement("a")
  a.href = url
  a.click()
}
