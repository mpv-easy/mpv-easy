export function normalize(path: string): string {
  return path.replaceAll("\\\\", "//").replaceAll("\\", "/")
}

export function getFileName(path: string): string | undefined {
  return normalize(path).split("/").at(-1)?.split("?").at(0)
}

export function getExtName(path: string): string | undefined {
  const list = getFileName(path)?.split(".")
  if (!list?.length || list.length === 1) {
    return undefined
  }
  return list.at(-1)
}

export function windowsPath(path: string) {
  return path.replaceAll("//", "\\").replaceAll("/", "\\")
}

export function replaceExt(path: string, ext: string) {
  const list = path.split(".").slice(0, -1)
  list.push(ext)
  return list.join(".")
}

export function isAbsolute(path: string): boolean {
  const webUrlPattern = /^(https?:\/\/|ftp:\/\/|file:\/\/)/i
  const windowsPathPattern = /^[a-zA-Z]:[\\/]/
  const isLinuxAbsolutePath = path.startsWith("/")
  return (
    webUrlPattern.test(path) ||
    windowsPathPattern.test(path) ||
    isLinuxAbsolutePath
  )
}

const UnsafeChars = '\\/:*?"<>|'
export function getSafeName(s: string): string {
  for (const c of UnsafeChars) {
    s = s.replaceAll(c, "_")
  }
  return s
}
