import { isFont } from "@mpv-easy/tool"
import { Script } from "./meta"
import { File } from "@easy-install/easy-archive"

export async function downloadBinary(url: string): Promise<Uint8Array> {
  const buf = await fetch(url).then((resp) => resp.arrayBuffer())
  return new Uint8Array(buf)
}
export async function downloadText(url: string): Promise<string> {
  return await fetch(url).then((resp) => resp.text())
}

export async function downloadJson<T>(url: string): Promise<T> {
  return (await fetch(url).then((resp) => resp.json())) as T
}

export function getFileNameFromUrl(url: string): string {
  return url.split("/").at(-1)!
}

export function getLang(url: string) {
  return url.split(".").at(-1)
}

function appendScriptConf(
  mpvConf: Uint8Array,
  scriptConf: Uint8Array,
  script: Script,
): Uint8Array {
  const decoder = new TextDecoder("utf-8")
  const mpvString = decoder.decode(mpvConf)
  const tab = "#".repeat(4)
  const banner = [tab, script.name, tab].join(" ")
  if (mpvString.includes(banner)) {
    return mpvConf
  }
  const scriptString = decoder.decode(scriptConf).trim()
  const resultString = [mpvString, "", banner, scriptString, banner, ""]
    .join("\n")
    .trimStart()
  const encoder = new TextEncoder()
  return encoder.encode(resultString)
}

export function installScript(
  mpvFiles: File[],
  scriptFiles: File[],
  script: Script,
  configDir = "portable_config",
) {
  // fonts, script-opts, shaders
  for (const dir of ["fonts", "script-opts", "shaders"]) {
    if (scriptFiles.find((i) => i.path.startsWith(`${dir}/`))) {
      const files = scriptFiles.filter((i) => i.path.startsWith(`${dir}/`))
      scriptFiles = scriptFiles.filter((i) => !i.path.startsWith(`${dir}/`))
      for (const i of files) {
        i.path = `${configDir}/${dir}/${i.path.replace(`${dir}/`, "")}`
        mpvFiles.push(i)
      }
    }
  }

  // scripts
  if (scriptFiles.find((i) => i.path.startsWith("scripts/"))) {
    const files = scriptFiles.filter((i) => i.path.startsWith("scripts/"))
    scriptFiles = scriptFiles.filter((i) => !i.path.startsWith("scripts/"))

    const pathList = files.map((i) => i.path.split("/"))
    const prefixList = files[0].path.split("/").slice(0, 2)
    if (
      prefixList.length === 2 &&
      pathList.every(
        (i) =>
          i.length >= 3 &&
          // scripts
          i[0] === prefixList[0] &&
          // uosc
          i[1] === prefixList[1],
      )
    ) {
    } else {
      prefixList.pop()
    }

    // rename to main
    const luaFiles = files.filter(
      (i) =>
        !i.path.replace(`${prefixList.join("/")}/`, "").includes("/") &&
        i.path.endsWith(".lua"),
    )
    const jsFiles = files.filter(
      (i) =>
        !i.path.replace(`${prefixList.join("/")}/`, "").includes("/") &&
        i.path.endsWith(".js"),
    )
    if (luaFiles.length === 1) {
      luaFiles[0].path = `${script.scriptName || script.name}/main.lua`
    } else if (jsFiles.length === 1) {
      jsFiles[0].path = `${script.scriptName || script.name}/main.js`
    }
    for (const i of files) {
      i.path = `${configDir}/scripts/${i.path.replace(`${prefixList.join("/")}/`, `${script.scriptName || script.name}/`)}`
      mpvFiles.push(i)
    }
  }

  // externals
  if (scriptFiles.find((i) => i.path.startsWith("externals/"))) {
    const files = scriptFiles.filter((i) => i.path.startsWith("externals/"))
    scriptFiles = scriptFiles.filter((i) => !i.path.startsWith("externals/"))
    for (const i of files) {
      i.path = i.path.replace("externals/", "")
      mpvFiles.push(i)
    }
  }

  // input.conf and mpv.conf
  for (const name of ["input.conf", "mpv.conf"]) {
    const scriptConfIndex = scriptFiles.findIndex((i) => i.path === name)
    if (scriptConfIndex === -1) {
      continue
    }
    const scriptConf = scriptFiles.splice(scriptConfIndex, 1)[0]

    const fileIndex = mpvFiles.findIndex(
      (i) => i.path === `${configDir}/${name}`,
    )
    let file: File
    if (fileIndex === -1) {
      file = new File(
        `${configDir}/${name}`,
        new Uint8Array(),
        undefined,
        false,
        BigInt(+new Date()),
      )
    } else {
      file = mpvFiles.splice(fileIndex, 1)[0]
    }

    const { path, mode, isDir, lastModified, buffer } = file
    const newBuffer = appendScriptConf(buffer, scriptConf.buffer, script)
    mpvFiles.push(new File(path, newBuffer, mode, isDir, lastModified))
  }

  // conf
  if (
    scriptFiles.find((i) => !i.path.includes("/") && i.path.endsWith(".conf"))
  ) {
    const files = scriptFiles.filter(
      (i) => !i.path.includes("/") && i.path.endsWith(".conf"),
    )
    scriptFiles = scriptFiles.filter(
      (i) => !(!i.path.includes("/") && i.path.endsWith(".conf")),
    )
    for (const i of files) {
      i.path = `${configDir}/script-opts/${i.path}`
      mpvFiles.push(i)
    }
  }

  // font file
  if (scriptFiles.find((i) => !i.path.includes("/") && isFont(i.path))) {
    const files = scriptFiles.filter(
      (i) => !i.path.includes("/") && isFont(i.path),
    )
    scriptFiles = scriptFiles.filter(
      (i) => !(!i.path.includes("/") && isFont(i.path)),
    )
    for (const i of files) {
      i.path = `${configDir}/fonts/${i.path}`
      mpvFiles.push(i)
    }
  }

  // rename to main
  const luaFiles = scriptFiles.filter(
    (i) => !i.path.includes("/") && i.path.endsWith(".lua"),
  )
  const jsFiles = scriptFiles.filter(
    (i) => !i.path.includes("/") && i.path.endsWith(".js"),
  )
  if (luaFiles.length === 1) {
    luaFiles[0].path = "main.lua"
  } else if (jsFiles.length === 1) {
    jsFiles[0].path = "main.js"
  }

  for (const i of scriptFiles) {
    i.path = `${configDir}/scripts/${script.scriptName || script.name}/${i.path}`
    mpvFiles.push(i)
  }
}
// Builtin scripts that conflict with each other
export const ConflictMap: Record<string, string[]> = {
  "thumbfast": ["mpv-easy-thumbfast"],
  "autoload": ["mpv-easy-autoload"],
  "uosc": ["mpv-easy", "ModernX cyl0", "ModernZ", "mpv.net"],
}

export function checkConflict(packages: string[], conflictMap = ConflictMap): string[] {
  const conflictSet = new Set<string>();
  const packageSet = new Set(packages);

  for (const pkg of packages) {
    const conflicts = conflictMap[pkg] || [];
    for (const conflict of conflicts) {
      if (packageSet.has(conflict)) {
        conflictSet.add(pkg);
        conflictSet.add(conflict);
      }
    }
  }

  return Array.from(conflictSet);
}