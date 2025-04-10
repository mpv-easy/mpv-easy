import React, { useEffect, useRef, useState } from "react"
import { Bilibili, Jellyfin, Youtube, Twitch, Nicovideo } from "./rules"
import { encodeToBase64, openUrl } from "./share"
import { PlayWith } from "./type"
import Mpv from "../assets/mpv-logo.png"
import VLC from "../assets/vlc-logo.png"
export const MPV_LOGO = `data:image/png;base64,${Mpv}`
export const VLC_LOGO = `data:image/png;base64,${VLC}`

const LOGO_LIST = [MPV_LOGO, VLC_LOGO]

import { useLocalStorage } from "react-use"

const Rules = [Bilibili, Youtube, Jellyfin, Twitch, Nicovideo]

const LocalStorageKey = "mpv-easy-play-with"
const LoadingTime = 2000
const ICON_SIZE = 64
const LABEL_MIN_SIZE = 24
const LABEL_FONT_SIZE = 16
const LABEL_BG_COLOR = "lightgray"
const MPV_COLOR = "#6B2D85"
const PLAY_WITH_ID = "__MPV_PLAY_WITH__"
const MAX_ZINDEX = 1 << 30
// const MPV_BG_COLOR = '#4A1E5E'

export function App() {
  const fullscreen = document.fullscreen || !!document.fullscreenElement

  // _pos maybe undefined ?
  const [_pos, setPos, removePos] = useLocalStorage(LocalStorageKey, {
    left: 0,
    bottom: 0,
  })
  const pos = { left: 0, bottom: 0, ..._pos }
  const dragStartMousePos = useRef(pos)

  const [display, setDisplay] = useState(false)
  const [hover, setHover] = useState(false)
  const domRef = useRef<HTMLDivElement>(null)
  const [playWith, setPlayWith] = useState<PlayWith>()
  const videos = playWith?.playlist.list || []
  // console.log('videos: ', videos)
  const opacity = hover ? 100 : 0
  const [loading, setLoading] = useState(false)
  const [logoIndex, setLogoIndex] = useState(0)

  async function detect() {
    const url = window.location.href
    const rule = Rules.find((i) => i.match(url))
    if (rule) {
      setDisplay(true)
      const videoList = await rule.getVideos(url)
      if (!videoList?.playlist.list.length) {
        setPlayWith({ playlist: { list: [] } })
        return
      }
      setPlayWith(videoList)
    } else {
      setDisplay(false)
      setPlayWith({ playlist: { list: [] } })
    }
  }

  useEffect(() => {
    setInterval(detect, 1000)
    detect()

    document.body.addEventListener("keydown", (e) => {
      if (e.code === "KeyR" && e.shiftKey && e.ctrlKey) {
        setPos({ left: 0, bottom: 0 })
        removePos()
      }
    })
  }, [])

  return (
    display &&
    !fullscreen &&
    videos.length > 0 && (
      <div
        id={PLAY_WITH_ID}
        ref={domRef}
        style={{
          width: ICON_SIZE,
          height: ICON_SIZE,
          display: "flex",
          position: "fixed",
          left: pos.left,
          bottom: pos.bottom,
          zIndex: MAX_ZINDEX,
          opacity,
          cursor: "pointer",
          // @ts-ignore
          WebkitUserDrag: "element",
          filter: loading ? "grayscale(100%)" : "",
        }}
        onMouseUp={async (e) => {
          e.stopPropagation()
          if (loading || !playWith) {
            return
          }
          const url = encodeToBase64(playWith)
          setLoading(true)
          await openUrl(url)
          setTimeout(() => {
            setLoading(false)
          }, LoadingTime)
        }}
        onMouseEnter={() => {
          setHover(true)
        }}
        onMouseLeave={() => {
          setHover(false)
        }}
        onDragStart={(e) => {
          dragStartMousePos.current = { left: e.clientX, bottom: e.clientY }
        }}
        onDragEnd={(e) => {
          const dx = e.clientX - dragStartMousePos.current.left
          const dy = e.clientY - dragStartMousePos.current.bottom
          setPos({
            left: pos.left + dx,
            bottom: pos.bottom - dy,
          })
          e.stopPropagation()
          e.preventDefault()
        }}
        onWheel={(e) => {
          if (e.deltaY > 0) {
            setLogoIndex((logoIndex + 1) % LOGO_LIST.length)
          } else {
            setLogoIndex((logoIndex + LOGO_LIST.length - 1) % LOGO_LIST.length)
          }
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          <img
            width={"100%"}
            height={"100%"}
            src={LOGO_LIST[logoIndex]}
            alt="play-with-mpv"
          />

          <div
            style={{
              display: "flex",
              position: "absolute",
              fontSize: LABEL_FONT_SIZE,
              minHeight: LABEL_MIN_SIZE,
              minWidth: LABEL_MIN_SIZE,
              fontWeight: "bold",
              right: 0,
              top: 0,
              color: MPV_COLOR,
              background: LABEL_BG_COLOR,
              aspectRatio: "1 / 1",
              borderRadius: "50%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {videos.length}
          </div>
        </div>
      </div>
    )
  )
}
