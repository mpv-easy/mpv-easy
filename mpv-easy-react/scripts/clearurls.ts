import "@mpv-easy/polyfill"
import { registerEvent } from "@mpv-easy/tool"
import { clearurls } from "@mpv-easy/clearurls"
registerEvent("file-loaded", clearurls)
