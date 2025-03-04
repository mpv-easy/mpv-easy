// Some functions that corejs does not support or cannot run in mujs
import "./polyfill"
// Must first polyfill corejs and other basic functions
import "./corejs"
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import { Buffer } from "buffer"
import { patch } from "./tool"

patch({ Buffer, performance: { now: () => Date.now() } })
