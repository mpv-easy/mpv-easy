import React, { useEffect } from "react"
import { Provider, atom, useAtom } from "jotai"
import { Box, render } from "@mpv-easy/react"

const countAtom = atom(0)
const doubleAtom = atom((get) => get(countAtom) * 2)
const ltTenAtom = atom((get) => get(countAtom) < 10)

function Counter() {
  const [count, setCount] = useAtom(countAtom)
  useEffect(() => {
    setInterval(() => {
      setCount((v) => v + 1)
    }, 1000)
  }, [])
  console.log("count", count)
  return <Box text={count.toString()} />
}

function Double() {
  const [double] = useAtom(doubleAtom)
  console.log("double", double)
  return <Box text={double.toString()} />
}

function LtTen() {
  const [ltTen] = useAtom(ltTenAtom)
  console.log("ltTen", ltTen)
  return <Box text={ltTen.toString()} />
}

const App = () => (
  <Provider>
    <Counter />
    <Double />
    <LtTen />
  </Provider>
)

render(<App />)
