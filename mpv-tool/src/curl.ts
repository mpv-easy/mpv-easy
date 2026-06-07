import { execAsync, getOs } from "./common"
import { existsSync } from "./fs"
import { detectCmd } from "./ext"

const COMMON_CURL_PATHS = [
  "C:/Windows/System32/curl.exe",
  "C:/Program Files/curl/bin/curl.exe",
  "/usr/bin/curl",
  "/usr/local/bin/curl",
  "/opt/homebrew/bin/curl",
  "/opt/local/bin/curl",
]

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
  if (CURL_PATH) return CURL_PATH

  for (const p of COMMON_CURL_PATHS) {
    print(`[detectCurl] checking common path: ${p}`, existsSync(p))
    if (existsSync(p)) {
      CURL_PATH = p
      return CURL_PATH
    }
  }

  return false
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
