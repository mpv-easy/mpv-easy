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
