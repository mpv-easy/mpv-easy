import { execAsync, getOs } from "./common"
import { existsSync } from "./fs"
import { detectCmd } from "./ext"

let CURL_PATH: string | undefined | false
export function detectCurl(): false | string {
  if (CURL_PATH) return CURL_PATH
  const os = getOs()
  if (os === "windows") {
    CURL_PATH = "C:/Windows/System32/curl.exe"
    if (existsSync(CURL_PATH)) {
      return CURL_PATH
    }
  }
  CURL_PATH = detectCmd("curl")
  return CURL_PATH
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
