import {
  youtube,
  showNotification,
  hideNotification,
  registerScriptMessage,
  existsSync,
  getScriptConfigDir,
  joinPath,
  loadfile,
  md5,
  getTmpDir,
  openBrowser,
  textEllipsis,
  setPropertyBool,
  getPropertyBool,
  formatTime,
  getTimeFormat,
} from "@mpv-easy/tool"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Box, Button, type MpDomProps, useProperty } from "@mpv-easy/react"
import { downloadAndConvertThumbnail } from "./tool"

const thumbCache = new Map<string, string>() // hash -> outPath

const MAX_COLS = 6
const MAX_ROWS = 4
// Maximum visible rows for performance — scroll if user requests more
const MAX_VISIBLE_ROWS = 3

// IDs must be unique 1-63, use 1-24 for thumbnails (max 6x4=24 visible)
const THUMBNAIL_ID_START = 1

export type YoutubeEntry = youtube.YoutubeEntry

export type YoutubeUIProps = MpDomProps & {
  cookiesPath?: string
  cols?: number
  rows?: number
  titleFontSize?: number
  titleFont?: string
  sidebarWidth?: number
  sidebarPinned?: boolean
  // Colors in BGRA hex format (alpha: 00=show, FF=hide)
  titleColor?: string
  titleColorHover?: string
  titleBackgroundColor?: string
  loadingColor?: string
  loadingBackgroundColor?: string
  overlayBackgroundColor?: string
}

// BGRA color constants (alpha: 00=show, FF=hide)
const White = "#FFFFFF"
const Black = "#000000"
const Yellow = "#00FFFF"
const AlphaShow = "00"
const AlphaMedium = "80"
const AlphaHide = "FF"

// Sidebar icon constants
const ICON_YOUTUBE = "" //  󰗃
const ICON_REFRESH = "󰑐"
const ICON_SHUFFLE = ""
const ICON_OPEN = "󰊓"
const ICON_EXIT = ""

export const defaultYoutubeConfig = {
  cookiesPath: "",
  cols: 4,
  rows: 4,
  titleFontSize: 24,
  titleFont: "FiraCode Nerd Font Mono",
  sidebarWidth: 64,
  sidebarPinned: false,
  titleColor: White + AlphaShow,
  titleColorHover: Yellow + AlphaShow,
  titleBackgroundColor: Black + AlphaMedium,
  loadingColor: White + AlphaMedium,
  loadingBackgroundColor: `#333333${AlphaMedium}`,
  overlayBackgroundColor: `#1a1a1a${AlphaMedium}`,
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook: manages fetching YouTube recommendations and caching all entries.
 * Returns allEntries (full list), a fetch function, a loading flag, and a filtered page.
 */
function useYoutubeData(cookiesPath: string) {
  const [allEntries, setAllEntries] = useState<YoutubeEntry[]>([])
  const loadingRef = useRef(false)

  const fetchRecommendations = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    print(`[youtube] fetchRecommendations called`)
    print(`[youtube] cookiesPath=${cookiesPath}`)
    showNotification("Loading YouTube...", 0)
    try {
      if (!existsSync(cookiesPath)) {
        print(`[youtube] cookies file NOT found: ${cookiesPath}`)
        hideNotification()
        showNotification(`cookies file not found: ${cookiesPath}`, 3)
        loadingRef.current = false
        return
      }
      print(`[youtube] cookies file found, calling yt-dlp...`)
      const result = await youtube.getYoutubeRecommendations(cookiesPath)
      print(`[youtube] yt-dlp returned, got ${result.length} entries`)
      const filtered = result.filter(
        (e) =>
          e.thumbnails &&
          e.thumbnails.length > 0 &&
          e.url &&
          !e.url.includes("playlist?list="),
      )
      print(`[youtube] filtered to ${filtered.length} entries with thumbnails`)
      setAllEntries(filtered)
      hideNotification()
    } catch (e) {
      print(`[youtube] ERROR in fetchRecommendations: ${e}`)
      hideNotification()
      showNotification(`YouTube recommendations failed: ${e}`, 3)
    }
    loadingRef.current = false
  }, [cookiesPath])

  const shuffleEntries = useCallback(() => {
    if (allEntries.length === 0) return
    // Fisher-Yates shuffle and take pageSize items
    const shuffled = [...allEntries].sort(() => Math.random() - 0.5)
    setAllEntries(shuffled)
    print(`[youtube] shuffled ${shuffled.length} entries`)
  }, [allEntries])

  return { allEntries, fetchRecommendations, shuffleEntries, loadingRef }
}

/**
 * Hook: manages visibility toggling via script message.
 * Separates sidebar and content visibility for sidebarAlwaysShow support.
 */
function useVisibility(
  allEntries: YoutubeEntry[],
  fetchRecommendations: () => Promise<void>,
  sidebarPinned: boolean,
) {
  const [contentVisible, setContentVisible] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(sidebarPinned)

  // Track whether we paused the video so we can restore on hide
  const pausedByUsRef = useRef(false)

  // Refs to current state for script message handler closure
  const stateRef = useRef({ contentVisible, sidebarVisible, allEntries })
  useEffect(() => {
    stateRef.current = { contentVisible, sidebarVisible, allEntries }
  }, [contentVisible, sidebarVisible, allEntries])

  const fetcherRef = useRef<() => Promise<void>>(() => Promise.resolve())
  useEffect(() => {
    fetcherRef.current = fetchRecommendations
  })

  useEffect(() => {
    registerScriptMessage("youtube", () => {
      const { contentVisible, sidebarVisible, allEntries } = stateRef.current
      if (sidebarVisible && contentVisible) {
        // Both visible → hide content; sidebar stays only if always-show
        setContentVisible(false)
        if (!sidebarPinned) {
          setSidebarVisible(false)
        }
      } else {
        // Not both visible → show all
        setSidebarVisible(true)
        if (allEntries.length > 0) {
          setContentVisible(true)
        } else {
          fetcherRef.current()
        }
      }
    })
  }, [sidebarPinned])

  // Auto-show when entries arrive
  useEffect(() => {
    if (allEntries.length > 0) {
      setContentVisible(true)
      setSidebarVisible(true)
    }
  }, [allEntries])

  // Pause video when YouTube content is shown, restore when hidden
  useEffect(() => {
    if (contentVisible) {
      const wasPaused = getPropertyBool("pause")
      if (!wasPaused) {
        setPropertyBool("pause", true)
        pausedByUsRef.current = true
      } else {
        pausedByUsRef.current = false
      }
    } else {
      if (pausedByUsRef.current) {
        setPropertyBool("pause", false)
        pausedByUsRef.current = false
      }
    }
  }, [contentVisible])

  return {
    contentVisible,
    sidebarVisible,
    setContentVisible,
    setSidebarVisible,
  }
}

/**
 * Hook: manages scroll state (which row offset is currently visible).
 */
function useScroll(totalRows: number, visibleRows: number) {
  const [scrollOffset, setScrollOffset] = useState(0)
  const maxOffset = Math.max(0, totalRows - visibleRows)

  // Clamp when totalRows changes
  useEffect(() => {
    setScrollOffset((prev) => Math.min(prev, maxOffset))
  }, [maxOffset])

  const scrollUp = useCallback(() => {
    setScrollOffset((prev) => Math.max(0, prev - 1))
  }, [])

  const scrollDown = useCallback(() => {
    setScrollOffset((prev) => Math.min(maxOffset, prev + 1))
  }, [maxOffset])

  return { scrollOffset, scrollUp, scrollDown, maxOffset }
}

/**
 * Hook: manages thumbnail loading for currently visible cards.
 * Uses a cache to avoid re-downloading and reuses imageIds optimally.
 */
function useThumbnails(visibleEntries: YoutubeEntry[], _cols: number) {
  const [, setTick] = useState(0)
  const loadingSet = useRef<Set<string>>(new Set())

  useEffect(() => {
    for (const entry of visibleEntries) {
      if (!entry.thumbnails?.length) continue
      const thumb = entry.thumbnails[0]
      const url = thumb.url
      const hash = md5(url)

      // Skip if already loaded or loading
      if (thumbCache.has(hash) || loadingSet.current.has(hash)) continue
      loadingSet.current.add(hash)

      const tmpDir = getTmpDir()
      const tmpPath = joinPath(tmpDir, `${hash}.jpg`)
      const outPath = joinPath(tmpDir, `${hash}.bgra`)

      print(`[youtube] thumb: start download ${url}`)
      downloadAndConvertThumbnail(url, tmpPath, outPath).then(() => {
        loadingSet.current.delete(hash)
        thumbCache.set(hash, outPath)
        setTick((t) => t + 1)
        print(`[youtube] thumb: set bgra ${outPath}`)
      })
    }
  }, [visibleEntries])

  const getThumbPath = useCallback((entry: YoutubeEntry): string | null => {
    if (!entry.thumbnails?.length) return null
    const hash = md5(entry.thumbnails[0].url)
    return thumbCache.get(hash) ?? null
  }, [])

  return { getThumbPath }
}

/**
 * Left sidebar containing YouTube icon, refresh, shuffle, and exit/open buttons.
 */
function Sidebar({
  sidebarWidth,
  screenHeight,
  titleFont,
  onRefresh,
  onShuffle,
  onClose,
  onOpen,
  showClose,
  showOpen,
}: {
  sidebarWidth: number
  screenHeight: number
  titleFont: string
  onRefresh: () => void
  onShuffle: () => void
  onClose: () => void
  onOpen: () => void
  showClose: boolean
  showOpen: boolean
}) {
  const iconFontSize = sidebarWidth
  const btnFontSize = Math.round(sidebarWidth * 1)
  const baseBtnStyle = {
    font: titleFont,
    color: White + AlphaShow,
    colorHover: Yellow + AlphaShow,
    backgroundColor: Black + AlphaHide,
    display: "flex" as const,
    position: "relative" as const,
    zIndex: 1002,
  }
  const btnStyle = { ...baseBtnStyle, fontSize: btnFontSize }
  const ytBtnStyle = { ...baseBtnStyle, fontSize: iconFontSize }

  return (
    <Box
      id="youtube-sidebar"
      position="absolute"
      x={0}
      y={0}
      width={sidebarWidth}
      height={screenHeight}
      display="flex"
      flexDirection="column"
      justifyContent="start"
      backgroundColor={Black + AlphaMedium}
      zIndex={1001}
      padding={4}
    >
      <Button
        id="youtube-sidebar-home"
        text={ICON_YOUTUBE}
        onClick={() => openBrowser("https://www.youtube.com/")}
        {...ytBtnStyle}
        color="#0000FF"
      />
      <Button
        id="youtube-sidebar-refresh"
        text={ICON_REFRESH}
        onClick={onRefresh}
        {...btnStyle}
      />
      <Button
        id="youtube-sidebar-shuffle"
        text={ICON_SHUFFLE}
        onClick={onShuffle}
        {...btnStyle}
      />
      {/* Exit button: closes the YouTube page, hidden when YouTube info is not shown */}
      {showClose && (
        <Button
          id="youtube-sidebar-exit"
          text={ICON_EXIT}
          onClick={onClose}
          {...btnStyle}
        />
      )}

      {/* Open button: only shown when sidebar is always visible and YouTube page is hidden */}
      {showOpen && (
        <Button
          id="youtube-sidebar-open"
          text={ICON_OPEN}
          onClick={onOpen}
          {...btnStyle}
        />
      )}
    </Box>
  )
}

/**
 * Vertical scrollbar indicator on the right side.
 */
function Scrollbar({
  scrollOffset,
  maxOffset,
  barAreaHeight,
  barX,
  barWidth,
  barAreaY,
}: {
  scrollOffset: number
  maxOffset: number
  barAreaHeight: number
  barX: number
  barWidth: number
  barAreaY: number
}) {
  if (maxOffset <= 0) return null

  // The thumb represents the visible portion
  const thumbRatio = 1 / (maxOffset + 1)
  const thumbHeight = Math.max(barAreaHeight * thumbRatio, 16)
  const trackSpace = barAreaHeight - thumbHeight
  const thumbTop =
    barAreaY + (maxOffset > 0 ? (scrollOffset / maxOffset) * trackSpace : 0)

  return (
    <>
      {/* Scrollbar track */}
      <Box
        id="youtube-scrollbar-track"
        position="absolute"
        x={barX}
        y={barAreaY}
        width={barWidth}
        height={barAreaHeight}
        backgroundColor={`#444444${AlphaMedium}`}
        zIndex={1003}
      />
      {/* Scrollbar thumb */}
      <Box
        id="youtube-scrollbar-thumb"
        position="absolute"
        x={barX}
        y={thumbTop}
        width={barWidth}
        height={thumbHeight}
        backgroundColor={White + AlphaMedium}
        zIndex={1004}
      />
    </>
  )
}

/**
 * A single video card. Instead of instantiating many cards, we reuse limited
 * imageIds (THUMBNAIL_ID_START + slotIndex). Only visible cards are rendered.
 */
function VideoCard({
  entry,
  slotIndex,
  cellX,
  cellY,
  cellWidth,
  cellHeight,
  titleFontSize,
  titleFont,
  titleColor,
  titleColorHover,
  titleBackgroundColor,
  loadingColor,
  loadingBackgroundColor,
  thumbPath,
  onClose,
}: {
  entry: YoutubeEntry
  slotIndex: number
  cellX: number
  cellY: number
  cellWidth: number
  cellHeight: number
  titleFontSize: number
  titleFont: string
  titleColor: string
  titleColorHover: string
  titleBackgroundColor: string
  loadingColor: string
  loadingBackgroundColor: string
  thumbPath: string | null
  onClose: () => void
}) {
  const [hover, setHover] = useState(false)
  const imageId = THUMBNAIL_ID_START + slotIndex

  const titleHeight = titleFontSize * 2
  const maxTitleLength = Math.max(
    ((cellWidth - 8) / (titleFontSize * 0.6)) | 0,
    4,
  )
  const titleText = textEllipsis(entry.title || "", maxTitleLength)

  // Available area for the image (cell minus title bar)
  const imageAreaWidth = cellWidth
  const imageAreaHeight = cellHeight - titleHeight

  // Calculate display dimensions that fit within the cell, preserving aspect ratio
  let displayW = imageAreaWidth
  let displayH = imageAreaHeight
  const thumb = entry.thumbnails?.[0]
  const rawW = thumb?.width || 0
  const rawH = thumb?.height || 0
  if (thumbPath && rawW && rawH) {
    const scaleX = imageAreaWidth / rawW
    const scaleY = imageAreaHeight / rawH
    const scale = Math.min(scaleX, scaleY)
    displayW = (rawW * scale) | 0
    displayH = (rawH * scale) | 0
  }

  // Center image horizontally and vertically within the image area
  const imgX = cellX + (((imageAreaWidth - displayW) / 2) | 0)
  const imgY = cellY + (((imageAreaHeight - displayH) / 2) | 0)

  const handleClick = useCallback(() => {
    if (entry.url) {
      loadfile(entry.url, "replace")
      onClose()
    }
  }, [entry.url, onClose])

  // Calculate duration position (bottom-right of the image)
  const durationText = entry.duration
    ? formatTime(entry.duration, getTimeFormat(entry.duration))
    : ""
  const title = [durationText, entry.title].join("\n")

  return (
    <>
      {/* Full-cell transparent overlay for hover detection */}
      <Box
        position="absolute"
        x={cellX}
        y={cellY}
        width={cellWidth}
        height={cellHeight}
        backgroundColor={Black + AlphaHide}
        zIndex={12}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={handleClick}
        title={title}
      />
      {thumbPath ? (
        <Box
          id={imageId}
          position="absolute"
          x={imgX}
          y={imgY}
          width={displayW}
          height={displayH}
          imageWidth={rawW}
          imageHeight={rawH}
          backgroundImage={thumbPath}
          backgroundImageFormat="bgra"
          zIndex={10}
        />
      ) : (
        <Box
          position="absolute"
          x={cellX}
          y={cellY}
          width={cellWidth}
          height={imageAreaHeight}
          backgroundColor={loadingBackgroundColor}
          text="Loading..."
          font={titleFont}
          fontSize={titleFontSize}
          color={loadingColor}
          justifyContent="center"
          alignItems="center"
          display="flex"
          zIndex={10}
        />
      )}
      <Box
        position="absolute"
        x={cellX}
        y={cellY + cellHeight - titleHeight}
        width={cellWidth}
        height={titleHeight}
        text={titleText}
        font={titleFont}
        fontSize={titleFontSize}
        color={hover ? titleColorHover : titleColor}
        backgroundColor={titleBackgroundColor}
        justifyContent="center"
        alignItems="center"
        display="flex"
        padding={4}
        zIndex={11}
      />
    </>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function Youtube(props: Partial<YoutubeUIProps>) {
  const {
    cookiesPath: propCookiesPath,
    cols: propCols,
    rows: propRows,
    titleFontSize: propTitleFontSize,
    titleFont: propTitleFont,
    sidebarWidth: propSidebarWidth,
    sidebarPinned: propSidebarPinned,
    titleColor = defaultYoutubeConfig.titleColor,
    titleColorHover = defaultYoutubeConfig.titleColorHover,
    titleBackgroundColor = defaultYoutubeConfig.titleBackgroundColor,
    loadingColor = defaultYoutubeConfig.loadingColor,
    loadingBackgroundColor = defaultYoutubeConfig.loadingBackgroundColor,
    overlayBackgroundColor = defaultYoutubeConfig.overlayBackgroundColor,
    ...restProps
  } = props

  const cols = Math.min(
    Math.max(propCols || defaultYoutubeConfig.cols, 1),
    MAX_COLS,
  )
  const totalRows = Math.min(
    Math.max(propRows || defaultYoutubeConfig.rows, 1),
    MAX_ROWS,
  )
  const visibleRows = Math.min(totalRows, MAX_VISIBLE_ROWS)
  const totalPerPage = cols * visibleRows
  const totalEntries = cols * totalRows

  const sidebarWidth =
    propSidebarWidth && propSidebarWidth > 0
      ? propSidebarWidth
      : defaultYoutubeConfig.sidebarWidth
  const sidebarPinned = propSidebarPinned ?? defaultYoutubeConfig.sidebarPinned

  const cookiesPath =
    propCookiesPath || joinPath(getScriptConfigDir(), "cookies.txt")

  // Use reactive OSD dimensions
  const { w, h } = useProperty("osd-dimensions")[0]

  // --- Hooks ---
  const { allEntries, fetchRecommendations, shuffleEntries } =
    useYoutubeData(cookiesPath)

  const {
    contentVisible,
    sidebarVisible,
    setContentVisible,
    setSidebarVisible,
  } = useVisibility(allEntries, fetchRecommendations, sidebarPinned)

  const { scrollOffset, scrollUp, scrollDown, maxOffset } = useScroll(
    totalRows,
    visibleRows,
  )

  // Compute the visible entries for the current scroll position
  const displayEntries = useMemo(() => {
    return allEntries.slice(0, totalEntries)
  }, [allEntries, totalEntries])

  const visibleEntries = useMemo(() => {
    const startIdx = scrollOffset * cols
    return displayEntries.slice(startIdx, startIdx + totalPerPage)
  }, [displayEntries, scrollOffset, cols, totalPerPage])

  // Thumbnail loading – only loads visible entries
  const { getThumbPath } = useThumbnails(visibleEntries, cols)

  const titleFont = propTitleFont || defaultYoutubeConfig.titleFont

  // Card click: hide content; hide sidebar unless always-show
  const handleCardClose = useCallback(() => {
    setContentVisible(false)
    if (!sidebarPinned) {
      setSidebarVisible(false)
    }
  }, [sidebarPinned, setContentVisible, setSidebarVisible])

  // ICON_EXIT click: hide content only (sidebar stays)
  const handleHideContent = useCallback(() => {
    setContentVisible(false)
  }, [setContentVisible])

  // ICON_OPEN click: show content (or fetch if no entries)
  const handleShowContent = useCallback(() => {
    if (allEntries.length > 0) {
      setContentVisible(true)
    } else {
      fetchRecommendations()
    }
  }, [allEntries, setContentVisible, fetchRecommendations])

  // Nothing to render
  if (!sidebarVisible && !contentVisible) return null

  // Sidebar only (no content)
  if (sidebarVisible && (!contentVisible || allEntries.length === 0)) {
    return (
      <Sidebar
        sidebarWidth={sidebarWidth}
        screenHeight={h}
        titleFont={titleFont}
        onRefresh={fetchRecommendations}
        onShuffle={shuffleEntries}
        onClose={handleHideContent}
        onOpen={handleShowContent}
        showClose={false}
        showOpen={true}
      />
    )
  }

  // Layout calculations
  const sidebarTotalWidth = sidebarWidth
  const scrollbarWidth = maxOffset > 0 ? 12 : 0
  const contentWidth = w - sidebarTotalWidth - scrollbarWidth
  const cellWidth = (contentWidth / cols) | 0
  const cellHeight = (h / visibleRows) | 0

  // Font size: use prop if set, otherwise dynamically calculated from cell height
  const titleFontSize =
    propTitleFontSize && propTitleFontSize > 0
      ? propTitleFontSize
      : Math.max(Math.round(cellHeight * 0.06), 12)

  const needScroll = totalRows > visibleRows

  print(
    `[youtube] layout: osd=${w}x${h}, grid=${cols}x${totalRows}, visible=${cols}x${visibleRows}, cell=${cellWidth}x${cellHeight}, scroll=${scrollOffset}/${maxOffset}, entries=${allEntries.length}`,
  )

  return (
    <Box
      position="relative"
      width={"100%"}
      height={"100%"}
      backgroundColor={overlayBackgroundColor}
      zIndex={1000}
      onWheelUp={scrollUp}
      onWheelDown={scrollDown}
      {...restProps}
    >
      {/* Sidebar */}
      <Sidebar
        sidebarWidth={sidebarWidth}
        screenHeight={h}
        titleFont={titleFont}
        onRefresh={fetchRecommendations}
        onShuffle={shuffleEntries}
        onClose={handleHideContent}
        onOpen={handleShowContent}
        showClose={true}
        showOpen={false}
      />

      {/* Video cards — only render visible rows, reuse imageIds */}
      {visibleEntries.map((entry, slotIndex) => {
        const col = slotIndex % cols
        const row = (slotIndex / cols) | 0
        const cellX = sidebarTotalWidth + col * cellWidth
        const cellY = row * cellHeight
        return (
          <VideoCard
            key={`slot-${slotIndex}`}
            entry={entry}
            slotIndex={slotIndex}
            cellX={cellX}
            cellY={cellY}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            titleFontSize={titleFontSize}
            titleFont={titleFont}
            titleColor={titleColor}
            titleColorHover={titleColorHover}
            titleBackgroundColor={titleBackgroundColor}
            loadingColor={loadingColor}
            loadingBackgroundColor={loadingBackgroundColor}
            thumbPath={getThumbPath(entry)}
            onClose={handleCardClose}
          />
        )
      })}

      {/* Scrollbar (right side) */}
      {needScroll && (
        <Scrollbar
          scrollOffset={scrollOffset}
          maxOffset={maxOffset}
          barAreaHeight={h}
          barX={w - scrollbarWidth}
          barWidth={scrollbarWidth}
          barAreaY={0}
        />
      )}
    </Box>
  )
}
