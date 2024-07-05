import decodeUriComponent from "decode-uri-component"
import { execSync } from "../common"
import { getFileName } from "../path"
import { getRsExtExePath } from "./share"

export type FetchParams = {
  url: string
  headers: Record<string, string>
  body: string
}

export type FetchResponse = {
  status: number
  text: string
}
export function fetch(url: string, exe = getRsExtExePath()): FetchResponse {
  return JSON.parse(execSync([exe, "fetch", JSON.stringify(url)]))
}

export function webdavList(url: string, exe = getRsExtExePath()) {
  const s = execSync([exe, "webdav", "list", JSON.stringify(url)])
  const status = JSON.parse(s)
  const response = status.response as { href: string }[]
  const list = response
    .map((i) => decodeUriComponent(i.href))
    .filter((i) => !!getFileName(i)?.length)
  return list
}
