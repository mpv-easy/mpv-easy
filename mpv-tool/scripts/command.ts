// npm run command "<mpv>/player/command.c"

import fs from "node:fs"
import { camelCase } from "change-case"

const filePath = process.argv[2]
if (!filePath || !filePath.endsWith("command.c") || !fs.existsSync(filePath)) {
  // console.log(`npm run autogen "<mpv>/player/command.c"`)
  process.exit(0)
}
const commandCode = fs.readFileSync(filePath, "utf-8")

const outputPath = "./src/type-cmd.ts"

const mp_cmds_code = commandCode.match(
  /const struct mp_cmd_def mp_cmds\[\] = \{(.*?)};/s,
)![1]

type Type = {
  type: string
  def?: string
}
type Arg = {
  name: string
  type: Type
}
type Cmd = {
  name: string
  args: Arg[]
  ret?: string
  vararg?: boolean
}

function parseType(s: string): Type {
  // console.log("parseType", s)
  let type = "any"
  let def
  if (s.startsWith("OPT_BOOL")) {
    if (s.includes("OPTDEF_INT(0)")) {
      def = "false"
    }
    if (s.includes("OPTDEF_INT(1)")) {
      def = "true"
    }
    type = "boolean"
  } else if (s.startsWith("OPT_STRING")) {
    type = "string"
  } else if (s.startsWith("OPT_TIME")) {
    type = "number"
  } else if (s.startsWith("OPT_INT")) {
    type = "number"
  } else if (s.startsWith("OPT_DOUBLE")) {
    type = "number"
  } else if (s.startsWith("OPT_CHOICE")) {
    const flags = [...s.matchAll(/"(.*?)"/g)].map((i) => `"${i[1]}"`)
    type = flags.join("|")
    if (s.includes("M_RANGE")) {
      type += "| number"
    }
  } else if (s.startsWith("OPT_FLAGS")) {
    const flags = [...s.matchAll(/"(.*?)"/g)].map((i) => `"${i[1]}"`)
    type = `${flags.join("|")} | (string & {})`
  } else if (s.startsWith("OPT_KEYVALUELIST")) {
    type = "object"
  } else if (s.startsWith("OPT_BYTE_SIZE")) {
    type = "number"
  } else if (s.startsWith("OPT_CYCLEDIR")) {
    if (s.includes("OPTDEF_DOUBLE(1)")) {
      def = "true"
    }
    if (s.includes("OPTDEF_DOUBLE(0)")) {
      def = "false"
    }
    type = "boolean"
  }
  return { type, def }
}

function readPair(
  s: string,
  start: number,
  leftChar: string,
  rightChar: string,
): [left: number, right: number] | undefined {
  let p = start
  while (p + 1 < s.length && s[p] !== leftChar) {
    p++
  }
  if (p >= s.length) {
    return
  }
  let lv = 0
  let end = p + 1
  while (end < s.length) {
    if (s[end] === leftChar) {
      lv++
    } else if (s[end] === rightChar) {
      if (lv === 0) {
        return [p, end + 1]
      }
      lv--
    }
    end++
  }
  return
}

function parseArg(s: string): Arg | undefined {
  // console.log("parseArg", s)
  const name = s.match(/"(.*?)",/)?.[1]
  if (!name) {
    return
  }
  const typeStr = s.slice(s.indexOf(", ") + 2, -1).trim()
  const type = parseType(typeStr)
  return {
    name,
    type,
  }
}

function getMpFnRet(s: string, fnName: string): string | undefined {
  const i = s.indexOf(fnName)
  const pair = readPair(s, i, "{", "}")
  if (!pair) {
    return
  }
  const fnCode = s.slice(pair[0], pair[1])
  if (
    fnCode.includes("cmd->result") &&
    fnCode.includes(".format = MPV_FORMAT_STRING")
  ) {
    return "string"
  }
  return
}

function parseArgs(s: string): Arg[] {
  // console.log("parseArgs", s)
  let st = 1
  const argStrList: string[] = []
  while (st < s.length) {
    const pair = readPair(s, st, "{", "}")
    if (!pair) {
      break
    }
    const argStr = s.slice(pair[0], pair[1]).trim()
    if (argStr.length) {
      argStrList.push(argStr.trim())
    }
    st = pair[1] + 1
  }

  return argStrList.map((i) => parseArg(i)).filter((i) => !!i)
}

function parseCmd(s: string): Cmd | undefined {
  const name = s.match(/\{ "(.*?)",/)?.[1]
  const fnName = s.match(/, (.*?)[ |,]/)?.[1]
  if (!name || !fnName) {
    return undefined
  }
  const st = s.indexOf('",')
  const pair = readPair(s, st, "{", "}")
  if (!pair) {
    return { name, args: [] }
  }
  const argStr = s.slice(pair[0], pair[1]).trim()
  const args = argStr.length ? parseArgs(argStr) : []

  const ret = getMpFnRet(commandCode, fnName)
  const vararg = s.includes(".vararg = true")
  return {
    name,
    args,
    ret,
    vararg,
  }
}

function getCmdList(code: string): string[] {
  const list: string[] = []
  let st = 0
  while (st < code.length) {
    const pair = readPair(code, st, "{", "}")
    if (!pair) {
      break
    }
    const cmd = code.slice(pair[0], pair[1])
    if (cmd.trim().length) {
      list.push(cmd.trim())
    }
    st = pair[1] + 1
  }
  return list
}

function cmdToFn(cmd: Cmd): string {
  const name = camelCase(cmd.name)
  const arg = cmd.args.map((i, k) => {
    const { name, type } = i
    if (cmd.vararg && k === cmd.args.length - 1) {
      return `...${name}: ${type.type}[]`
    }
    return `${name}?: ${type.type}`
  })

  const s = arg.join(",")
  const { ret } = cmd
  const argStr = arg.length ? `...args: [${s}]` : ""
  if (!ret) {
    return `
export function ${name}(${argStr}): true | undefined {
  return mp.commandv("${cmd.name}"${arg.length ? ", ...args" : ""})
}
`.trim()
  }
  return `
export function ${name}(${argStr}): ${ret} {
  return mp.command_native<${ret}>(["${cmd.name}"${arg.length ? ", ...args]" : "]"})
}
`.trim()
}

const _test = `

    { "playlist-clear", cmd_playlist_clear },


`

const fnCode = getCmdList(mp_cmds_code)
  .map((i) => {
    const cmd = parseCmd(i)
    if (!cmd) {
      return
    }
    return cmdToFn(cmd)
  })
  .filter((i) => !!i)
  .join("\n\n")

// console.log(fnCode)
fs.writeFileSync(outputPath, fnCode)
