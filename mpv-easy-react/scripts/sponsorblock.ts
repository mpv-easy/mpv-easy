import "@mpv-easy/polyfill"
import {
  cacheAsync,
  fetch,
  getOptions,
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

const defaultConfig = {
  servers:
    "https://sponsor.ajay.app/api/skipSegments,https://api.sponsor.ajay.app/api/skipSegments",
  categories: "sponsor,outro,selfpromo",
  sponsorblockEventName: "sponsorblock",
  cacheTtl: 86400,
}

const { servers, categories, sponsorblockEventName, cacheTtl } = {
  ...defaultConfig,
  ...getOptions("mpv-easy-sponsorblock", {
    servers: {
      type: "string",
      key: "servers",
    },
    categories: {
      type: "string",
      key: "categories",
    },
    "sponsorblock-event-name": {
      type: "string",
      key: "sponsorblockEventName",
    },
    "cache-ttl": {
      type: "number",
      key: "cacheTtl",
    },
  }),
}

const ServerList = servers
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
const RangesMap: Record<string, [number, number][]> = {}
let active = true

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
    print(e)
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

const CategoriesString = encodeURIComponent(
  JSON.stringify(categories.split(",")),
)

async function fetchRanges(
  videoId: string,
): Promise<[number, number][] | undefined> {
  for (const s of ServerList) {
    const url = `${s}?categories=${CategoriesString}&videoID=${videoId}`
    try {
      const text = await cacheAsync(
        url,
        () => fetch(url, { redirect: "follow" }).then((r) => r.text()),
        cacheTtl,
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
      print(`[Sponsorblock] request failed for ${s}: ${e}`)
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
  const videoId = getId()
  if (!videoId) {
    print("[Sponsorblock] video id not found")
    return
  }
  if (RangesMap[videoId]) {
    print(
      `[Sponsorblock] video id: ${videoId} ranges found in cache: ${JSON.stringify(
        RangesMap[videoId],
      )}`,
    )
    return
  }
  const ranges = await fetchRanges(videoId)
  if (ranges) {
    RangesMap[videoId] = ranges
    print(
      `[Sponsorblock] video id: ${videoId} ranges: ${JSON.stringify(ranges)}`,
    )
  } else {
    print(`[Sponsorblock] video id: ${videoId} no ranges found`)
  }
}

function sponsorblockOn() {
  observePropertyNumber("time-pos", skip)
  registerEvent("file-loaded", cacheRanges)
  cacheRanges()
  print("[Sponsorblock] on")
}

function sponsorblockOff() {
  unobserveProperty(skip)
  unregisterEvent(cacheRanges)
  IdCache = undefined
  print("[Sponsorblock] off")
}

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

function skip(_: string, pos: number) {
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
      print(`[Sponsorblock] skipping forward ${skipSeconds}s`)
      // +0.01 to prevent mpv from spamming skip
      setProperty("time-pos", `${end + 0.01}`)
      return
    }
  }
}

if (active) {
  sponsorblockOn()
}
