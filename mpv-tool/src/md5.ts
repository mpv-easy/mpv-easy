import MD5 from "crypto-js/md5"

export function md5(s: string): string {
  return MD5(s).toString()
}
