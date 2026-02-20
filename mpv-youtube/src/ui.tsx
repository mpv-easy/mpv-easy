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
} from "@mpv-easy/tool"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Box, type MpDomProps, useProperty } from "@mpv-easy/react"
import { downloadAndConvertThumbnail, type ThumbnailResult } from "./tool"

const MAX_COLS = 6
const MAX_ROWS = 4
// Maximum visible rows for performance — scroll if user requests more
const MAX_VISIBLE_ROWS = 3

// IDs must be unique 1-63, use 40-63 for thumbnails (max 6x2=12 visible)
const THUMBNAIL_ID_START = 40

export type YoutubeEntry = youtube.YoutubeEntry

export type YoutubeUIProps = MpDomProps & {
  cookiesPath?: string
  cols?: number
  rows?: number
  titleFontSize?: number
  titleFont?: string
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
const ICON_YOUTUBE = "󰗃"
const ICON_REFRESH = "󰑐"
const ICON_SHUFFLE = ""

export const defaultYoutubeConfig = {
  cookiesPath: "",
  cols: 3,
  rows: 4,
  titleFontSize: 16,
  titleFont: "FiraCode Nerd Font Mono",
  titleColor: White + AlphaShow,
  titleColorHover: Yellow + AlphaShow,
  titleBackgroundColor: Black + AlphaMedium,
  loadingColor: White + AlphaMedium,
  loadingBackgroundColor: `#333333${AlphaMedium}`,
  overlayBackgroundColor: `#1a1a1a${AlphaMedium}`,
}

function textEllipsis(text: string, maxLength: number, ellipsis = "...") {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - ellipsis.length) + ellipsis
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook: manages fetching YouTube recommendations and caching all entries.
 * Returns allEntries (full list), a fetch function, a loading flag, and a filtered page.
 */
function useYoutubeData(cookiesPath: string, _pageSize: number) {
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
    const shuffled = [...allEntries]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setAllEntries(shuffled)
    print(`[youtube] shuffled ${shuffled.length} entries`)
  }, [allEntries])

  return { allEntries, fetchRecommendations, shuffleEntries, loadingRef }
}

/**
 * Hook: manages visibility toggling via script message.
 */
function useVisibility(
  allEntries: YoutubeEntry[],
  fetchRecommendations: () => Promise<void>,
) {
  const [visible, setVisible] = useState(false)

  // Refs to current state for script message handler closure
  const stateRef = useRef({ visible, allEntries })
  useEffect(() => {
    stateRef.current = { visible, allEntries }
  }, [visible, allEntries])

  const fetcherRef = useRef<() => Promise<void>>(() => Promise.resolve())
  useEffect(() => {
    fetcherRef.current = fetchRecommendations
  })

  useEffect(() => {
    registerScriptMessage("youtube-recommendations", () => {
      const { visible, allEntries } = stateRef.current
      if (visible) {
        setVisible(false)
      } else {
        if (allEntries.length > 0) {
          setVisible(true)
        } else {
          fetcherRef.current()
        }
      }
    })
  }, [])

  // Auto-show when entries arrive
  useEffect(() => {
    if (allEntries.length > 0) {
      setVisible(true)
    }
  }, [allEntries])

  return { visible, setVisible }
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
  const [thumbMap, setThumbMap] = useState<Map<string, ThumbnailResult>>(
    new Map(),
  )
  const loadingSet = useRef<Set<string>>(new Set())

  useEffect(() => {
    for (const entry of visibleEntries) {
      if (!entry.thumbnails?.length) continue
      const thumb = entry.thumbnails[0]
      const url = thumb.url
      const hash = md5(url)

      // Skip if already loaded or loading
      if (thumbMap.has(hash) || loadingSet.current.has(hash)) continue
      loadingSet.current.add(hash)

      const tmpDir = getTmpDir()
      const tmpPath = joinPath(tmpDir, `${hash}.jpg`)
      const outPath = joinPath(tmpDir, `${hash}.bgra`)

      print(`[youtube] thumb: start download ${url}`)
      downloadAndConvertThumbnail(
        url,
        tmpPath,
        outPath,
        thumb.width,
        thumb.height,
      ).then((result) => {
        loadingSet.current.delete(hash)
        if (result) {
          setThumbMap((prev) => {
            const next = new Map(prev)
            next.set(hash, result)
            return next
          })
          print(
            `[youtube] thumb: set bgra ${result.path} (${result.width}x${result.height})`,
          )
        }
      })
    }
  }, [visibleEntries])

  const getThumb = useCallback(
    (entry: YoutubeEntry): ThumbnailResult | null => {
      if (!entry.thumbnails?.length) return null
      const hash = md5(entry.thumbnails[0].url)
      return thumbMap.get(hash) ?? null
    },
    [thumbMap],
  )

  return { getThumb }
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * A single sidebar icon button with hover-yellow effect.
 */
function SidebarButton({
  icon,
  onClick,
  fontSize,
  font,
  size,
  id,
}: {
  icon: string
  onClick: () => void
  fontSize: number
  font: string
  size: number
  id: string
}) {
  const [hover, setHover] = useState(false)
  return (
    <Box
      id={id}
      width={size}
      height={size}
      text={icon}
      font={font}
      fontSize={fontSize}
      color={hover ? Yellow + AlphaShow : White + AlphaShow}
      backgroundColor={Black + AlphaHide}
      justifyContent="center"
      alignItems="center"
      display="flex"
      position="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      zIndex={1002}
    />
  )
}

/**
 * Left sidebar containing YouTube icon, refresh, and shuffle buttons.
 */
function Sidebar({
  sidebarWidth,
  screenHeight,
  titleFont,
  onRefresh,
  onShuffle,
}: {
  sidebarWidth: number
  screenHeight: number
  titleFont: string
  titleFontSize: number
  onRefresh: () => void
  onShuffle: () => void
}) {
  const iconSize = sidebarWidth
  const fontSize = 24

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
      alignItems="center"
      justifyContent="start"
      backgroundColor={Black + AlphaMedium}
      zIndex={1001}
      padding={4}
      font={"FiraCode Nerd Font Mono"}
    >
      <SidebarButton
        id="youtube-sidebar-home"
        icon={ICON_YOUTUBE}
        onClick={() => openBrowser("https://www.youtube.com/")}
        fontSize={fontSize}
        font={titleFont}
        size={iconSize}
      />
      <SidebarButton
        id="youtube-sidebar-refresh"
        icon={ICON_REFRESH}
        onClick={onRefresh}
        fontSize={fontSize}
        font={titleFont}
        size={iconSize}
      />
      <SidebarButton
        id="youtube-sidebar-shuffle"
        icon={ICON_SHUFFLE}
        onClick={onShuffle}
        fontSize={fontSize}
        font={titleFont}
        size={iconSize}
      />
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
  thumbResult,
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
  thumbResult: ThumbnailResult | null
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
  if (thumbResult) {
    const rawW = thumbResult.width
    const rawH = thumbResult.height
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
      />
      {thumbResult ? (
        <Box
          id={imageId}
          position="absolute"
          x={imgX}
          y={imgY}
          width={thumbResult.width}
          height={thumbResult.height}
          displayWidth={displayW}
          displayHeight={displayH}
          backgroundImage={thumbResult.path}
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

  const cookiesPath =
    propCookiesPath || joinPath(getScriptConfigDir(), "cookies.txt")

  // Use reactive OSD dimensions
  const { w, h } = useProperty("osd-dimensions")[0]

  // --- Hooks ---
  const { allEntries, fetchRecommendations, shuffleEntries } = useYoutubeData(
    cookiesPath,
    totalEntries,
  )

  const { visible, setVisible } = useVisibility(
    allEntries,
    fetchRecommendations,
  )

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
  const { getThumb } = useThumbnails(visibleEntries, cols)

  if (!visible || allEntries.length === 0) return null

  // Layout calculations
  const sidebarPadding = 4
  const sidebarWidth = Math.max(40, (w * 0.035) | 0)
  const sidebarTotalWidth = sidebarWidth + sidebarPadding
  const scrollbarWidth = maxOffset > 0 ? 12 : 0
  const contentWidth = w - sidebarTotalWidth - scrollbarWidth
  const cellWidth = (contentWidth / cols) | 0
  const cellHeight = (h / visibleRows) | 0

  // Font size: use prop if set, otherwise dynamically calculated from cell height
  const titleFontSize =
    propTitleFontSize && propTitleFontSize > 0
      ? propTitleFontSize
      : Math.max(Math.round(cellHeight * 0.06), 12)

  const titleFont = propTitleFont || defaultYoutubeConfig.titleFont

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
        titleFontSize={titleFontSize}
        onRefresh={fetchRecommendations}
        onShuffle={shuffleEntries}
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
            thumbResult={getThumb(entry)}
            onClose={() => setVisible(false)}
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
