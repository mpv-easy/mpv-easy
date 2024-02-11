
import '@mpv-easy/tool'
import { useEffect, useState } from 'react'
import './App.css'
import React from 'react'
import { Box, render } from '@mpv-easy/ui'
import { MPV } from '@mpv-easy/tool'


class Mpv {
  get_script_file() {
    return "get_script_file"
  }
}
declare module global {
  var mp: Mpv
}


function App() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    console.log('aaaaaaaaaaa')
  })

  return (
    <Box
      width={100}
      height={100}
      color='00FF00'
      text="hello canvas"
    />
  )
}

render(<App />)