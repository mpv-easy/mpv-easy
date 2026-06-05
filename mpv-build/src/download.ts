
import { download as downloadRepo } from "jdl"
import { decode, File, guess } from "@easy-install/easy-archive"
import type { DataType, Platform } from "./types"
import {
  getCdnFileUrl,
} from "./constants"

/**
 * Download binary data from a URL. Throws on non-2xx responses.
 */
export async function downloadBinary(url: string): Promise<Uint8Array> {
  const resp = await fetch(url)
  if (!resp.ok) {
    throw new Error(
      `Failed to download ${url}: ${resp.status} ${resp.statusText}`,
    )
  }
  const buffer = await resp.arrayBuffer()
  return new Uint8Array(buffer)
}

export function getScriptDownloadURL(name: string) {
  return getCdnFileUrl(`${name}.zip`)
}

/**
 * Trigger a file download in the browser.
 */
export function downloadBinaryFile(
  fileName: string,
  content: Uint8Array,
): void {
  const blob = new Blob([new Uint8Array(content)], {
    type: "application/octet-stream",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  const name = fileName.split("/").at(-1) ?? fileName
  a.download = name
  a.href = url
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Download script files from a repository or CDN.
 * Returns an empty array on failure instead of throwing.
 */
export async function getScriptFiles(script: DataType): Promise<File[]> {
  try {
    if (script.repo) {
      const files = await downloadRepo(script.repo.user, script.repo.repo)
      return files
        .filter((i) => !i.isDir)
        .map(
          ({ path, buffer }) => new File(path, buffer!, undefined, false, null),
        )
    }

    const { download } = script
    if (![".js", ".lua", ".zip"].some((i) => download.endsWith(i))) {
      console.warn("not support script:", script)
      return []
    }

    const url = getScriptDownloadURL(script.name)
    const bin = await downloadBinary(url)

    const decoded = decode(guess(url)!, bin)
    if (!decoded) {
      console.error(`Failed to decode archive for ${script.name}`)
      return []
    }
    return decoded.filter((i) => !i.isDir)
  } catch (e) {
    console.error(`getScriptFiles error for ${script.name}:`, e)
    return []
  }
}

/**
 * Download mpv player files for the given platform.
 * Returns an empty array on failure instead of throwing.
 */
export async function getMpvFiles(platform: Platform): Promise<File[]> {
  try {
    let mpvUrl = getCdnFileUrl("mpv-windows.tar.xz")
    if (platform === "mpv.net") {
      mpvUrl = getCdnFileUrl("mpv.net.tar.xz")
    } else if (platform === "mpv-v3") {
      mpvUrl = getCdnFileUrl("mpv-v3-windows.tar.xz")
    } else if (platform === "mpv-qjs") {
      mpvUrl = getCdnFileUrl("mpv-qjs-windows.tar.xz")
    }

    const bin = await downloadBinary(mpvUrl)
    const files = decode(guess(mpvUrl)!, bin) || []
    return files
  } catch (e) {
    console.error(`getMpvFiles error for ${platform}:`, e)
    return []
  }
}

/**
 * Download and decode an external tool archive.
 * Returns an empty array on failure.
 */
export async function downloadExternal(url: string): Promise<File[]> {
  try {
    const bin = await downloadBinary(url)
    const files = decode(guess(url)!, bin)
    if (!files) {
      console.error(`Failed to decode archive from ${url}`)
      return []
    }
    return files
  } catch (e) {
    console.error(`downloadExternal error for ${url}:`, e)
    return []
  }
}
