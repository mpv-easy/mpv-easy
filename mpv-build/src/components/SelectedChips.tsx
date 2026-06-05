import { Chip, Stack } from "@mui/material"
import type { DataType, Platform } from "../types"

interface SelectedChipsProps {
  platform: Platform
  uiRequires: readonly string[]
  externalList: string[]
  selectedRowKeys: string[]
  data: Record<string, DataType>
  onDeleteSelected: (key: string) => void
}

/**
 * Displays selected items as chips: platform, UI requires, externals, and user-selected scripts.
 */
export function SelectedChips({
  platform,
  uiRequires,
  externalList,
  selectedRowKeys,
  data,
  onDeleteSelected,
}: SelectedChipsProps) {
  return (
    <Stack
      sx={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 1,
        justifyContent: "center",
      }}
    >
      <Chip label={platform} color="primary" variant="outlined" />
      {uiRequires.map(
        (i, index) =>
          data[i] && (
            <Chip
              key={data[i]?.key + index}
              label={data[i]?.name}
              color="success"
              variant="outlined"
            />
          ),
      )}
      {externalList.map((i) => (
        <Chip key={i} label={i} color="success" variant="outlined" />
      ))}
      {selectedRowKeys.map((i, index) => (
        <Chip
          key={data[i]?.key + index}
          label={data[i]?.name}
          color="success"
          variant="outlined"
          onDelete={() => onDeleteSelected(i)}
        />
      ))}
    </Stack>
  )
}
