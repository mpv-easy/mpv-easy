import { execAsync, execSync, getOs } from "../common"
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

export function detectCmd(cmdName: string): boolean {
  const os = getOs()
  const cmd = os === "windows" ? `get-command ${cmdName}` : `where ${cmdName}`
  try {
    const s = runCmdSync(cmd)
    return s.stdout.length > 0 && s.ok === true
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
  const [sh, shArg] = os === "windows" ? ["powershell", "-c"] : ["sh", "-c"]
  try {
    const stdout = execSync([sh, shArg, cmd])
    return { ok: true, stdout, stderr: "" }
  } catch (e) {
    return { ok: false, stderr: String(e), stdout: "" }
  }
}

export async function runCmdAsync(cmd: string): Promise<{
  ok: boolean
  stdout: string
  stderr: string
}> {
  const os = getOs()
  const [sh, shArg] = os === "windows" ? ["powershell", "-c"] : ["sh", "-c"]
  try {
    const stdout = await execAsync([sh, shArg, cmd])
    return { ok: true, stdout, stderr: "" }
  } catch (e) {
    return { ok: false, stderr: String(e), stdout: "" }
  }
}
