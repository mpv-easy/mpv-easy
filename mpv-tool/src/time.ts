export type TimeFormat = "s" | "m:s" | "h:m:s"

export function getTimeFormat(s: number): TimeFormat {
  s |= 0
  if (s < 60) return "s"
  if (s < 3600) return "m:s"
  return "h:m:s"
}

export function formatTime(s: number, format: TimeFormat): string {
  s |= 0

  switch (format) {
    case "s": {
      return s.toString()
    }
    case "m:s": {
      const min = (s / 60) | 0
      const minuteStr = min.toString().padStart(2, "0")
      const secStr = (s - min * 60).toString().padStart(2, "0")
      return `${minuteStr}:${secStr}`
    }
    case "h:m:s": {
      const hour = (s / 3600) | 0
      const hourStr = hour.toString().padStart(2, "0")
      const minute = ((s - hour * 3600) / 60) | 0
      const minuteStr = minute.toString().padStart(2, "0")
      const secStr = (s - hour * 3600 - minute * 60).toString().padStart(2, "0")
      return `${hourStr}:${minuteStr}:${secStr}`
    }
    default: {
      throw new Error(`formatTime error: second ${s} format ${format}`)
    }
  }
}
