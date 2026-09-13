import { Box, Typography } from "@mui/material"
import type { SxProps, Theme } from "@mui/material/styles"
import React, { useCallback, useState } from "react"
import type { DroppedFile } from "../logic"

interface DropZoneProps {
  onDropFiles: (files: DroppedFile[]) => void
  className?: string
  sx?: SxProps<Theme>
  children: React.ReactNode
}

/**
 * Wraps the app and accepts dropped archive files.
 * Shows a full-zone overlay while a file is dragged over the page.
 */
export function DropZone({
  onDropFiles,
  className,
  sx,
  children,
}: DropZoneProps) {
  const [dragging, setDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.types.includes("Files")) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    // Ignore dragleave fired when moving between child elements.
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
    setDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragging(false)
      const files = Array.from(e.dataTransfer.files)
      if (files.length) {
        onDropFiles(files)
      }
    },
    [onDropFiles],
  )

  return (
    <Box
      className={className}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{ position: "relative", ...sx }}
    >
      {children}
      {dragging && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            border: "3px dashed",
            borderColor: "primary.main",
          }}
        >
          <Typography variant="h5" color="common.white">
            Drop script package (.zip) to test locally
          </Typography>
        </Box>
      )}
    </Box>
  )
}
