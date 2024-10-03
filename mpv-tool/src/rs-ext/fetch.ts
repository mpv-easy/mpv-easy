import { execAsync, execSync } from "../common"
import { FetchOption, FetchResponse } from "../const"
import { getFileName } from "../path"
import { getRsExtExePath } from "./share"

export async function fetchByExt(
  url: string,
  options?: FetchOption,
  exe = getRsExtExePath(),
): Promise<FetchResponse> {
  const cmd = options
    ? [exe, "fetch", JSON.stringify(url), JSON.stringify(options)]
    : [exe, "fetch", JSON.stringify(url)]

  const { status, text }: { status: number; text: string } = JSON.parse(
    await execAsync(cmd),
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
    .map((i) => decodeURIComponent(i.href))
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
    .map((i) => decodeURIComponent(i.href))
    .filter((i) => !!getFileName(i)?.length)
  return list
}
