import { Box, Typography } from "@mui/material"

/**
 * Full-screen loading indicator shown while initial data is being fetched.
 */
export function LoadingScreen() {
  return (
    <Box
      className="main"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h5">Loading...</Typography>
    </Box>
  )
}
