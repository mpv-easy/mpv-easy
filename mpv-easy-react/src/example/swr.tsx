import { Box } from "@mpv-easy/react"
import useSWR from "swr"
import React from "react"
import { fetch } from "@mpv-easy/tool"

function App() {
  const { data, error, isLoading } = useSWR<{ name: string }>(
    "https://api.github.com/repos/mpv-easy/mpv-easy/releases/latest",
    (url: string) =>
      fetch(url, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0",
        },
      }).then((r) => r.json()),
  )

  console.log(data, error, isLoading)

  if (error) return <Box text={error} />
  if (isLoading) return <Box text="loading..." />
  return <Box text={data?.name} />
}

export default App
