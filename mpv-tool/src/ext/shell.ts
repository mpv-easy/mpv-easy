import { execAsync, execSync, getOs } from "../common"
import { existsSync } from "../fs"
import { debug, readFile, writeFile } from "../mpv"

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

const _cmdCache: Record<string, false | string> = {}

export function detectCmd(cmdName: string): false | string {
  if (typeof _cmdCache[cmdName] !== "undefined") {
    return _cmdCache[cmdName]
  }

  const probes = [
    `where ${cmdName}`,
    `which ${cmdName}`,
    `command -v ${cmdName}`,
  ]

  for (const probe of probes) {
    try {
      const s = runCmdSync(probe).stdout
      if (!s) continue
      const p = s.trim().split("\n")[0]
      if (p && existsSync(p)) {
        _cmdCache[cmdName] = p
        return p
      }
    } catch (e) {
      debug(`[detectCmd](${cmdName}) probe '${probe}' error: ${e}`)
    }
  }

  _cmdCache[cmdName] = false
  return false
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
    debug(`[runCmdSync] ${cmd} failed: ${e}`)
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
    debug(`[runCmdAsync] ${cmd} failed: ${e}`)
    return { ok: false, stderr: String(e), stdout: "" }
  }
}
