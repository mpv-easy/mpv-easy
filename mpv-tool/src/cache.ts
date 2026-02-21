import { normalize } from "./path"
import { existsSync } from "./fs"
import { getTmpDir } from "./tmp"
import { fileInfo, readFile, writeFile } from "./mpv"
import { md5 } from "./md5"

function isCacheValid(path: string, ttl: number): boolean {
  if (ttl <= 0) return true
  const info = fileInfo(path)
  if (!info) return false
  const now = Date.now() / 1000
  return now - info.mtime < ttl
}

export async function cacheAsync(
  key: string,
  getDate: () => Promise<string>,
  ttl = 0,
): Promise<string> {
  const tmpDir = getTmpDir()
  const hash = md5(key)
  const path = normalize(`${tmpDir}/${hash}`)
  if (existsSync(path) && isCacheValid(path, ttl)) {
    const cache = readFile(path)
    if (cache) {
      return cache
    }
  }
  const value = await getDate()
  writeFile(path, value)
  return value
}

export function cacheSync(key: string, getDate: () => string, ttl = 0): string {
  const tmpDir = getTmpDir()
  const hash = md5(key)
  const path = normalize(`${tmpDir}/${hash}`)
  if (existsSync(path) && isCacheValid(path, ttl)) {
    const cache = readFile(path)
    if (cache) {
      return cache
    }
  }
  const value = getDate()
  writeFile(path, value)
  return value
}
