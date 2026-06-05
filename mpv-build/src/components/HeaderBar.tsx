import { IconButton, Link, Stack } from "@mui/material"
import {
  GitHub,
  DarkMode,
  LightMode,
  X as XIcon,
  YouTube as YouTubeIcon,
} from "@mui/icons-material"

interface HeaderBarProps {
  isDark: boolean
  onToggleTheme: () => void
}

/**
 * Top-right header with social links (GitHub, YouTube, X) and theme toggle.
 */
export function HeaderBar({ isDark, onToggleTheme }: HeaderBarProps) {
  return (
    <Stack
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 1,
        alignItems: "center",
        position: "absolute",
        top: "1rem",
        right: "1rem",
      }}
    >
      <Link
        href="https://github.com/mpv-easy/mpv-easy"
        target="_blank"
        color="inherit"
      >
        <GitHub />
      </Link>
      <Link
        href="https://www.youtube.com/@mpveasy"
        target="_blank"
        color="inherit"
      >
        <YouTubeIcon />
      </Link>
      <Link href="https://x.com/mpv_easy" target="_blank" color="inherit">
        <XIcon />
      </Link>
      <IconButton onClick={onToggleTheme} color="inherit">
        {isDark ? <LightMode /> : <DarkMode />}
      </IconButton>
    </Stack>
  )
}
