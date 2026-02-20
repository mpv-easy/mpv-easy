import { execAsync, getOs } from "./common"
import { existsSync } from "./fs"
import { detectCmd } from "./ext"

export function detectCurl(): false | string {
  const os = getOs()
  if (os === "windows") {
    const system32Curl = "C:/Windows/System32/curl.exe"
    if (existsSync(system32Curl)) {
      return system32Curl
    }
  }

  return detectCmd("curl")
}

export async function download(url: string, outputPath: string, curl = "curl") {
  // FIXME: -L
  // curl: (35) schannel: next InitializeSecurityContext failed:
  // CRYPT_E_REVOCATION_OFFLINE (0x80092013)
  const cmd = [curl, "-k", "-o", outputPath, url]
  try {
    await execAsync(cmd)
    return true
  } catch (_e) {
    return false
  }
}
