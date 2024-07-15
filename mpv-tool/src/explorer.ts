import { execAsync, getOs } from "./common"
import { windowsPath } from "./path"

function openExplorerWindows(path: string) {
  execAsync([
    "powershell",
    "-c",
    `Start-Process explorer.exe "/select,${windowsPath(path)}"`,
  ])
}

export function openExplorer(path: string) {
  switch (getOs()) {
    case "windows": {
      openExplorerWindows(path)
      break
    }
  }
}
