import { Download, OpenInNew, QuestionMark } from "@mui/icons-material"
import {
  Box,
  Checkbox,
  Chip,
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

const DEVICON_BASE = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons"

/** Devicon icon path and display name for each known language. */
const LANG_ICON: Record<string, { path: string; label: string }> = {
  js: { path: "javascript/javascript-original", label: "JavaScript" },
  lua: { path: "lua/lua-original", label: "Lua" },
}

/**
 * Language badge shown before a script name.
 * Unknown languages fall back to a question mark.
 * Fixed width keeps names aligned across rows.
 */
function LangIcon({ lang }: { lang?: string }) {
  const meta = lang ? LANG_ICON[lang.toLowerCase()] : undefined
  return (
    <Tooltip title={meta?.label ?? "unknown language"}>
      <Box
        sx={{
          width: 18,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {meta ? (
          <Box
            component="img"
            src={`${DEVICON_BASE}/${meta.path}.svg`}
            alt={meta.label}
            loading="lazy"
            sx={{ width: 16, height: 16, display: "block" }}
          />
        ) : (
          <QuestionMark sx={{ fontSize: 16, color: "text.disabled" }} />
        )}
      </Box>
    </Tooltip>
  )
}

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
            // Local packages are in-memory test builds: the GitHub size limit
            // does not apply because nothing is uploaded or downloaded.
            const isOverLimit =
              !row.local && !!row.size && row.size > MAX_ZIP_SIZE
            const isSelected =
              selectedRowKeys.includes(row.name) ||
              uiRequires.includes(row.name)
            const isDisabled =
              isOverLimit ||
              uiRequires.includes(row.name) ||
              includes.includes(row.name)

            const checkboxProps = {
              checked: isSelected,
              disabled: isDisabled,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                onRowSelect(row, e.target.checked),
            }

            const checkbox = <Checkbox {...checkboxProps} />

            return (
              <TableRow key={row.key} hover>
                <TableCell padding="checkbox">
                  {isOverLimit ? (
                    <Tooltip title={OVER_LIMIT_MESSAGE}>
                      <span>
                        <Checkbox {...checkboxProps} sx={{ padding: 0 }} />
                      </span>
                    </Tooltip>
                  ) : (
                    checkbox
                  )}
                </TableCell>
                <TableCell sx={{ width: NAME_WIDTH }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LangIcon lang={row.lang} />
                    {row.homepage ? (
                      <Link
                        href={row.homepage}
                        target="_blank"
                        rel="noreferrer"
                        underline="hover"
                      >
                        {row.name}
                      </Link>
                    ) : (
                      row.name
                    )}
                    {row.local && (
                      <Chip
                        label="local"
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    )}
                  </Box>
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
                      <IconButton
                        component="a"
                        href={row.download}
                        target="_blank"
                        rel="noreferrer"
                        size="small"
                        color="warning"
                        aria-label={`${row.name} requires manual installation`}
                      >
                        <OpenInNew />
                      </IconButton>
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
