import { text } from "node:stream/consumers"
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

export function detectCmd(cmdName: string): boolean {
  const os = getOs()
  const [sh, shArg] = os === "windows" ? ["cmd", "/c"] : ["sh", "-c"]
  try {
    const s = execSync([sh, shArg, `where ${cmdName}`])
    return s.length > 0
  } catch {
    return false
  }
}
