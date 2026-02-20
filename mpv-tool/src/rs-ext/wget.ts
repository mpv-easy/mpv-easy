import { execAsync, execSync } from "../common"
import { getRsExtExePath } from "./share"

export function wget(
  url: string,
  output: string,
  exe = getRsExtExePath(),
): string {
  return execSync([exe, "wget", url, output])
}

export async function wgetAsync(
  url: string,
  output: string,
  exe = getRsExtExePath(),
): Promise<string> {
  return await execAsync([exe, "wget", url, output])
}
