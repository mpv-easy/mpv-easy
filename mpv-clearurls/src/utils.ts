/**
 * Shared utility functions for URL cleaning.
 */

/**
 * Remove the trailing slash from a URL path, e.g.
 * `https://example.com/video/` → `https://example.com/video`.
 * A bare origin like `https://example.com/` is left unchanged.
 */
export function removeTrailingSlash(url: string): string {
  if (url.endsWith("/") && url.length > 1) {
    const prevChar = url[url.length - 2]
    if (prevChar !== ":" && prevChar !== "/") {
      return url.slice(0, -1)
    }
  }
  return url
}

/**
 * Remove specific query parameters from a URL while keeping the rest intact.
 * Also strips the trailing slash left behind after parameter removal.
 * Returns `undefined` when no parameters were actually removed.
 */
export function removeQueryParams(
  url: string,
  paramsToRemove: string[],
): string | undefined {
  const qIndex = url.indexOf("?")
  if (qIndex === -1) return undefined

  const base = url.substring(0, qIndex)
  const queryString = url.substring(qIndex + 1)

  const hashIndex = queryString.indexOf("#")
  const rawQuery =
    hashIndex === -1 ? queryString : queryString.substring(0, hashIndex)
  const hash = hashIndex === -1 ? "" : queryString.substring(hashIndex)

  const pairs = rawQuery.split("&")
  const removeSet = new Set(paramsToRemove.map((p) => p.toLowerCase()))
  const kept = pairs.filter((pair) => {
    const key = pair.split("=")[0].toLowerCase()
    return !removeSet.has(key)
  })

  if (kept.length === pairs.length) return undefined

  const cleaned =
    kept.length > 0 ? `${base}?${kept.join("&")}${hash}` : `${base}${hash}`
  return removeTrailingSlash(cleaned)
}

/**
 * Strip the entire query string (everything after `?`) from a URL.
 * Also strips the trailing slash left behind after removal.
 * Returns `undefined` when the URL has no query string.
 */
export function stripAllQueryParams(url: string): string | undefined {
  const qIndex = url.indexOf("?")
  if (qIndex === -1) return undefined
  return removeTrailingSlash(url.substring(0, qIndex))
}
