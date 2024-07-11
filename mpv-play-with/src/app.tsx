import React, { useEffect, useState } from "react"
import { Icon } from "./icons"
import { Bilibili, Youtube } from "./rules"
import { openMpv } from "./share"

const Rules = [Bilibili, Youtube]

export function App() {
  const [logo, setLogo] = useState(Icon.Mpv)
  const [videos, setVideos] = useState<string[]>([])
  function detect() {
    const url = window.location.href
    const rule = Rules.find((i) => i.match(url))
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
    <div
      style={{
        width: 100,
        height: 100,
        display: "flex",
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 9999,
      }}
      onMouseDown={() => {
        console.log("onMouseDown")
        openMpv(videos)
      }}
    >
      <img width={"100%"} height={"100%"} src={logo} alt="play-with-mpv" />
    </div>
  )
}
