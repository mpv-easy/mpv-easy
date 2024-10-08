import { normalize } from "./path"
import { existsSync } from "./fs"
import { getTmpDir } from "./tmp"
import { readFile, writeFile } from "./mpv"
import { md5 } from "./md5"

export async function cacheAsync(
  key: string,
  getDate: () => Promise<string>,
): Promise<string> {
  const tmpDir = getTmpDir()
  const hash = md5(key)
  const path = normalize(`${tmpDir}/${hash}`)
  if (existsSync(path)) {
    return readFile(path)
  }
  const value = await getDate()
  writeFile(path, value)
  return value
}

export function cacheSync(key: string, getDate: () => string): string {
  const tmpDir = getTmpDir()
  const hash = md5(key)
  const path = normalize(`${tmpDir}/${hash}`)
  if (existsSync(path)) {
    return readFile(path)
  }
  const value = getDate()
  writeFile(path, value)
  return value
}
