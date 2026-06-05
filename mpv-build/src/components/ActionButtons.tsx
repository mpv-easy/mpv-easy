import { Button, Stack } from "@mui/material"
import { Download } from "@mui/icons-material"

interface ActionButtonsProps {
  downloadName: string
  onReset: () => void
  onDownload: () => void
  onDownloadPortableConfig: () => void
}

/**
 * Action buttons: Reset, Download full zip, Download portable_config.
 */
export function ActionButtons({
  downloadName,
  onReset,
  onDownload,
  onDownloadPortableConfig,
}: ActionButtonsProps) {
  return (
    <Stack
      sx={{
        flexDirection: "row",
        gap: 1,
      }}
    >
      <Button variant="contained" color="error" size="large" onClick={onReset}>
        Reset
      </Button>
      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<Download />}
        onClick={onDownload}
      >
        {downloadName}.zip
      </Button>
      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<Download />}
        onClick={onDownloadPortableConfig}
      >
        portable_config.zip
      </Button>
    </Stack>
  )
}
