export function normalize(path: string): string {
  return path.replaceAll("\\\\", "//").replaceAll("\\", "/")
}

export function getFileName(path: string): string | undefined {
  return normalize(path).split("/").at(-1)?.split("?").at(0)
}
export function windowsPath(path: string) {
  return path.replaceAll("//", "\\").replaceAll("/", "\\")
}
