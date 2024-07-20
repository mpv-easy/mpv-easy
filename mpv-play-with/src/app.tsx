import React, { useEffect, useRef, useState } from "react"
import { Bilibili, Jellyfin, Youtube, Twitch } from "./rules"
import { encodeToBase64, openUrl } from "./share"
import { PlayWith } from "./type"
import Mpv from "../assets/mpv-logo.png"
export const MPV_LOGO = `data:image/png;base64,${Mpv}`
import { useLocalStorage } from "react-use"

const Rules = [Bilibili, Youtube, Jellyfin, Twitch]

const LocalStorageKey = "mpv-easy-play-with"
const LoadingTime = 2000

export function App() {
  const width = 64
  const height = 64

  // _pos maybe undefined ?
  const [_pos, setPos, removePos] = useLocalStorage(LocalStorageKey, {
    left: 0,
    bottom: 0,
  })
  const pos = { left: 0, bottom: 0, ..._pos }
  const dragStartMousePos = useRef(pos)

  const zIndex = 1 << 20
  const [display, setDisplay] = useState(false)
  const [hover, setHover] = useState(false)
  const domRef = useRef<HTMLDivElement>(null)
  const [playWith, setPlayWith] = useState<PlayWith>()
  const videos = playWith?.playlist.list || []
  // console.log('videos: ', videos)
  const opacity = hover ? 100 : 0
  const [loading, setLoading] = useState(false)

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
    videos.length > 0 && (
      <div
        ref={domRef}
        style={{
          width,
          height,
          display: "flex",
          position: "fixed",
          left: pos.left,
          bottom: pos.bottom,
          zIndex,
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
      >
        <img
          width={"100%"}
          height={"100%"}
          src={MPV_LOGO}
          alt="play-with-mpv"
        />
      </div>
    )
  )
}
