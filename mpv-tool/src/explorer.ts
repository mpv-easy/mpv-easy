import { execAsync, getOs } from "./common"
import { windowsPath } from "./path"

function openExplorerWindows(path: string) {
  const winPath = windowsPath(path).replaceAll("'", "\\'")
  const cmd = [
    "powershell",
    "-c",
    `Start-Process explorer.exe '/select,${winPath}'`,
  ]
  execAsync(cmd)
}

export function openExplorer(path: string) {
  switch (getOs()) {
    case "windows": {
      openExplorerWindows(path)
      break
    }
  }
}
