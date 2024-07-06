import { getOs, execSync } from "./common"
import { error, fileInfo, getPropertyBool, setPropertyBool } from "./mpv"

export function existsSync(path: string): boolean {
  return !!fileInfo(path)
}

export function isDir(path: string): boolean {
  return !!fileInfo(path)?.is_dir
}

export function dir(path: string | undefined): string | undefined {
  if (!path?.length) {
    return undefined
  }

  const d = path.split("/").slice(0, -1).join("/")
  if (isDir(d)) {
    return d
  }
  return undefined
}

export function openDialog(): string[] {
  try {
    switch (getOs()) {
      case "windows": {
        const onTop = getPropertyBool("ontop")
        if (onTop) {
          setPropertyBool("ontop", false)
        }

        const s = execSync([
          "powershell",
          "-NoProfile",
          "-Command",
          `
Trap {
  Write-Error -ErrorRecord $_
  Exit 1
}

Add-Type -AssemblyName PresentationFramework

$u8 = [System.Text.Encoding]::UTF8
$out = [Console]::OpenStandardOutput()

$ofd = New-Object -TypeName Microsoft.Win32.OpenFileDialog
$ofd.Multiselect = $true

If ($ofd.ShowDialog() -eq $true) {
  ForEach ($filename in $ofd.FileNames) {
    $u8filename = $u8.GetBytes("$filename\`n")
    $out.Write($u8filename, 0, $u8filename.Length)
  }
}
`,
        ])
        if (onTop) {
          setPropertyBool("ontop", true)
        }
        const list = s
          .trim()
          .split("\n")
          .map((i) => i.trim())
          .filter((i) => existsSync(i))
        return list
      }
      default: {
        return []
      }
    }
  } catch (e) {
    error(`openDialog error: ${e}`)
  }
  return []
}
