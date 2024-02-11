import "./mock"
import "@mpv-easy/tool"
import React, { useEffect, useState } from 'react'
import { Box, render } from "@mpv-easy/ui"
import './main.css'
import { getMPV } from "@mpv-easy/tool"

function Counter() {
  const [count, setCount] = useState(0)

  // useEffect(() => {
  //   setInterval(() => {
  //     setCount(c => c + 1)
  //   }, 1000)
  // }, [])

  return <Box
    width={100}
    height={100}
    backgroundColor={(count % 2) ? '00FFFF' : "00FF00"}
    text={count.toString()}
    onMouseDown={() => {
      console.log("count: ", count)
      setCount(c => c + 1)
    }}
  />
}

const canvas = getMPV().get_property_native('canvas') as HTMLCanvasElement
canvas.setAttribute('id', 'mpv-canvas')
document.body.append(canvas)
render(<Counter />)
