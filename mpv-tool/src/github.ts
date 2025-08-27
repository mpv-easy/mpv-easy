export type Repo = {
  user: string
  repo: string
  bracnch?: string
}

export function parseGitHubUrl(url: string): Repo | undefined {
  try {
    const u = new URL(url)
    if (u.hostname !== "github.com") return

    const parts = u.pathname.split("/").filter(Boolean)
    if (parts.length < 2) return

    return {
      user: parts[0],
      repo: parts[1],
    }
  } catch (_e) {
    return
  }
}
