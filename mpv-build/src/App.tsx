import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Stack,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Link,
  Tooltip,
  Chip,
  Alert,
  Backdrop,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
} from "@mui/material"
import {
  Download,
  GitHub,
  DarkMode,
  LightMode,
  Search,
  X as XIcon,
  YouTube as YouTubeIcon,
} from "@mui/icons-material"
import Fuse from "fuse.js"
import { decode, encode, File, Fmt, guess } from "@easy-install/easy-archive"
import {
  IncludesMap,
  checkConflict,
  installScript,
  tryFix,
} from "@mpv-easy/mpsm"

import { create } from "zustand"
import { persist, StateStorage, createJSONStorage } from "zustand/middleware"
import { parseGitHubUrl, Repo } from "@mpv-easy/tool"
import { download as downloadRepo } from "jdl"
import {
  DataType,
  DEFAULT_STATE,
  downloadBinary,
  downloadBinaryFile,
  ExternalList,
  getCdnFileUrl,
  getFfmpegUrl,
  getMpvFiles,
  getPlayWithUrl,
  getScriptDownloadURL,
  getScriptFiles,
  getYtdlpUrl,
  Platform,
  PLATFORM_LIST,
  State,
  Store,
  UI,
  UI_LIST,
} from "./tool"

const TITLE_WIDTH = 150
const ITEM_WIDTH = 150
const NAME_WIDTH = 250

const hashStorage: StateStorage = {
  getItem: (key): string => {
    const searchParams = new URLSearchParams(location.hash.slice(1))
    const storedValue = searchParams.get(key) ?? ""
    return JSON.parse(storedValue)
  },
  setItem: (key, newValue): void => {
    const searchParams = new URLSearchParams(location.hash.slice(1))
    searchParams.set(key, JSON.stringify(newValue))
    location.hash = searchParams.toString()
  },
  removeItem: (key): void => {
    const searchParams = new URLSearchParams(location.hash.slice(1))
    searchParams.delete(key)
    location.hash = searchParams.toString()
  },
}

const useMpvStore = create<Store>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,
      setData: (data: Record<string, DataType>) => set({ ...get(), data }),
      setTableData: (tableData: DataType[]) => set({ ...get(), tableData }),
      setSpinning: (spinning: boolean) => set({ ...get(), spinning }),
      setSelectedKeys: (selectedRowKeys: string[]) =>
        set({ ...get(), selectedRowKeys }),
      setExternalList: (externalList: string[]) =>
        set({ ...get(), externalList }),
      setUI: (ui: UI) => set({ ...get(), ui }),
      setPlatform: (platform: Platform) => set({ ...get(), platform }),
      setState: (state: State) => {
        set({ ...get(), ...state })
      },
      setRepos: (repos: Repo[]) => set({ ...get(), repos }),
    }),
    {
      name: "mpv-build",
      storage: createJSONStorage(() => hashStorage),
      version: undefined,
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !["data", "tableData", "spinning"].includes(key),
          ),
        ),
    },
  ),
)

function App() {
  const store = useMpvStore()
  const fuseRef = useRef<Fuse<any> | null>(null)
  const {
    data,
    tableData,
    spinning,
    selectedRowKeys,
    externalList,
    ui,
    setData,
    setTableData,
    setSpinning,
    setUI,
    setSelectedKeys,
    setExternalList,
    platform,
    setPlatform,
    setState,
    repos,
    setRepos,
  } = store

  const downloadName = ui === "mpv-easy" ? "mpv-easy" : `mpv-${ui}`
  const [isDark, setIsDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  )
  const [searchValue, setSearchValue] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? "dark" : "light",
        },
      }),
    [isDark],
  )

  const uiRequires: readonly string[] =
    UI_LIST.find((i) => i.name === ui)?.requires || []

  const reset = () => {
    setState({ ...DEFAULT_STATE, data, tableData })
    setPage(0)
  }

  const allDeps = [
    ...selectedRowKeys,
    ...(UI_LIST.find((i) => i.name === ui)?.requires || []),
  ]

  const installDeps = async (files: File[]) => {
    for (const i of allDeps) {
      const script = data[i]
      if (script.repo) {
        const { user, repo } = script.repo
        const repoFiles = await downloadRepo(user, repo)
        const v = repoFiles
          .filter((i) => !i.isDir)
          .map(
            ({ path, buffer }) =>
              new File(path, buffer!, undefined, false, null),
          )
        const fixFiles = tryFix(v, script)
        const key = `${user}-${repo}`
        installScript(files, fixFiles, data[key])
      } else {
        const scriptFiles = await getScriptFiles(data[i])
        const fixFiles = tryFix(scriptFiles, script)
        installScript(files, fixFiles, data[i])
      }
    }
  }

  const zipPortableConfig = async () => {
    const files: File[] = []
    await installDeps(files)
    for (const i of files) {
      i.path = i.path.replace("portable_config/", "")
    }
    const zipBinary = encode(Fmt.Zip, files)
    if (!zipBinary) {
      console.log("zip file error")
      return
    }
    return zipBinary
  }

  const zipAll = async () => {
    const mpvFiles = await getMpvFiles(platform)

    if (externalList.includes("ffmpeg")) {
      const url = getFfmpegUrl()
      const ffmpegBinary = await downloadBinary(url)
      const files = decode(guess(url)!, ffmpegBinary)!
      for (const i of files) {
        mpvFiles.push(i)
      }
    }

    if (externalList.includes("yt-dlp")) {
      const url = getYtdlpUrl()
      const bin = await downloadBinary(url)
      const files = decode(guess(url)!, bin)!
      for (const i of files) {
        mpvFiles.push(i)
      }
    }

    if (externalList.includes("play-with")) {
      const url = getPlayWithUrl()
      const bin = await downloadBinary(url)
      const files = decode(guess(url)!, bin)!
      for (const i of files) {
        mpvFiles.push(i)
      }
    }

    await installDeps(mpvFiles)

    const zipBinary = encode(Fmt.Zip, mpvFiles)
    if (!zipBinary) {
      console.log("zip file error")
      return
    }
    return zipBinary
  }

  const download = async () => {
    setSpinning(true)
    await new Promise((r) => setTimeout(r))
    const zipBinary = await zipAll()
    setSpinning(false)
    if (zipBinary) {
      downloadBinaryFile(`${downloadName}.zip`, zipBinary)
    }
  }

  const downloadPortableConfig = async () => {
    setSpinning(true)
    await new Promise((r) => setTimeout(r))
    const zipBinary = await zipPortableConfig()
    setSpinning(false)
    if (zipBinary) {
      downloadBinaryFile("portable_config.zip", zipBinary)
    }
  }

  const resetData = async () => {
    const META_URL = getCdnFileUrl("scripts-full.json")

    const data: Record<string, DataType> = await fetch(META_URL)
      .then((i) => i.text())
      .then((text) => JSON.parse(text))

    for (const i in data) {
      data[i].key = i
    }

    for (const { user, repo } of repos) {
      const key = `${user}-${repo}`
      const homepage = `https://github.com/${user}/${repo}`
      const info: DataType = {
        key,
        name: key,
        download: key,
        author: user,
        description: homepage,
        homepage,
        repo: { user, repo },
      }
      data[key] = info
    }

    setData(data)

    const selectedData = selectedRowKeys.map((i) => data[i])
    const newTableData = Object.values(data)
      .sort(() => 0.5 - Math.random())
      .filter((i) => !selectedRowKeys.includes(i.name))

    setTableData([...selectedData, ...newTableData])
    fuseRef.current = new Fuse(Object.values(data), {
      keys: ["name"],
    })
  }

  useEffect(() => {
    resetData()
  }, [])

  useEffect(() => {
    resetData()
  }, [repos])

  const handleSearch = () => {
    const value = searchValue.trim()
    if (!value) return

    const gh = parseGitHubUrl(value)
    if (gh) {
      setSelectedKeys([
        ...new Set([...selectedRowKeys, `${gh.user}-${gh.repo}`]),
      ])
      setRepos([...new Set([...repos, gh])])
      return
    }

    const v = fuseRef.current?.search(value)
    if (v?.length) {
      setTableData(v.map((i) => i.item))
      setPage(0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleRowSelect = (record: DataType, selected: boolean) => {
    if (selected) {
      setSelectedKeys([...selectedRowKeys, record.name])
    } else {
      setSelectedKeys([...selectedRowKeys].filter((i) => i !== record.name))
    }
  }

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleDownloadScript = async (script: DataType) => {
    if (script.repo) {
      const files = await downloadRepo(script.repo.user, script.repo.repo)
      const v = files
        .filter((i) => !i.isDir)
        .map(
          ({ path, buffer }) => new File(path, buffer!, undefined, false, null),
        )
      const zipBinary = encode(Fmt.Zip, v)
      if (zipBinary) {
        downloadBinaryFile(`${script.repo.repo}.zip`, zipBinary)
      }
      return
    }

    const bin = await downloadBinary(getScriptDownloadURL(script.name))
    downloadBinaryFile(`${script.name}.zip`, bin)
  }

  if (!Object.keys(data).length) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          className="main"
          display="flex"
          flexDirection="column"
          gap={1}
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <Typography variant="h5">Loading...</Typography>
        </Box>
      </ThemeProvider>
    )
  }

  const conflicts = checkConflict([
    ...selectedRowKeys,
    ...(UI_LIST.find((i) => i.name === ui)?.requires || []),
  ])
  const includes = IncludesMap[ui] || []
  const paginatedData = tableData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        className={["main", isDark ? "main-dark" : "main-light"].join(" ")}
        display="flex"
        flexDirection="column"
        gap={1}
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        p={2}
      >
        {/* Header with social links and theme toggle */}
        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          sx={{ position: "absolute", top: "1rem", right: "1rem" }}
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
          <IconButton onClick={() => setIsDark(!isDark)} color="inherit">
            {isDark ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Stack>

        {/* Configuration section */}
        <Stack gap={1} alignItems="flex-start">
          {/* Platform selection */}
          <Stack direction="row" gap={1} alignItems="center">
            <Tooltip title="mpv-v3 is for newer CPUs (usually after 2005). If it doesn't run, please use mpv">
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ width: TITLE_WIDTH }}
              >
                Platform:
              </Typography>
            </Tooltip>
            <RadioGroup
              row
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
            >
              {PLATFORM_LIST.map((i) => (
                <Tooltip
                  key={i}
                  placement="top"
                  title={
                    i === "mpv"
                      ? `Typically, you should use mpv-v3 unless it fails to run or you're using an older CPU (manufactured around 2015 or earlier).`
                      : ""
                  }
                >
                  <FormControlLabel
                    value={i}
                    control={<Radio />}
                    label={i}
                    sx={{ width: ITEM_WIDTH }}
                  />
                </Tooltip>
              ))}
            </RadioGroup>
          </Stack>

          {/* UI selection */}
          <Stack direction="row" gap={1} alignItems="center">
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ width: TITLE_WIDTH }}
            >
              UI:
            </Typography>
            <RadioGroup
              row
              value={ui}
              onChange={(e) => {
                const newUI = e.target.value as UI
                setUI(newUI)
                const deps = UI_LIST.find((i) => i.name === newUI)?.deps || []
                setSelectedKeys([...deps])
              }}
            >
              {UI_LIST.map((i) => (
                <FormControlLabel
                  key={i.name}
                  value={i.name}
                  control={<Radio />}
                  label={
                    <Link href={i.repo} target="_blank" underline="hover">
                      {i.name}
                    </Link>
                  }
                  sx={{ width: ITEM_WIDTH }}
                />
              ))}
            </RadioGroup>
          </Stack>

          {/* External tools selection */}
          <Stack direction="row" gap={1} alignItems="center">
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ width: TITLE_WIDTH }}
            >
              External:
            </Typography>
            <FormGroup row>
              {ExternalList.map((i) => (
                <FormControlLabel
                  key={i}
                  control={
                    <Checkbox
                      checked={externalList.includes(i)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExternalList([...externalList, i])
                        } else {
                          setExternalList(externalList.filter((x) => x !== i))
                        }
                      }}
                    />
                  }
                  label={i}
                  sx={{ width: ITEM_WIDTH }}
                />
              ))}
            </FormGroup>
          </Stack>
        </Stack>

        {/* Search input */}
        <TextField
          placeholder="input script name or https://github.com/<user>/<repo>"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ width: "100%", maxWidth: 800 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} edge="end">
                  <Search />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Table */}
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
                        onChange={(e) => handleRowSelect(row, e.target.checked)}
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
                        onClick={() => handleDownloadScript(row)}
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

        {/* Loading backdrop */}
        <Backdrop open={spinning} sx={{ zIndex: 9999 }}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {/* Selected items chips */}
        <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center">
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
              onDelete={() => {
                const idx = selectedRowKeys.indexOf(data[i]?.key)
                if (idx !== -1) {
                  const v = [...selectedRowKeys]
                  v.splice(idx, 1)
                  setSelectedKeys(v)
                }
              }}
            />
          ))}
        </Stack>

        {/* Action buttons */}
        <Stack direction="row" gap={1}>
          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={reset}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Download />}
            onClick={download}
          >
            {downloadName}.zip
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Download />}
            onClick={downloadPortableConfig}
          >
            portable_config.zip
          </Button>
        </Stack>

        {/* Conflict alert */}
        {!!conflicts.length && (
          <Alert severity="error">conflict: {conflicts.join(" ")}</Alert>
        )}
      </Box>
    </ThemeProvider>
  )
}

export default App
