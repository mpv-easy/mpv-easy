import { execAsync, execSync } from "../common"
import { detectExt } from "./share"

export function wget(url: string, output: string, exe = detectExt()): string {
  return execSync([exe, "wget", url, output])
}

export async function wgetAsync(
  url: string,
  output: string,
  exe = detectExt(),
): Promise<string> {
  return await execAsync([exe, "wget", url, output])
}
