import { execAsync, execSync } from "../common"
import { getFileName } from "../path"
import { getRsExtExePath } from "./share"

export function webdavList(
  url: string,
  auth?: string,
  exe = getRsExtExePath(),
) {
  const args = [exe, "webdav", "list", JSON.stringify(url)]
  if (auth) {
    args.push(JSON.stringify(auth))
  }
  const s = execSync(args)
  const status = JSON.parse(s)
  const response = status.response as { href: string }[]
  const list = response
    .map((i) => decodeURIComponent(i.href))
    .filter((i) => !!getFileName(i)?.length)
  return list
}

export async function webdavListAsync(
  url: string,
  auth?: string,
  exe = getRsExtExePath(),
): Promise<string[]> {
  const args = [exe, "webdav", "list", JSON.stringify(url)]
  if (auth) {
    args.push(JSON.stringify(auth))
  }
  const s = await execAsync(args)
  const status = JSON.parse(s)
  const response = status.response as { href: string }[]
  const list = response
    .map((i) => decodeURIComponent(i.href))
    .filter((i) => !!getFileName(i)?.length)
  return list
}
