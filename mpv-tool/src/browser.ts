import { execAsync, getOs } from "./common"

function openBrowserWindows(url: string) {
  execAsync(["powershell", "-c", `Start-Process ${url}`])
}

export function openBrowser(url: string) {
  switch (getOs()) {
    case "windows": {
      openBrowserWindows(url)
      break
    }
  }
}
