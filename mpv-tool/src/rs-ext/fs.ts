import { execAsync, execSync } from "../common"
import { getRsExtExePath } from "./share"

export function mkdir(dir: string, exe = getRsExtExePath()) {
  return execSync([exe, "fs", "mkdir", JSON.stringify(dir)])
}

export function removeDir(dir: string, exe = getRsExtExePath()) {
  return execSync([exe, "fs", "remove_dir", JSON.stringify(dir)])
}
export function removeFile(dir: string, exe = getRsExtExePath()) {
  return execSync([exe, "fs", "remove_file", JSON.stringify(dir)])
}
export function removeDirAll(dir: string, exe = getRsExtExePath()) {
  return execSync([exe, "fs", "remove_dir_all", JSON.stringify(dir)])
}

export function mkdirAsync(dir: string, exe = getRsExtExePath()) {
  return execAsync([exe, "fs", "mkdir", JSON.stringify(dir)])
}
