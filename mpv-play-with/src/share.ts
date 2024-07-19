import { PlayWith } from "./type"
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

export function encodeToBase64(playList: PlayWith): string {
  const jsonStr = JSON.stringify(playList)
  const zipBuf = gzipSync(strToU8(jsonStr))
  const base64 = encode(zipBuf)
  return base64
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function splitChunk(array: string, chunkSize: number): string[] {
  const chunks: string[] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize)
    chunks.push(chunk)
  }
  return chunks
}

export const Header = "mpv-easy://"
const ChunkSize = 2000
const WaitTime = 100

export async function sendToMpv(base64: string) {
  const a = document.createElement("a")
  a.href = Header + base64
  a.click()
}
export async function openUrl(base64: string) {
  if (base64.length > ChunkSize) {
    const count = Math.ceil(base64.length / ChunkSize)
    const chunks = splitChunk(base64, ChunkSize)
    for (let i = 0; i < count; i++) {
      const chunk = chunks[i]
      const url = `${chunk}?${i}&${count}`
      sendToMpv(url)

      // Wait for mpv-easy-play-with to write the file to prevent out-of-order problems
      await sleep(WaitTime)
    }
    return
  }
  sendToMpv(base64)
}
