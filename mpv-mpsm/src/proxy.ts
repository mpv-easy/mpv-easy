import { ProxyAgent } from "undici"

function getProxyAgent(proxyUrl: string): ProxyAgent | undefined {
  if (!proxyUrl) return undefined

  try {
    return new ProxyAgent(proxyUrl)
  } catch (error) {
    console.error("Failed to create ProxyAgent:", error)
    return undefined
  }
}

export function getProxyFromEnv(): ProxyAgent | undefined {
  const envProxy =
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy
  if (!envProxy) return undefined
  return getProxyAgent(envProxy)
}
