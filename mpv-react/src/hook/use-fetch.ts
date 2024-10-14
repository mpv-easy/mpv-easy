import { useRef, useState } from "react"
import { useIsomorphicLayoutEffect } from "./share"
import { dequal } from "dequal/lite"
export type StateDependencies = {
  data: boolean
  error: boolean
  isLoading: boolean
}

export function useFetch<T, E = Error>(
  url: string,
  fetcher: (url: string) => Promise<T>,
):
  | { data: undefined; error: undefined; isLoading: true }
  | { data: undefined; error: E; isLoading: false }
  | { data: T; error: undefined | false; isLoading: false } {
  const stateDependencies = useRef<StateDependencies>({
    data: false,
    error: false,
    isLoading: false,
  }).current

  const [returnedData, setReturnedData] = useState<T>()
  const [error, setError] = useState<E | false>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useIsomorphicLayoutEffect(() => {
    setIsLoading(true)
    fetcher(url)
      .then((data) => {
        if (stateDependencies.data && !dequal(data, returnedData)) {
          setReturnedData(data)
        }
        setError(false)
        setIsLoading(false)
      })
      .catch((e) => {
        setIsLoading(false)
        setError(e)
      })
  }, [url])

  return {
    get data() {
      stateDependencies.data = true
      return returnedData
    },
    get error() {
      stateDependencies.error = true
      return error
    },
    // get isValidating() {
    //   stateDependencies.isValidating = true
    //   return isValidating
    // },
    get isLoading() {
      stateDependencies.isLoading = true
      return isLoading
    },
  } as any
}
