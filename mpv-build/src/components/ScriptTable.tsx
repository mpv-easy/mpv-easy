import React, { useState } from "react"
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
} from "@mui/material"
import { Download } from "@mui/icons-material"
import { NAME_WIDTH } from "../constants"
import type { DataType } from "../types"

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
            <TableCell>download</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedData.map((row) => {
            const isSelected =
              selectedRowKeys.includes(row.name) ||
              uiRequires.includes(row.name)
            const isDisabled =
              uiRequires.includes(row.name) || includes.includes(row.name)

            return (
              <TableRow key={row.key} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={(e) => onRowSelect(row, e.target.checked)}
                  />
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
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => onDownloadScript(row)}
                  >
                    <Download />
                  </IconButton>
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
