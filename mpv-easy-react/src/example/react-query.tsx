import React from "react"
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query"
import { Box } from "@mpv-easy/react"
import { fetch } from "@mpv-easy/tool"

const queryClient = new QueryClient()

function Example() {
  const { isPending, error, data } = useQuery<{ name: string }>({
    queryKey: ["repoData"],
    queryFn: () =>
      fetch("https://api.github.com/repos/mpv-easy/mpv-easy/releases/latest", {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0",
        },
      }).then((res) => res.json()),
  })

  if (isPending) return <Box text="loading..." />

  if (error) return <Box text={error.message} />
  return <Box text={data.name} />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  )
}
