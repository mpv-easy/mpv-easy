import { definePlugin } from "@mpv-easy/plugin"
import {
  commandv,
  getProperty,
  registerEvent,
  unregisterEvent,
} from "@mpv-easy/tool"
import { Rule } from "./type"
import { Bilibili, Youtube, Twitter, Default } from "./rules"

export const pluginName = "@mpv-easy/clearurls"

// ---------------------------------------------------------------------------
// Rule registry — add new site rules here, default rule goes last
// ---------------------------------------------------------------------------

const Rules: Rule[] = [Bilibili, Youtube, Twitter]
const DefaultRule: Rule = Default

export function clearurls() {
  const path = getProperty("path")
  if (!path || !/^https?:\/\//i.test(path)) return

  // Try site-specific rules first
  const rule = Rules.find((r) => r.match(path))
  if (rule) {
    const cleaned = rule.clean(path)
    if (cleaned && cleaned !== path) {
      print(`[ClearURLs] [${rule.name}] Original : ${path}`)
      print(`[ClearURLs] [${rule.name}] Cleaned  : ${cleaned}`)
      commandv("loadfile", cleaned, "replace")
    } else {
      print(`[ClearURLs] [${rule.name}] No tracking params found`)
    }
    return
  }

  // Fallback to default rule
  const cleaned = DefaultRule.clean(path)
  if (cleaned && cleaned !== path) {
    print(`[ClearURLs] [${DefaultRule.name}] Original : ${path}`)
    print(`[ClearURLs] [${DefaultRule.name}] Cleaned  : ${cleaned}`)
    commandv("loadfile", cleaned, "replace")
  } else {
    print("[ClearURLs] No tracking params found")
  }
}

export default definePlugin((_context, _api) => ({
  name: pluginName,
  create: () => {
    registerEvent("file-loaded", clearurls)
    print("[ClearURLs] on")
  },
  destroy: () => {
    unregisterEvent(clearurls)
    print("[ClearURLs] off")
  },
}))
