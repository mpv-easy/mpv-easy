import { useMemo, useState } from "react"
import { createTheme } from "@mui/material"

/**
 * Custom hook for managing theme state and MUI theme object.
 * Detects system preference on mount and provides toggle.
 */
export function useAppTheme() {
  const [isDark, setIsDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  )

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? "dark" : "light",
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
              },
            },
          },
        },
      }),
    [isDark],
  )

  const toggleTheme = () => setIsDark((prev) => !prev)

  return { isDark, theme, toggleTheme }
}
