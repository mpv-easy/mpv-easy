import { execSync } from "../common"
import { getRsExtExePath } from "./share"

export function mkdir(dir: string, exe = getRsExtExePath()) {
  execSync([exe, "fs", "mkdir", JSON.stringify(dir)])
}
