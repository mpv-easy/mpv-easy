import { execAsync, execSync, getOs } from "../common"
import { existsSync } from "../fs"
import { readFile, writeFile } from "../mpv"

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
  execSync(["cmd", "/c", cmd])
}
export function shellExecString(cmd: string) {
  execSync(["sh", "-c", cmd])
}

export function detectCmd(cmdName: string): false | string {
  const _os = getOs()
  const cmd = `where ${cmdName}`
  try {
    const s = runCmdSync(cmd).stdout
    const p = s.trim().split("\n")[0]
    return existsSync(p) ? p : false
  } catch {
    return false
  }
}

export function runCmdSync(cmd: string): {
  ok: boolean
  stdout: string
  stderr: string
} {
  const os = getOs()
  const [sh, shArg] = os === "windows" ? ["cmd", "/c"] : ["sh", "-c"]
  try {
    const stdout = execSync([sh, shArg, cmd]).replaceAll("\r\n", "\n")
    return { ok: true, stdout, stderr: "" }
  } catch (e) {
    return { ok: false, stderr: String(e).replaceAll("\r\n", "\n"), stdout: "" }
  }
}

export async function runCmdAsync(cmd: string): Promise<{
  ok: boolean
  stdout: string
  stderr: string
}> {
  const os = getOs()
  const [sh, shArg] = os === "windows" ? ["cmd", "/c"] : ["sh", "-c"]
  try {
    const stdout = await execAsync([sh, shArg, cmd])
    return { ok: true, stdout, stderr: "" }
  } catch (e) {
    return { ok: false, stderr: String(e), stdout: "" }
  }
}
