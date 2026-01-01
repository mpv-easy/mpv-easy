import { encodeToBase64, sendToMpv } from "@mpv-easy/play-with"
import React, { useState, useCallback } from "react"
import "./App.less"

// Protocol headers for different players
export const MpvHeader = "mpv-remote://"
export const VlcHeader = "vlc-remote://"
export const PotHeader = "pot-remote://"

// Default IPC server name
const DEFAULT_IPC_NAME = "mpv_remote_7780"

function App() {
  // State for inputs
  const [ipcName, setIpcName] = useState(DEFAULT_IPC_NAME)
  const [mediaPath, setMediaPath] = useState("")

  // Player state
  const [isStarted, setIsStarted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [speed, setSpeed] = useState(1.0)

  // Send IPC command to mpv
  const sendCommand = useCallback(
    (cmd: string) => {
      const args: string[] = [cmd]
      const b64 = encodeToBase64(args)
      sendToMpv(`${b64}?${ipcName}`, MpvHeader)
      console.log(`Command: ${cmd}`)
    },
    [ipcName],
  )

  // Start mpv player
  const handleStart = useCallback(() => {
    const args: string[] = mediaPath
      ? [mediaPath, `--input-ipc-server=${ipcName}`]
      : [`--idle`, `--input-ipc-server=${ipcName}`]

    const b64 = encodeToBase64(args)
    sendToMpv(b64, MpvHeader)
    setIsStarted(true)
    console.log("Started mpv", args)
  }, [mediaPath, ipcName])

  // Playback controls
  const handlePlay = () => sendCommand("set pause no")
  const handlePause = () => sendCommand("set pause yes")
  const handleTogglePause = () => sendCommand("cycle pause")
  const handleStop = () => {
    sendCommand("quit")
    setIsStarted(false)
  }

  // Seek controls
  const handleSeekBackward = () => sendCommand("seek -10")
  const handleSeekForward = () => sendCommand("seek 10")
  const handleSeekBackwardLarge = () => sendCommand("seek -60")
  const handleSeekForwardLarge = () => sendCommand("seek 60")

  // Volume controls
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value)
    setVolume(newVolume)
    sendCommand(`set volume ${newVolume}`)
  }
  const handleMute = () => sendCommand("cycle mute")

  // Speed controls
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed)
    sendCommand(`set speed ${newSpeed}`)
  }

  // Display controls
  const handleFullscreen = () => sendCommand("cycle fullscreen")
  const handleToggleOSD = () => sendCommand("cycle osd-level")

  // Playlist controls
  const handlePlaylistPrev = () => sendCommand("playlist-prev")
  const handlePlaylistNext = () => sendCommand("playlist-next")

  // Chapter controls
  const handleChapterPrev = () => sendCommand("add chapter -1")
  const handleChapterNext = () => sendCommand("add chapter 1")

  // Subtitle controls
  const handleCycleSub = () => sendCommand("cycle sub")
  const handleToggleSub = () => sendCommand("cycle sub-visibility")

  // Audio controls
  const handleCycleAudio = () => sendCommand("cycle audio")

  return (
    <div className="app-container">
      <h1 className="title">MPV Remote Control</h1>

      {/* Input Section */}
      <section className="input-section">
        <div className="input-group">
          <label htmlFor="ipc-name">IPC Server Name</label>
          <input
            id="ipc-name"
            type="text"
            value={ipcName}
            onChange={(e) => setIpcName(e.target.value)}
            placeholder="mpv_remote_7780"
          />
        </div>

        <div className="input-group">
          <label htmlFor="media-path">
            Media Path / URL (empty for idle mode)
          </label>
          <input
            id="media-path"
            type="text"
            value={mediaPath}
            onChange={(e) => setMediaPath(e.target.value)}
            placeholder="C:/video.mp4 or https://youtube.com/..."
          />
        </div>

        <button className="btn btn-primary btn-start" onClick={handleStart}>
          Start MPV
        </button>
      </section>

      {/* Control Panel - Only visible after start */}
      <section className={`control-panel ${isStarted ? "active" : "disabled"}`}>
        <h2>Player Controls</h2>

        {/* Playback Controls */}
        <div className="control-group">
          <h3>Playback</h3>
          <div className="btn-row">
            <button className="btn" onClick={handlePlay} disabled={!isStarted}>
              ▶ Play
            </button>
            <button className="btn" onClick={handlePause} disabled={!isStarted}>
              ⏸ Pause
            </button>
            <button
              className="btn"
              onClick={handleTogglePause}
              disabled={!isStarted}
            >
              ⏯ Toggle
            </button>
            <button
              className="btn btn-danger"
              onClick={handleStop}
              disabled={!isStarted}
            >
              ⏹ Stop
            </button>
          </div>
        </div>

        {/* Seek Controls */}
        <div className="control-group">
          <h3>Seek</h3>
          <div className="btn-row">
            <button
              className="btn"
              onClick={handleSeekBackwardLarge}
              disabled={!isStarted}
            >
              ⏪ -60s
            </button>
            <button
              className="btn"
              onClick={handleSeekBackward}
              disabled={!isStarted}
            >
              ◀ -10s
            </button>
            <button
              className="btn"
              onClick={handleSeekForward}
              disabled={!isStarted}
            >
              ▶ +10s
            </button>
            <button
              className="btn"
              onClick={handleSeekForwardLarge}
              disabled={!isStarted}
            >
              ⏩ +60s
            </button>
          </div>
        </div>

        {/* Volume Controls */}
        <div className="control-group">
          <h3>Volume: {volume}%</h3>
          <div className="slider-row">
            <input
              type="range"
              min="0"
              max="150"
              value={volume}
              onChange={handleVolumeChange}
              disabled={!isStarted}
              className="slider"
            />
            <button className="btn" onClick={handleMute} disabled={!isStarted}>
              🔇 Mute
            </button>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="control-group">
          <h3>Speed: {speed.toFixed(2)}x</h3>
          <div className="btn-row">
            {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
              <button
                key={s}
                className={`btn ${speed === s ? "btn-active" : ""}`}
                onClick={() => handleSpeedChange(s)}
                disabled={!isStarted}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Playlist & Chapter Controls */}
        <div className="control-group">
          <h3>Playlist / Chapter</h3>
          <div className="btn-row">
            <button
              className="btn"
              onClick={handlePlaylistPrev}
              disabled={!isStarted}
            >
              ⏮ Prev
            </button>
            <button
              className="btn"
              onClick={handlePlaylistNext}
              disabled={!isStarted}
            >
              ⏭ Next
            </button>
            <button
              className="btn"
              onClick={handleChapterPrev}
              disabled={!isStarted}
            >
              ◀ Ch-
            </button>
            <button
              className="btn"
              onClick={handleChapterNext}
              disabled={!isStarted}
            >
              ▶ Ch+
            </button>
          </div>
        </div>

        {/* Display Controls */}
        <div className="control-group">
          <h3>Display</h3>
          <div className="btn-row">
            <button
              className="btn"
              onClick={handleFullscreen}
              disabled={!isStarted}
            >
              ⛶ Fullscreen
            </button>
            <button
              className="btn"
              onClick={handleToggleOSD}
              disabled={!isStarted}
            >
              📊 OSD
            </button>
          </div>
        </div>

        {/* Subtitle & Audio Controls */}
        <div className="control-group">
          <h3>Subtitle / Audio</h3>
          <div className="btn-row">
            <button
              className="btn"
              onClick={handleCycleSub}
              disabled={!isStarted}
            >
              📝 Cycle Sub
            </button>
            <button
              className="btn"
              onClick={handleToggleSub}
              disabled={!isStarted}
            >
              👁 Toggle Sub
            </button>
            <button
              className="btn"
              onClick={handleCycleAudio}
              disabled={!isStarted}
            >
              🔊 Cycle Audio
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
