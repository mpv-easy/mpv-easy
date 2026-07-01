import { definePlugin } from "@mpv-easy/plugin"
import {
  cacheAsync,
  createLogger,
  fetch,
  getProperty,
  getPropertyNumber,
  observePropertyNumber,
  registerEvent,
  registerScriptMessage,
  setProperty,
  showNotification,
  unobserveProperty,
  unregisterEvent,
} from "@mpv-easy/tool"
import { youtube } from "@mpv-easy/tool"

const log = createLogger("sponsorblock")
export const pluginName = "@mpv-easy/sponsorblock"
export type SponsorblockConfig = {
  active: boolean
  servers: string
  categories: string
  sponsorblockEventName: string
  cacheTtl: number
}
export const defaultConfig: SponsorblockConfig = {
  active: true,
  servers:
    "https://sponsor.ajay.app/api/skipSegments,https://api.sponsor.ajay.app/api/skipSegments",
  categories: "sponsor,outro,selfpromo",
  sponsorblockEventName: "sponsorblock",
  cacheTtl: 86400,
}
declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: SponsorblockConfig
  }
}
export default definePlugin((context, _api) => ({
  name: pluginName,
  defaultConfig: defaultConfig,
  create: () => {
    sponsorblock(context[pluginName])
  },
  destroy: () => {},
}))

const RangesMap: Record<string, [number, number][]> = {}
let active = true
let CategoriesString = ""
let ServerList: string[] = []
let CacheTtl = 0

export function sponsorblock({
  active: startActive,
  servers,
  categories,
  sponsorblockEventName,
  cacheTtl,
}: SponsorblockConfig) {
  active = startActive
  CacheTtl = cacheTtl
  CategoriesString = encodeURIComponent(JSON.stringify(categories.split(",")))

  ServerList = servers
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  registerScriptMessage(sponsorblockEventName, () => {
    active = !active
    if (active) {
      sponsorblockOn()
    } else {
      sponsorblockOff()
    }
  })

  registerEvent("end-file", () => {
    IdCache = undefined
  })
  if (active) {
    sponsorblockOn()
  }
}

function extractYoutubeId(videoPath: string, purl: string): string | undefined {
  const patterns = [
    /https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/,
    /https?:\/\/w?w?w?\.?youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
    /\/watch.*[?&]v=([a-zA-Z0-9_-]+)/,
    /\/embed\/([a-zA-Z0-9_-]+)/,
    /-([a-zA-Z0-9_-]+)\./,
  ]

  // also try the http-header-fields Referer
  let referer = ""
  try {
    const headerFields = getProperty("http-header-fields") ?? ""
    const match = headerFields.match(/Referer:([^,]+)/)
    if (match) {
      referer = match[1]
    }
  } catch (e) {
    log.warn("extractYoutubeId: failed to parse Referer", e)
  }

  const sources = [videoPath, referer, purl]

  for (const pattern of patterns) {
    for (const source of sources) {
      const match = source.match(pattern)
      if (match?.[1]) {
        return match[1]
      }
    }
  }

  return
}

async function fetchRanges(
  videoId: string,
): Promise<[number, number][] | undefined> {
  for (const s of ServerList) {
    const url = `${s}?categories=${CategoriesString}&videoID=${videoId}`
    try {
      const text = await cacheAsync(
        url,
        () => fetch(url, { redirect: "follow" }).then((r) => r.text()),
        CacheTtl,
      )
      if (!text || text.startsWith("Not Found")) {
        continue
      }
      const data: { segment: [number, number] }[] = JSON.parse(text)
      if (!Array.isArray(data) || data.length === 0) {
        continue
      }
      return data.map((item) => item.segment)
    } catch (e) {
      log.error(`fetchRanges: ${s} failed`, e)
    }
  }
  showNotification(
    `[Sponsorblock] all servers failed\nplease check if the servers are available: ${ServerList.join("\n")}\nand your network connection`,
    5,
  )
  return
}

let IdCache: string | undefined
function getId() {
  if (IdCache) return IdCache
  const videoPath = getProperty("path") ?? ""
  const purl = getProperty("metadata/by-key/PURL") ?? ""
  const videoId = extractYoutubeId(videoPath, purl)
  if (!videoId || videoId.length < 11) {
    return
  }
  IdCache = videoId.substring(0, 11)
  return IdCache
}

async function cacheRanges() {
  IdCache = undefined
  if (!youtube.isYoutube(getProperty("path") ?? "")) {
    log.debug("skipping")
    return
  }
  const videoId = getId()
  if (!videoId) {
    log.warn("video id not found")
    return
  }
  if (RangesMap[videoId]) {
    log.debug(`${videoId} found in cache`)
    return
  }
  const ranges = await fetchRanges(videoId)
  if (ranges) {
    RangesMap[videoId] = ranges
    log.info(`${videoId} got ${ranges.length} ranges`)
  } else {
    log.info(`${videoId} no ranges found`)
  }
}

function sponsorblockOn() {
  observePropertyNumber("time-pos", skip)
  registerEvent("file-loaded", cacheRanges)
  cacheRanges()
  log.info("sponsorblock on")
}

function sponsorblockOff() {
  unobserveProperty(skip)
  unregisterEvent(cacheRanges)
  IdCache = undefined
  log.info("sponsorblock off")
}

function skip(_: string, pos: number) {
  if (!active) return
  const videoId = getId()
  if (!videoId) return
  const ranges = RangesMap[videoId]
  if (!ranges) {
    return
  }
  for (const [start, end] of ranges) {
    if (start <= pos && end > pos) {
      const currentPos = getPropertyNumber("time-pos") ?? pos
      const skipSeconds = Math.floor(end - currentPos)
      log.info(`skipping forward ${skipSeconds}s`)
      // +0.01 to prevent mpv from spamming skip
      setProperty("time-pos", `${end + 0.01}`)
      return
    }
  }
}
