import { Box } from "@mpv-easy/react"
import { sleep } from "@mpv-easy/tool"
import React, { Suspense } from "react"

const Sleep = React.lazy(() =>
  sleep(2000).then(() => ({ default: () => <Box text="wake up" /> })),
)

export function App() {
  return (
    <Suspense fallback={<Box text="sleep" />}>
      <Sleep />
    </Suspense>
  )
}

export default App
