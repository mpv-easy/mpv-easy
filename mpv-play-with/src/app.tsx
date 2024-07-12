import React, { useEffect, useRef, useState } from "react"
import { Bilibili, Jellyfin, Youtube } from "./rules"
import { encodeToBase64, openUrl } from "./share"
import { PlayItem } from "./type"
import { MPV_LOGO } from "./icons"

const Rules = [Bilibili, Youtube, Jellyfin]

export function App() {
  const width = 64
  const height = 64
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragStartMousePos = useRef(pos)

  const zIndex = 1 << 20
  const [display, setDisplay] = useState(false)
  const [hover, setHover] = useState(false)
  const domRef = useRef<HTMLDivElement>(null)
  const [videos, setVideos] = useState<PlayItem[]>([])
  const opacity = hover ? 100 : 0
  const [loading, setLoading] = useState(false)

  function detect() {
    const url = window.location.href
    const rule = Rules.find((i) => i.match(url))
    if (rule) {
      setDisplay(true)
    } else {
      setDisplay(false)
    }

    if (rule) {
      const videoList = rule.getVideos(url)
      if (videoList.length) {
        setVideos(videoList)
      }
    }
  }

  useEffect(() => {
    setInterval(detect, 1000)
    detect()
  }, [])

  return (
    display &&
    videos.length && (
      <div
        ref={domRef}
        style={{
          width,
          height,
          display: "flex",
          position: "fixed",
          left: pos.x,
          bottom: pos.y,
          zIndex,
          opacity,
          cursor: "pointer",
          pointerEvents: loading ? "none" : "inherit",
          // @ts-ignore
          WebkitUserDrag: "element",
        }}
        onMouseUp={async (e) => {
          e.stopPropagation()
          const url = encodeToBase64(videos)
          setLoading(true)
          await openUrl(url)
          setTimeout(() => {
            setLoading(false)
          }, 1000)
        }}
        onMouseEnter={() => {
          setHover(true)
        }}
        onMouseLeave={() => {
          setHover(false)
        }}
        onDragStart={(e) => {
          dragStartMousePos.current = { x: e.clientX, y: e.clientY }
        }}
        onDragEnd={(e) => {
          const dx = e.clientX - dragStartMousePos.current.x
          const dy = e.clientY - dragStartMousePos.current.y
          setPos({
            x: pos.x + dx,
            y: pos.y - dy,
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
