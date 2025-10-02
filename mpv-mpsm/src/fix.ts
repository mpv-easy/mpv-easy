import { decode, Fmt, File } from "@easy-install/easy-archive"
import { downloadBinaryFromGithub, type Script } from "./index"
import { commonPrefix } from "./tool"

export async function getScriptFiles(url: string, script: Script) {
  if (url.endsWith(".py")) {
    return []
  }
  const bin = await downloadBinaryFromGithub(url)
  if (!bin) {
    return []
  }
  const uint8Array = new TextEncoder().encode(JSON.stringify(script))
  if (url.endsWith(".zip")) {
    let scriptFiles = decode(Fmt.Zip, bin)
    if (!scriptFiles?.length) {
      return []
    }

    if (url.endsWith("master.zip") || url.endsWith("main.zip")) {
      // remove repo prefix
      scriptFiles = scriptFiles.map(
        ({ path, mode, isDir, lastModified, buffer }) =>
          new File(
            path.split("/").slice(1).join("/"),
            buffer,
            mode,
            isDir,
            lastModified,
          ),
      )
      // TODO: remove .github?
    }

    // script.json
    if (!scriptFiles.find((i) => i.path === "script.json")) {
      scriptFiles.push(
        new File(
          "script.json",
          uint8Array,
          undefined,
          false,
          BigInt(Date.now()),
        ),
      )
    }

    return scriptFiles
  }
  if (url.endsWith(".js") || url.endsWith(".lua")) {
    const name = `${script.name}.${url.split(".").at(-1)!}`
    return [
      new File("script.json", uint8Array, undefined, false, BigInt(Date.now())),
      new File(name, bin, undefined, false, BigInt(Date.now())),
    ]
  }

  return []
}
function isFont(url: string) {
  const fontExtensions: string[] = [".ttf", ".otf", ".woff", ".woff2", ".eot"]
  const lowerUrl: string = url.toLowerCase()
  return fontExtensions.some((ext) => lowerUrl.endsWith(ext))
}

function removeCommonPrefix(scriptFiles: File[]) {
  const dirList = scriptFiles
    .map((i) => i.path.split("/"))
    .map((i) => i.slice(0, i.length - 1))

  const commonPrefixIndex = commonPrefix(dirList)
  if (commonPrefixIndex && dirList.length) {
    const commonPrefixList = dirList[0].slice(0, commonPrefixIndex)
    const commonPrefixString = `${commonPrefixList.join("/")}/`
    for (const i of scriptFiles) {
      i.path = i.path.replace(commonPrefixString, "")
    }
  }
  return scriptFiles
}

export function tryFix(scriptFiles: File[], script: Script): File[] {
  removeCommonPrefix(scriptFiles)

  const fixFiles: File[] = []
  // remove .github docs
  for (const dir of [".github", "docs"]) {
    if (scriptFiles.find((i) => i.path.startsWith(`${dir}/`))) {
      scriptFiles = scriptFiles.filter((i) => !i.path.startsWith(`${dir}/`))
    }
  }

  // fonts, script-opts, shaders
  for (const dir of ["fonts", "script-opts", "shaders"]) {
    if (scriptFiles.find((i) => i.path.startsWith(`${dir}/`))) {
      const files = scriptFiles.filter((i) => i.path.startsWith(`${dir}/`))
      scriptFiles = scriptFiles.filter((i) => !i.path.startsWith(`${dir}/`))
      for (const i of files) {
        fixFiles.push(i)
      }
    }
  }

  // scripts
  if (scriptFiles.find((i) => i.path.startsWith("scripts/"))) {
    const files = scriptFiles.filter((i) => i.path.startsWith("scripts/"))
    scriptFiles = scriptFiles.filter((i) => !i.path.startsWith("scripts/"))

    const dirList = files
      .map((i) => i.path.split("/"))
      .map((i) => i.slice(1, i.length - 1))
    const commonPrefixIndex = commonPrefix(dirList)
    const commonPrefixList = commonPrefixIndex
      ? ["scripts", ...dirList[0].slice(0, commonPrefixIndex)]
      : ["scripts"]
    const commonPrefixString = `${commonPrefixList.join("/")}/`

    // rename to main
    const luaFiles = files.filter(
      (i) =>
        !i.path.replace(commonPrefixString, "").includes("/") &&
        i.path.endsWith(".lua"),
    )
    const jsFiles = files.filter(
      (i) =>
        !i.path.replace(commonPrefixString, "").includes("/") &&
        i.path.endsWith(".js"),
    )
    if (luaFiles.length === 1) {
      luaFiles[0].path = "scripts/main.lua"
    } else if (jsFiles.length === 1) {
      jsFiles[0].path = "scripts/main.js"
    }

    for (const i of files) {
      const s = i.path.replace(commonPrefixString, `scripts/`)
      i.path = s
      fixFiles.push(i)
    }
  }

  // externals
  if (scriptFiles.find((i) => i.path.startsWith("externals/"))) {
    const files = scriptFiles.filter((i) => i.path.startsWith("externals/"))
    scriptFiles = scriptFiles.filter((i) => !i.path.startsWith("externals/"))
    for (const i of files) {
      fixFiles.push(i)
    }
  }

  // input.conf and mpv.conf
  for (const name of ["input.conf", "mpv.conf"]) {
    const scriptConfIndex = scriptFiles.findIndex((i) => i.path === name)
    if (scriptConfIndex === -1) {
      continue
    }
    const scriptConf = scriptFiles.splice(scriptConfIndex, 1)[0]
    fixFiles.push(scriptConf)
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
      i.path = `script-opts/${i.path}`
      fixFiles.push(i)
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
      i.path = `fonts/${i.path}`
      fixFiles.push(i)
    }
  }

  if (
    !scriptFiles.find(
      (i) => i.path === "scripts/main.lua" || i.path === "scripts/main.js",
    )
  ) {
    // rename to main
    const luaFiles = scriptFiles.filter(
      (i) => !i.path.includes("/") && i.path.endsWith(".lua"),
    )
    const jsFiles = scriptFiles.filter(
      (i) => !i.path.includes("/") && i.path.endsWith(".js"),
    )

    if (luaFiles.length === 1) {
      const index = scriptFiles.indexOf(luaFiles[0])
      scriptFiles.splice(index, 1)
      luaFiles[0].path = "scripts/main.lua"
      fixFiles.push(luaFiles[0])
    } else if (jsFiles.length === 1) {
      const index = scriptFiles.indexOf(jsFiles[0])
      scriptFiles.splice(index, 1)
      jsFiles[0].path = "scripts/main.js"
      fixFiles.push(jsFiles[0])
    }
  }

  // ignore
  // script.json LICENSE README.md LICENSE.txt *.md .eslintignore .eslintrc .gitignore  .flake8  .gitattributes README.org README.md README.txt
  const codeFiles = scriptFiles.filter(
    (i) => i.path.endsWith(".js") || i.path.endsWith(".lua"),
  )
  if (codeFiles.length) {
    console.log(
      "tryfix maybe failed",
      script,
      scriptFiles.map((i) => i.path).join(" "),
    )
  }

  for (const i of scriptFiles) {
    fixFiles.push(i)
  }
  return fixFiles
}
