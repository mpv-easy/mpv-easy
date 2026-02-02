import "@mpv-easy/polyfill"
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react"
import {
  getOptions,
  registerScriptMessage,
  showNotification,
  type Chapter,
  setPropertyNumber,
  setPropertyBool,
  getPropertyNative,
  setPropertyNative,
  command,
  observeProperty,
} from "@mpv-easy/tool"
import { Button, render, useProperty, usePropertyNumber } from "@mpv-easy/react"

// Default configuration
const defaultConfig = {
  bottom: 50,
  right: 50,
  mouse: true,
  eventName: "notify-skip",
  duration: 3000,
  fontSize: 16,
  borderSize: 2,
  skipCategories: "opening;ending;preview;recap",
  introTimeWindow: 200,
  outroTimeWindow: 300,
  minSkipDuration: 10,
  autoSkip: false,
  // Silence detection mode (fallback when no chapters)
  silenceMode: false,
  silenceDetectArgs: "n=-45dB:d=0.7",
  blackDetectArgs: "d=0.1:pic_th=0.98",
  skipSpeed: 100,
  // Colors in BGRA format (FF=transparent, 00=opaque)
  // Black/White/Yellow scheme
  backgroundColor: "000000C0", // Black semi-transparent
  backgroundColorHover: "00FFFF40", // Yellow semi-transparent
  color: "FFFFFF00", // White opaque
  colorHover: "00000000", // Black opaque
  borderColor: "00000080", // Black semi-transparent
  // Chapter patterns
  openingPatterns:
    "^OP$|^OP[0-9]+$|^Opening|Opening$|^Intro|Intro$|^Introduction$|^Theme Song$|^Main Theme$|^Title Sequence$|^Cold Open$|^Teaser$",
  endingPatterns:
    "^ED$|^ED[0-9]+$|^Ending|Ending$|^Outro|Outro$|^End Credits$|^Credits$|^Closing|Closing$|^Epilogue$|^End Theme$|^Closing Theme$",
  previewPatterns:
    "Preview|Next Episode|^Next Time|^Coming Up|^Next Week|^Trailer$",
  recapPatterns:
    "^Recap$|^Previously|Previously$|^Last Time|Last Time$|^Summary$|^Story So Far$",
}

// Merge with user options
const config = {
  ...defaultConfig,
  ...getOptions("notify_skip", {
    bottom: { type: "number" },
    right: { type: "number" },
    mouse: { type: "boolean" },
    eventName: { type: "string", key: "event-name" },
    duration: { type: "number" },
    fontSize: { type: "number", key: "font-size" },
    borderSize: { type: "number", key: "border-size" },
    skipCategories: { type: "string", key: "skip-categories" },
    introTimeWindow: { type: "number", key: "intro-time-window" },
    outroTimeWindow: { type: "number", key: "outro-time-window" },
    minSkipDuration: { type: "number", key: "min-skip-duration" },
    autoSkip: { type: "boolean", key: "auto-skip" },
    silenceMode: { type: "boolean", key: "silence-mode" },
    silenceDetectArgs: { type: "string", key: "silence-detect-args" },
    blackDetectArgs: { type: "string", key: "black-detect-args" },
    skipSpeed: { type: "number", key: "skip-speed" },
    backgroundColor: { type: "color", key: "background-color" },
    backgroundColorHover: { type: "color", key: "background-color-hover" },
    color: { type: "color" },
    colorHover: { type: "color", key: "color-hover" },
    borderColor: { type: "color", key: "border-color" },
    openingPatterns: { type: "string", key: "opening-patterns" },
    endingPatterns: { type: "string", key: "ending-patterns" },
    previewPatterns: { type: "string", key: "preview-patterns" },
    recapPatterns: { type: "string", key: "recap-patterns" },
  }),
}

interface SkippableChapter {
  index: number
  time: number
  title: string
  category: string
  duration: number
}

type SkipMode = "none" | "chapter" | "silence"

// Pattern matching for chapter categories
function matchesChapterPattern(
  title: string | undefined,
  category: string,
): boolean {
  if (!title) return false

  let patternString = ""
  switch (category) {
    case "opening":
      patternString = config.openingPatterns
      break
    case "ending":
      patternString = config.endingPatterns
      break
    case "preview":
      patternString = config.previewPatterns
      break
    case "recap":
      patternString = config.recapPatterns
      break
  }

  if (!patternString) return false
  return new RegExp(patternString, "i").test(title)
}

// Calculate chapter duration
function calculateChapterDuration(
  chapters: Chapter[],
  index: number,
  videoDuration: number,
): number {
  if (index < chapters.length - 1) {
    return chapters[index + 1].time - chapters[index].time
  }
  return videoDuration - chapters[index].time
}

// Filter management utilities
function initFilter(
  property: string,
  label: string,
  name: string,
  graph: string,
) {
  const filters = (getPropertyNative(property) as any[]) || []
  const exists = filters.some((f: any) => f.label === label)
  if (!exists) {
    const filterString = `@${label}:${name}=[${graph}]`
    command(`${property} add ${filterString}`)
  }
}

function setFilterState(property: string, label: string, enabled: boolean) {
  const filters = (getPropertyNative(property) as any[]) || []
  for (let i = filters.length - 1; i >= 0; i--) {
    if (filters[i].label === label) {
      if (filters[i].enabled !== enabled) {
        filters[i].enabled = enabled
        setPropertyNative(property, filters)
      }
      return
    }
  }
}

// Hook: Find skippable chapters
function useSkippableChapters(chapters: Chapter[], videoDuration: number) {
  return useMemo(() => {
    if (!chapters?.length) return []

    const _found: SkippableChapter[] = []
    const categories = config.skipCategories.split(";")
    const titledMatches: SkippableChapter[] = []
    const positionalMatches: SkippableChapter[] = []

    chapters.forEach((chapter, i) => {
      const chapDuration = calculateChapterDuration(chapters, i, videoDuration)
      if (chapDuration <= 0 || chapDuration > config.introTimeWindow) return

      let matchedCategory = ""
      let isTitled = false

      // Check titled matches first (priority)
      for (const cat of categories) {
        if (matchesChapterPattern(chapter.title, cat)) {
          matchedCategory = cat
          isTitled = true
          break
        }
      }

      // Positional fallbacks
      if (!matchedCategory) {
        if (i <= 1 && chapter.time < config.introTimeWindow) {
          if (categories.includes("opening")) {
            matchedCategory = "opening"
          }
        } else if (i >= chapters.length - 2) {
          if (categories.includes("ending")) {
            matchedCategory = "ending"
          }
        }
      }

      if (matchedCategory) {
        const skipChapter: SkippableChapter = {
          index: i,
          time: chapter.time,
          title: chapter.title || `Chapter ${i + 1}`,
          category: matchedCategory,
          duration: chapDuration,
        }

        if (isTitled) {
          titledMatches.push(skipChapter)
        } else {
          positionalMatches.push(skipChapter)
        }
      }
    })

    // Prioritize titled chapters over positional ones
    return titledMatches.length > 0 ? titledMatches : positionalMatches
  }, [chapters, videoDuration])
}

// Hook: Skip suppression state (prevents repeated notifications)
function useSkipSuppression(duration = 5000) {
  const [suppressed, setSuppressed] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startSuppression = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    setSuppressed(true)
    timerRef.current = setTimeout(() => {
      setSuppressed(false)
      timerRef.current = null
    }, duration)
  }, [duration])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return { suppressed, startSuppression }
}

// Hook: Intro skipped tracking
function useIntroSkippedState() {
  const [introSkipped, setIntroSkipped] = useState(false)
  const [timePos] = usePropertyNumber("time-pos", 0)
  const introThreshold = 60

  // Reset intro skipped if user seeks back
  useEffect(() => {
    if (introSkipped && timePos < introThreshold) {
      setIntroSkipped(false)
    }
  }, [timePos, introSkipped])

  return { introSkipped, setIntroSkipped }
}

// Hook: Silence skip mode
function useSilenceSkip(
  enabled: boolean,
  videoDuration: number,
  introSkipped: boolean,
  setIntroSkipped: (v: boolean) => void,
) {
  const [silenceActive, setSilenceActive] = useState(false)
  const [skipStartTime, setSkipStartTime] = useState(0)
  const [buttonMessage, setButtonMessage] = useState("")
  const observerActiveRef = useRef(false)

  // Initialize filters when enabled
  useEffect(() => {
    if (!enabled) return

    // Initialize detection filters
    initFilter(
      "af",
      "silencedetect_skip",
      "lavfi",
      `silencedetect=${config.silenceDetectArgs}`,
    )
    initFilter(
      "vf",
      "blackdetect_skip",
      "lavfi",
      `blackdetect=${config.blackDetectArgs}`,
    )

    // Disable by default
    setFilterState("af", "silencedetect_skip", false)
    setFilterState("vf", "blackdetect_skip", false)
  }, [enabled])

  const startSilenceSkip = useCallback(() => {
    if (silenceActive) return

    const currentTime = (getPropertyNative("time-pos") as number) || 0
    setSkipStartTime(currentTime)
    setSilenceActive(true)

    // Enable skip detection filters
    setFilterState("af", "silencedetect_skip", true)
    setFilterState("vf", "blackdetect_skip", true)

    // Set playback for fast skip
    setPropertyBool("pause", false)
    setPropertyBool("mute", true)
    setPropertyNumber("speed", config.skipSpeed)

    setButtonMessage("▷▷ Fast Forward")

    // Set up observers for silence/black detection
    const handleMetadata = (_name: string, value: string) => {
      if (!value || value === "{}") return

      // Check for silence_start or black_end
      if (value.includes("silence_start") || value.includes("black_end")) {
        const match = value.match(
          /"lavfi\.(silence_start|black_end)":"([^"]+)"/,
        )
        if (match) {
          const detectedTime = parseFloat(match[2])
          const duration = detectedTime - skipStartTime

          if (duration >= config.minSkipDuration) {
            // Stop and seek to detected position
            stopSilenceSkip(detectedTime)
          }
        }
      }
    }

    observeProperty("af-metadata/silencedetect_skip", "string", handleMetadata)
    observerActiveRef.current = true
  }, [silenceActive, skipStartTime])

  const stopSilenceSkip = useCallback(
    (seekTime?: number) => {
      if (!silenceActive) return

      const endTime =
        seekTime ?? ((getPropertyNative("time-pos") as number) || 0)
      const duration = endTime - skipStartTime

      // Track if this was a substantial intro skip
      if (duration > 60 && skipStartTime < config.introTimeWindow) {
        setIntroSkipped(true)
      }

      setSilenceActive(false)

      // Disable filters
      setFilterState("af", "silencedetect_skip", false)
      setFilterState("vf", "blackdetect_skip", false)

      // Restore playback settings
      setPropertyBool("mute", false)
      setPropertyNumber("speed", 1)

      // Seek to detected position
      if (seekTime !== undefined) {
        setPropertyNumber("time-pos", seekTime)
        showNotification(`Skipped ${Math.round(duration)}s`)
      }

      setButtonMessage("")

      // Mark observer as inactive
      observerActiveRef.current = false
    },
    [silenceActive, skipStartTime, setIntroSkipped],
  )

  const cancelSilenceSkip = useCallback(() => {
    if (!silenceActive) return

    // Restore position and stop
    setPropertyNumber("time-pos", skipStartTime)
    stopSilenceSkip()
    showNotification("Skip Cancelled")
  }, [silenceActive, skipStartTime, stopSilenceSkip])

  // Check if we should show notification in intro/outro window
  const checkTimeWindow = useCallback(
    (currentTime: number) => {
      if (!enabled) return false
      if (introSkipped && currentTime < config.introTimeWindow) return false

      const inIntro = currentTime <= config.introTimeWindow
      const inOutro =
        videoDuration > 0 &&
        currentTime >= videoDuration - config.outroTimeWindow

      return inIntro || inOutro
    },
    [enabled, videoDuration, introSkipped],
  )

  return {
    silenceActive,
    buttonMessage,
    startSilenceSkip,
    stopSilenceSkip,
    cancelSilenceSkip,
    checkTimeWindow,
  }
}

function App() {
  const [chapters] = useProperty("chapter-list", [])
  const [currentChapterIdx] = usePropertyNumber("chapter", -1)
  const [videoDuration] = usePropertyNumber("duration", 0)
  const [timePos] = usePropertyNumber("time-pos", 0)
  const [showButton, setShowButton] = useState(false)
  const [currentSkipChapter, setCurrentSkipChapter] =
    useState<SkippableChapter | null>(null)

  // Determine skip mode
  const skippableChapters = useSkippableChapters(chapters, videoDuration)
  const skipMode: SkipMode = useMemo(() => {
    if (skippableChapters.length > 0) return "chapter"
    if (config.silenceMode && chapters.length === 0) return "silence"
    return "none"
  }, [skippableChapters, chapters])

  // Custom hooks
  const { suppressed, startSuppression } = useSkipSuppression()
  const { introSkipped, setIntroSkipped } = useIntroSkippedState()
  const {
    silenceActive,
    buttonMessage,
    startSilenceSkip,
    cancelSilenceSkip,
    checkTimeWindow,
  } = useSilenceSkip(
    skipMode === "silence",
    videoDuration,
    introSkipped,
    setIntroSkipped,
  )

  // Skip to chapter end
  const handleChapterSkip = useCallback(
    (chapter: SkippableChapter) => {
      startSuppression()

      // Track intro skip
      if (chapter.category === "opening") {
        setIntroSkipped(true)
      }

      // Skip to next chapter start or near end of video
      if (chapter.index < chapters.length - 1) {
        const nextChap = chapters[chapter.index + 1]
        setPropertyNumber("time-pos", nextChap.time)
      } else {
        setPropertyNumber("time-pos", videoDuration - 0.5)
      }

      setShowButton(false)
      showNotification(`Skipped ${chapter.category}`)
    },
    [chapters, videoDuration, startSuppression, setIntroSkipped],
  )

  // Handle silence mode skip
  const handleSilenceSkip = useCallback(() => {
    if (silenceActive) {
      cancelSilenceSkip()
    } else {
      startSilenceSkip()
    }
  }, [silenceActive, startSilenceSkip, cancelSilenceSkip])

  // Check notification on chapter change (chapter mode)
  useEffect(() => {
    if (skipMode !== "chapter") return
    if (currentChapterIdx === -1 || suppressed) {
      setShowButton(false)
      return
    }

    // Skip intro notifications if already skipped
    if (introSkipped && timePos < config.introTimeWindow) {
      return
    }

    const match = skippableChapters.find((c) => c.index === currentChapterIdx)
    if (match) {
      if (config.autoSkip) {
        handleChapterSkip(match)
      } else {
        setCurrentSkipChapter(match)
        setShowButton(true)
        const timer = setTimeout(() => setShowButton(false), config.duration)
        return () => clearTimeout(timer)
      }
    } else {
      setShowButton(false)
    }
  }, [
    skipMode,
    currentChapterIdx,
    skippableChapters,
    suppressed,
    introSkipped,
    timePos,
    handleChapterSkip,
  ])

  // Check notification for silence mode
  useEffect(() => {
    if (skipMode !== "silence" || silenceActive) return
    if (suppressed) return

    const shouldShow = checkTimeWindow(timePos)
    if (shouldShow && !showButton) {
      setShowButton(true)
      const timer = setTimeout(() => setShowButton(false), config.duration)
      return () => clearTimeout(timer)
    }
  }, [
    skipMode,
    timePos,
    silenceActive,
    suppressed,
    checkTimeWindow,
    showButton,
  ])

  // Handle manual event trigger
  useEffect(() => {
    return registerScriptMessage(config.eventName, () => {
      if (skipMode === "chapter") {
        if (
          currentSkipChapter &&
          currentChapterIdx === currentSkipChapter.index
        ) {
          handleChapterSkip(currentSkipChapter)
        } else {
          const match = skippableChapters.find(
            (c) => c.index === currentChapterIdx,
          )
          if (match) {
            handleChapterSkip(match)
          } else {
            showNotification("No skippable chapter active")
          }
        }
      } else if (skipMode === "silence") {
        handleSilenceSkip()
      } else {
        showNotification("No skip mode active")
      }
    })
  }, [
    skipMode,
    currentSkipChapter,
    currentChapterIdx,
    skippableChapters,
    handleChapterSkip,
    handleSilenceSkip,
  ])

  // Determine button content
  const getButtonContent = () => {
    if (silenceActive && buttonMessage) {
      return buttonMessage
    }
    if (skipMode === "chapter" && currentSkipChapter) {
      return `Skip ${currentSkipChapter.category.charAt(0).toUpperCase() + currentSkipChapter.category.slice(1)}`
    }
    if (skipMode === "silence") {
      const inIntro = timePos <= config.introTimeWindow
      return inIntro ? "Skip Opening" : "Skip Ending"
    }
    return "Skip"
  }

  const handleButtonClick = () => {
    if (!config.mouse) return
    if (skipMode === "chapter" && currentSkipChapter) {
      handleChapterSkip(currentSkipChapter)
    } else if (skipMode === "silence") {
      handleSilenceSkip()
    }
  }

  if (!showButton && !silenceActive) return null

  return (
    <Button
      position="absolute"
      bottom={config.bottom}
      right={config.right}
      backgroundColor={config.backgroundColor}
      backgroundColorHover={config.backgroundColorHover}
      color={config.color}
      colorHover={config.colorHover}
      borderColor={config.borderColor}
      borderSize={config.borderSize}
      borderRadius={config.borderSize / 4}
      justifyContent="center"
      onClick={handleButtonClick}
      display="flex"
      alignItems="center"
      fontSize={config.fontSize}
      fontWeight="bold"
      text={getButtonContent()}
    />
  )
}

render(<App />)
