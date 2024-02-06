export function normalize(path: string): string {
  return path.replaceAll("\\\\", "//").replaceAll("\\", "/")
}
