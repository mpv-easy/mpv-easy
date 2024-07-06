import { execAsync, execSync } from "../common"
import { getRsExtExePath } from "./share"

export function mkdir(dir: string, exe = getRsExtExePath()) {
  return execSync([exe, "fs", "mkdir", JSON.stringify(dir)])
}

export function mkdirAsync(dir: string, exe = getRsExtExePath()) {
  return execAsync([exe, "fs", "mkdir", JSON.stringify(dir)])
}
