import React, { useRef, useState } from "react"

export type SpringInput = number
export type SpringState = "init" | "start" | "stop" | "play" | "pause"
export type SpringConfig = {
  duration: number
  fps: number
}

export const defaultSpringConfig: SpringConfig = {
  duration: 1000,
  fps: 60,
}

export function useSpring(
  from: SpringInput,
  to: SpringInput,
  config: SpringConfig = defaultSpringConfig,
) {
  const { fps, duration } = {
    ...defaultSpringConfig,
    ...config,
  }

  const [value, setValue] = useState(from)
  const [playing, setPlaying] = useState(false)

  const handleRef = useRef(0)

  const restart = () => {
    stop()
    setValue(from)
    start()
  }

  const stop = () => {
    clearInterval(handleRef.current)
    setValue(from)
    setPlaying(false)
    handleRef.current = 0
  }

  const start = () => {
    if (handleRef.current) {
      return
    }
    const startTime = Date.now()
    setPlaying(true)
    handleRef.current = +setInterval(() => {
      const now = Date.now()
      const percent = (now - startTime) / duration
      const newValue = percent >= 1 ? to : percent * (to - from) + from
      setValue(newValue)
      if (percent >= 1) {
        clearInterval(handleRef.current)
        setPlaying(false)
      }
    }, 16)
  }

  return {
    value,
    playing,
    restart,
    stop,
    start,
  }
}
