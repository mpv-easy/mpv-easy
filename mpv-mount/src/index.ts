import { definePlugin } from "@mpv-easy/plugin"
import {
  existsSync,
  isDir,
  isPlayable,
  normalize,
  readFile,
  webdavList,
} from "@mpv-easy/tool"
import {
  getPlayableList,
  type AutoloadConfig,
  defaultConfig as autoloadDefaultConfig,
} from "@mpv-easy/autoload"
import { Playlist } from "serde-m3u"

export const pluginName = "@mpv-easy/mount"

export type Mount = {
  url: string
  name: string
  username?: string
  password?: string
}

export type MountConfig = {
  mount: Mount[]
}

export const defaultConfig: MountConfig = {
  mount: [],
}

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: MountConfig
  }
}

/**
 * Resolve a mount point to a list of playable URLs.
 *
 * Supports three types of mount sources:
 * - Local directory: uses autoload to discover playable files
 * - M3U playlist file: parses the playlist and returns its URLs
 * - WebDAV remote: lists the remote directory and returns playable URLs with auth
 *
 * @param mount - The mount configuration (name, url, username, password)
 * @param autoloadConfig - The autoload plugin config for filtering media types
 * @returns Array of playable URLs, or throws on webdav error
 */
export async function resolveMountPlaylist(
  mount: Mount,
  autoloadConfig: AutoloadConfig = autoloadDefaultConfig,
): Promise<string[]> {
  const { url, username, password } = mount
  const auth = username && password ? `${username}:${password}` : undefined
  const exists = existsSync(url)

  if (exists && isDir(url)) {
    // local dir
    return getPlayableList(autoloadConfig, undefined, url, undefined)
  }

  if (exists && url.endsWith(".m3u")) {
    // m3u playlist
    const s = readFile(url)
    const m3u = Playlist.fromString(s)
    return m3u.list.map((i) => i.url)
  }

  // try webdav
  const origin = new URL(url).origin
  const v = (await webdavList(url, auth))
    .map((i) =>
      normalize(
        origin +
          i
            .split("/")
            .map((k) => encodeURIComponent(k))
            .join("/"),
      ),
    )
    .filter((p) => isPlayable(p))

  const authList = v.map((i) => {
    const authStr = `${username}:${password}`
    return i.replace("://", `://${authStr}@`)
  })

  return authList
}

export default definePlugin((_context, _api) => ({
  name: pluginName,
  defaultConfig: defaultConfig,
  create: () => {},
  destroy: () => {},
}))
