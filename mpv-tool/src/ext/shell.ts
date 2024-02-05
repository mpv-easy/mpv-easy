import { text } from "stream/consumers"
import { execSync, getOs } from "../common"
import {
  commandNative,
  getScriptDir,
  joinPath,
  readFile,
  writeFile,
} from "../mpv"

export function readFileBase64() {}

export function execExtShellSync() {}

export function pwshExecCode(
  scriptPath: string,
  code: string,
  outputPath?: string,
  shell = "powershell",
): string {
  writeFile(scriptPath, code)
  let s = execSync([shell, scriptPath])
  if (outputPath) {
    s = readFile(outputPath)
  }
  return s
}

export function cmdExecString(cmd: string) {
  execSync(["cmd", cmd])
}
export function shellExecString(cmd: string) {
  execSync(["bash", cmd])
}
