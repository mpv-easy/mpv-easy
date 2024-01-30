import { getOs, execSync } from "../common"
import { pwshExecCode, shellExecString } from "./shell"

export function mkdir(dir: string) {
  switch (getOs()) {
    case "windows": {
      execSync([
        "powershell",
        "-c",
        `New-Item -ItemType Directory -Path '${dir}'`,
      ])
      break
    }
    default: {
      shellExecString(`mkdir ${dir}`)
    }
  }
}
