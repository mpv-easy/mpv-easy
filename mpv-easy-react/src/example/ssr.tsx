import React from "react"
import { getConfig } from "../context"
import { store } from "../store"

interface RecursiveDivProps {
  deep: number
  count: number
}

const RecursiveDiv: React.FC<RecursiveDivProps> = ({ deep, count }) => {
  if (deep === 0) {
    return null
  }
  const children = Array.from({ length: count }, (_, index) => (
    <RecursiveDiv key={index} deep={deep - 1} count={count} />
  ))
  // @ts-ignore
  return (
    <div
      id={`${deep}-${count}`}
      key={`${deep}-${count}`}
      // @ts-ignore
      width={`${deep}-${count}`}
      // @ts-ignore
      height={`${deep}-${count}`}
    >
      {children}
    </div>
  )
}

import("react-dom/server").then((v) => {
  const customConfig = getConfig()
  store.setState(customConfig)
  const { renderToString } = v
  const st = Date.now()
  const s = renderToString(<RecursiveDiv count={5} deep={4} />)
  const ed = Date.now()
  console.log("ssr text: ", s)
  console.log("ssr time: ", ed - st)
})
