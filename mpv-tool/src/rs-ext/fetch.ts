import decodeUriComponent from "decode-uri-component"
import { execAsync, execSync } from "../common"
import { getFileName } from "../path"
import { getRsExtExePath } from "./share"

export type FetchParams = {
  url: string
  headers: Record<string, string>
  body: string
}

export type FetchResponse = {
  status: number
  ok: boolean
  text(): Promise<string>
  json(): Promise<any>
}

export async function fetch(
  url: string,
  exe = getRsExtExePath(),
): Promise<FetchResponse> {
  if (typeof globalThis.fetch === "function") {
    return globalThis.fetch(url)
  }

  const { status, text }: { status: number; text: string } = JSON.parse(
    execSync([exe, "fetch", JSON.stringify(url)]),
  )
  return {
    status,
    ok: status === 200,
    text: () => Promise.resolve(text),
    json: () => Promise.resolve(JSON.parse(text)),
  }
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

export async function webdavListAsync(
  url: string,
  exe = getRsExtExePath(),
): Promise<string[]> {
  const s = await execAsync([exe, "webdav", "list", JSON.stringify(url)])
  const status = JSON.parse(s)
  const response = status.response as { href: string }[]
  const list = response
    .map((i) => decodeUriComponent(i.href))
    .filter((i) => !!getFileName(i)?.length)
  return list
}
