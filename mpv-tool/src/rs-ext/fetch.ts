import { execAsync } from "../common"
import { FetchOption, FetchResponse } from "../const"
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
