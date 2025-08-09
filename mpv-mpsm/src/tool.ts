import type { Script } from "./index"

export function convertURL(url: string): string {
  const blobPattern =
    /^(https?:\/\/github\.com\/[^/]+\/[^/]+)\/blob\/([^/]+)\/(.+)$/

  if (blobPattern.test(url)) {
    return url.replace(blobPattern, "$1/raw/refs/heads/$2/$3")
  }

  return url
}

export function appendScriptConf(
  mpvConf: Uint8Array,
  scriptConf: Uint8Array,
  script: Script,
): Uint8Array {
  const decoder = new TextDecoder("utf-8")
  const mpvString = decoder.decode(mpvConf)
  const tab = "#".repeat(4)
  const banner = [tab, script.name, tab].join(" ")
  if (mpvString.includes(banner)) {
    return mpvConf
  }
  const scriptString = decoder.decode(scriptConf).trim()
  const resultString = [mpvString, "", banner, scriptString, banner, ""]
    .join("\n")
    .trimStart()
  const encoder = new TextEncoder()
  return encoder.encode(resultString)
}

export function commonPrefix(arr: string[][]): number {
  if (arr.length === 0) return 0
  if (arr.length === 1) return arr[0].length

  let count = 0
  const first = arr[0]

  for (let i = 0; i < first.length; i++) {
    const value = first[i]
    if (arr.every((sub) => sub[i] === value)) {
      count++
    } else {
      break
    }
  }
  return count
}
