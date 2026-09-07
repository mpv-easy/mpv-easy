import { Download } from "@mui/icons-material"
import {
  Checkbox,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
} from "@mui/material"
import React, { useState } from "react"
import { MAX_ZIP_SIZE, NAME_WIDTH } from "../constants"
import type { DataType } from "../types"

const SIZE_WIDTH = 90

/**
 * Format a byte count into a human-readable string, e.g. 1536 -> "1.5 KB".
 */
function formatSize(size: number): string {
  const units = ["B", "KB", "MB", "GB"]
  let value = size
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[unit]}`
}

const OVER_LIMIT_MESSAGE = `Exceeds GitHub's ${formatSize(
  MAX_ZIP_SIZE,
)} browser limit; in-browser installation is not supported, please install manually.`

interface ScriptTableProps {
  tableData: DataType[]
  selectedRowKeys: string[]
  uiRequires: readonly string[]
  includes: string[]
  onRowSelect: (record: DataType, selected: boolean) => void
  onDownloadScript: (script: DataType) => void
}

/**
 * Script listing table with pagination.
 * Manages its own page/rowsPerPage state.
 */
export function ScriptTable({
  tableData,
  selectedRowKeys,
  uiRequires,
  includes,
  onRowSelect,
  onDownloadScript,
}: ScriptTableProps) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const paginatedData = tableData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  )

  return (
    <TableContainer
      component={Paper}
      sx={{
        width: "calc(100vw - 32px)",
        maxWidth: "100%",
        maxHeight: "60vh",
        overflow: "auto",
      }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" />
            <TableCell sx={{ width: NAME_WIDTH }}>name</TableCell>
            <TableCell>description</TableCell>
            <TableCell>author</TableCell>
            <TableCell align="right" sx={{ width: SIZE_WIDTH }}>
              size
            </TableCell>
            <TableCell>download</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedData.map((row) => {
            const isOverLimit = !!row.size && row.size > MAX_ZIP_SIZE
            const isSelected =
              selectedRowKeys.includes(row.name) ||
              uiRequires.includes(row.name)
            const isDisabled =
              isOverLimit ||
              uiRequires.includes(row.name) ||
              includes.includes(row.name)

            const checkbox = (
              <Checkbox
                checked={isSelected}
                disabled={isDisabled}
                onChange={(e) => onRowSelect(row, e.target.checked)}
              />
            )

            return (
              <TableRow key={row.key} hover>
                <TableCell padding="checkbox">
                  {isOverLimit ? (
                    <Tooltip title={OVER_LIMIT_MESSAGE}>
                      <span>{checkbox}</span>
                    </Tooltip>
                  ) : (
                    checkbox
                  )}
                </TableCell>
                <TableCell sx={{ width: NAME_WIDTH }}>
                  <Link
                    href={row.homepage}
                    target="_blank"
                    rel="noreferrer"
                    underline="hover"
                  >
                    {row.name}
                  </Link>
                </TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.author}</TableCell>
                <TableCell
                  align="right"
                  sx={{
                    width: SIZE_WIDTH,
                    color: isOverLimit ? "warning.main" : "inherit",
                  }}
                >
                  {typeof row.size === "number" && Number.isFinite(row.size)
                    ? formatSize(row.size)
                    : "-"}
                </TableCell>
                <TableCell>
                  {isOverLimit ? (
                    <Tooltip title={OVER_LIMIT_MESSAGE}>
                      <span>
                        <IconButton
                          size="small"
                          disabled
                          aria-label={`${row.name} download unavailable`}
                        >
                          <Download />
                        </IconButton>
                      </span>
                    </Tooltip>
                  ) : (
                    <IconButton
                      size="small"
                      onClick={() => onDownloadScript(row)}
                    >
                      <Download />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={tableData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </TableContainer>
  )
}
