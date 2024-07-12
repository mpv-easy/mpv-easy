import React, { useEffect, useRef, useState } from "react"
import { Icon } from "./icons"
import { Bilibili, Youtube } from "./rules"
import { getMpvUrl, openUrl } from "./share"
import { Jellyfin } from "./rules/Jellyfin"
import { PlayItem } from "./type"

const Rules = [Bilibili, Youtube, Jellyfin]

export function App() {
  const width = 64
  const height = 64
  // TODO: drag move
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const zIndex = 1 << 20
  const [display, setDisplay] = useState(false)
  const [hover, setHover] = useState(false)
  const domRef = useRef<HTMLDivElement>(null)
  const [logo, setLogo] = useState(Icon.Mpv)
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
      const logo = rule.getLogo(url)
      setLogo(logo)
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
          pointerEvents: loading ? "none" : 'inherit'
        }}
        onMouseUp={(e) => {
          e.stopPropagation()
          const url = getMpvUrl(videos)
          if (url.length > 2048) {
            alert("url too long!")
            return
          }
          setLoading(true)
          openUrl(url)
          setTimeout(() => {
            setLoading(false)
          }, 1000);
        }}
        onMouseEnter={() => {
          setHover(true)
        }}
        onMouseLeave={() => {
          setHover(false)
        }}
      >
        <img width={"100%"} height={"100%"} src={logo} alt="play-with-mpv" />
      </div>
    )
  )
}
