import { getenv } from "./mpv"
import type { LogLevel } from "./type"

// ---------------------------------------------------------------------------
// Logger interface
// ---------------------------------------------------------------------------

export interface Logger {
  readonly namespace: string

  fatal(...args: unknown[]): void
  error(...args: unknown[]): void
  warn(...args: unknown[]): void
  info(...args: unknown[]): void
  verbose(...args: unknown[]): void
  debug(...args: unknown[]): void
  trace(...args: unknown[]): void

  /** Create a child logger: `log.child("sub")` → namespace `parent:sub` */
  child(name: string): Logger
}

// ---------------------------------------------------------------------------
// Level order (higher = more verbose)
// ---------------------------------------------------------------------------

const LEVEL: Record<LogLevel, number> = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  v: 4,
  debug: 5,
  trace: 6,
}

// ---------------------------------------------------------------------------
// Threshold — resolved once (env / level are not expected to change at runtime)
// ---------------------------------------------------------------------------

let _resolvedLevel: LogLevel | undefined

function readEnv(): LogLevel {
  if (_resolvedLevel) return _resolvedLevel
  try {
    const raw = getenv("LOG_LEVEL") ?? ""
    const v = raw.trim().toLowerCase()
    _resolvedLevel =
      v === "verbose" ? "v" : v in LEVEL ? (v as LogLevel) : "info"
  } catch {
    _resolvedLevel = "info"
  }
  return _resolvedLevel
}

// ---------------------------------------------------------------------------
// Message formatting
// ---------------------------------------------------------------------------

function formatArg(a: unknown): string {
  if (typeof a === "string") return a
  if (a instanceof Error) return a.stack ?? a.message
  try {
    return JSON.stringify(a)
  } catch {
    return String(a)
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createLogger(
  namespace: string,
  levelOverride?: LogLevel,
): Logger {
  const threshold = LEVEL[levelOverride ?? readEnv()]

  function emit(l: LogLevel, args: unknown[]): void {
    if (LEVEL[l] > threshold) return
    print(`[${namespace}] ${args.map(formatArg).join(" ")}`)
  }

  return {
    namespace,
    fatal: (...a) => emit("fatal", a),
    error: (...a) => emit("error", a),
    warn: (...a) => emit("warn", a),
    info: (...a) => emit("info", a),
    verbose: (...a) => emit("v", a),
    debug: (...a) => emit("debug", a),
    trace: (...a) => emit("trace", a),
    child: (name) => createLogger(`${namespace}:${name}`, levelOverride),
  }
}
