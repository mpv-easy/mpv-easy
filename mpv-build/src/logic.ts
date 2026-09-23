import { encode, File, Fmt } from "@easy-install/easy-archive"
import {
  checkConflict,
  IncludesMap,
  installScript,
  tryFix,
} from "@mpv-easy/mpsm"
import { parseGitHubUrl } from "@mpv-easy/tool"
import type Fuse from "fuse.js"
import { download as downloadRepo } from "jdl"
import { useCallback, useRef } from "react"
import {
  getCdnFileUrl,
  getDenoUrl,
  getFfmpegUrl,
  getPlayWithUrl,
  getYtdlpUrl,
  UI_LIST,
} from "./constants"
import {
  downloadBinary,
  downloadBinaryFile,
  downloadExternal,
  getMpvFiles,
  getScriptDownloadURL,
  getScriptFiles,
} from "./download"
import {
  addLocalPackage,
  decodeArchive,
  getLocalPackage,
  getLocalPackages,
  hasExternals,
  hasScriptFile,
  isArchive,
  readScriptJson,
} from "./local"
import type { DataType, Store, UI } from "./types"

/** Minimal shape of a dropped DOM File (name conflicts with archive File). */
export interface DroppedFile {
  name: string
  arrayBuffer: () => Promise<ArrayBuffer>
}

/**
 * Insert a local package into a script map, taking priority over any
 * existing entry with the same `name`. Matching on `name` (not just the map
 * key) also drops stale remote entries whose key differs from their name.
 */
function setLocalPriority(
  record: Record<string, DataType>,
  script: DataType,
): Record<string, DataType> {
  for (const key of Object.keys(record)) {
    if (key !== script.name && record[key]?.name === script.name) {
      delete record[key]
    }
  }
  record[script.name] = script
  return record
}

export function useAppActions(
  store: Store,
  setErrorMsg: (msg: string | null) => void,
) {
  const {
    data,
    tableData,
    selectedRowKeys,
    externalList,
    ui,
    platform,
    repos,
    setData,
    setTableData,
    setSpinning,
    setSelectedKeys,
    setRepos,
  } = store

  const fuseRef = useRef<Fuse<any> | null>(null)

  const allDeps = [
    ...selectedRowKeys,
    ...(UI_LIST.find((i) => i.name === ui)?.requires || []),
  ]

  const installDeps = useCallback(
    async (files: File[]) => {
      const depPromises = allDeps.map(async (i) => {
        const script = data[i]
        if (!script) return null
        try {
          // Virtual packages are decoded from the dropped archive directly.
          if (script.local) {
            const pkg = getLocalPackage(script.name)
            if (!pkg) return null
            const files = decodeArchive(pkg.fileName, pkg.bytes)
            if (!files) return null
            return { key: i, script, files }
          }

          if (script.repo) {
            const { user, repo } = script.repo
            const repoFiles = await downloadRepo(user, repo)
            const v = repoFiles
              .filter((f) => !f.isDir)
              .map(
                ({ path, buffer }) =>
                  new File(path, buffer!, undefined, false, null),
              )
            return { key: i, script, files: v }
          }

          const scriptFiles = await getScriptFiles(script)
          return { key: i, script, files: scriptFiles }
        } catch (e) {
          console.error("installDeps download failed for", i, e)
          return null
        }
      })

      const results = await Promise.all(depPromises)
      for (const res of results) {
        if (!res) continue
        const { key, script, files: fetchedFiles } = res
        const fixFiles = tryFix(fetchedFiles, script)
        installScript(files, fixFiles, data[key])
      }
    },
    [allDeps, data],
  )

  const zipPortableConfig = useCallback(async () => {
    const files: File[] = []
    await installDeps(files)
    const portableConfigFiles = files.filter((i) =>
      i.path.startsWith("portable_config/"),
    )
    if (!portableConfigFiles.length) {
      console.warn("No portable_config files found")
      return
    }
    for (const i of portableConfigFiles) {
      i.path = i.path.replace("portable_config/", "")
    }
    const zipBinary = encode(Fmt.Zip, portableConfigFiles)
    if (!zipBinary) {
      console.error("zip file error")
      return
    }
    return zipBinary
  }, [installDeps])

  const zipAll = useCallback(async () => {
    const mpvPromise = getMpvFiles(platform)

    // Download external tools in parallel to speed up the process
    const externalPromises: Promise<File[]>[] = []
    if (externalList.includes("ffmpeg")) {
      externalPromises.push(downloadExternal(getFfmpegUrl()))
    }
    if (externalList.includes("yt-dlp")) {
      externalPromises.push(downloadExternal(getYtdlpUrl()))
    }
    if (externalList.includes("play-with")) {
      externalPromises.push(downloadExternal(getPlayWithUrl()))
    }
    if (externalList.includes("deno")) {
      externalPromises.push(downloadExternal(getDenoUrl()))
    }

    const allPromises = [
      mpvPromise.catch((e) => {
        console.error("mpv download failed:", e)
        return [] as File[]
      }),
      ...externalPromises.map((p) =>
        p.catch((e) => {
          console.error("external download failed:", e)
          return [] as File[]
        }),
      ),
    ]

    const results = await Promise.all(allPromises)
    const mpvFiles = results[0] as File[]
    for (let index = 1; index < results.length; index += 1) {
      for (const f of results[index]!) mpvFiles.push(f)
    }

    await installDeps(mpvFiles)

    const zipBinary = encode(Fmt.Zip, mpvFiles)
    if (!zipBinary) {
      console.error("zip file error")
      return
    }
    return zipBinary
  }, [platform, externalList, installDeps])

  const downloadName = ui === "mpv-easy" ? "mpv-easy" : `mpv-${ui}`

  const download = useCallback(async () => {
    setSpinning(true)
    try {
      await new Promise((r) => setTimeout(r))
      const zipBinary = await zipAll()
      if (zipBinary) {
        downloadBinaryFile(`${downloadName}.zip`, zipBinary)
      }
    } catch (e) {
      console.error("download error:", e)
      setErrorMsg(String(e))
    } finally {
      setSpinning(false)
    }
  }, [setSpinning, zipAll, downloadName, setErrorMsg])

  const downloadPortableConfig = useCallback(async () => {
    setSpinning(true)
    try {
      await new Promise((r) => setTimeout(r))
      const zipBinary = await zipPortableConfig()
      if (zipBinary) {
        downloadBinaryFile("portable_config.zip", zipBinary)
      }
    } catch (e) {
      console.error("downloadPortableConfig error:", e)
      setErrorMsg(String(e))
    } finally {
      setSpinning(false)
    }
  }, [setSpinning, zipPortableConfig, setErrorMsg])

  const resetData = useCallback(async () => {
    const META_URL = getCdnFileUrl("scripts-full.json")

    const fetched: Record<string, DataType> = await fetch(META_URL)
      .then((i) => i.text())
      .then((text) => JSON.parse(text))

    for (const i in fetched) {
      fetched[i].key = i
    }

    for (const { user, repo } of repos) {
      const key = `${user}-${repo}`
      const homepage = `https://github.com/${user}/${repo}`
      const info: DataType = {
        key,
        name: key,
        scriptName: repo,
        download: key,
        author: user,
        description: homepage,
        homepage,
        repo: { user, repo },
      }
      fetched[key] = info
    }

    // Dropped virtual packages take priority over same-named entries.
    for (const { script } of getLocalPackages()) {
      setLocalPriority(fetched, {
        ...script,
        key: `local-${script.name}`,
        download: script.download ?? "",
        local: true,
      })
    }

    setData(fetched)

    const selectedData = selectedRowKeys.map((i) => fetched[i])
    const newTableData = Object.values(fetched)
      .sort(() => 0.5 - Math.random())
      .filter((i) => !selectedRowKeys.includes(i.name))

    setTableData([...selectedData, ...newTableData])
    fuseRef.current = new (await import("fuse.js")).default(
      Object.values(fetched),
      { keys: ["name"] },
    )
  }, [repos, selectedRowKeys, setData, setTableData])

  const handleSearch = useCallback(
    (searchValue: string) => {
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
      }
    },
    [selectedRowKeys, repos, setSelectedKeys, setRepos, setTableData],
  )

  /**
   * Register dropped archives as virtual script packages.
   * Kept in memory only, so they can be tested without publishing first.
   */
  const addLocalPackages = useCallback(
    async (dropped: DroppedFile[]) => {
      const errors: string[] = []
      const addedMap = new Map<string, DataType>()

      for (const file of dropped) {
        // 1. Unsupported compression format.
        if (!isArchive(file.name)) {
          errors.push(`unsupported archive format: ${file.name}`)
          continue
        }

        const bytes = new Uint8Array(await file.arrayBuffer())

        // 2. Corrupt or unreadable archive.
        const files = decodeArchive(file.name, bytes)
        if (!files) {
          errors.push(`failed to decode archive: ${file.name}`)
          continue
        }

        // 3. Missing script.json metadata.
        const meta = readScriptJson(files)
        if (!meta) {
          errors.push(`script.json not found in ${file.name}`)
          continue
        }

        // 4. Package contains no script (.js/.lua) entry.
        if (!hasScriptFile(files) && !hasExternals(files)) {
          errors.push(`no script (.js/.lua) or externals found in ${file.name}`)
          continue
        }

        const script: DataType = {
          ...meta,
          key: `local-${meta.name}`,
          download: meta.download ?? "",
          size: bytes.byteLength,
          local: true,
        }
        addLocalPackage({ script, fileName: file.name, bytes })
        addedMap.set(script.name, script)
      }

      const added = [...addedMap.values()]
      if (added.length) {
        const nextData = { ...data }
        for (const script of added) {
          setLocalPriority(nextData, script)
        }
        setData(nextData)

        // Local packages win the table: drop same-named entries and prepend.
        const addedNames = new Set(addedMap.keys())
        setTableData([
          ...added,
          ...tableData.filter((i) => !addedNames.has(i.name)),
        ])
        setSelectedKeys([...new Set([...selectedRowKeys, ...addedNames])])
      }

      if (errors.length) {
        setErrorMsg(errors.join("; "))
      }

      return added
    },
    [
      data,
      tableData,
      selectedRowKeys,
      setData,
      setTableData,
      setSelectedKeys,
      setErrorMsg,
    ],
  )

  const handleDownloadScript = useCallback(
    async (script: DataType | DataType[]) => {
      const downloadOne = async (s: DataType) => {
        try {
          // Virtual packages: hand back the original dropped archive.
          if (s.local) {
            const pkg = getLocalPackage(s.name)
            if (pkg) {
              downloadBinaryFile(pkg.fileName, pkg.bytes)
            }
            return
          }

          if (s.repo) {
            const files = await downloadRepo(s.repo.user, s.repo.repo)
            const v = files
              .filter((i) => !i.isDir)
              .map(
                ({ path, buffer }) =>
                  new File(path, buffer!, undefined, false, null),
              )
            const zipBinary = encode(Fmt.Zip, v)
            if (zipBinary) {
              downloadBinaryFile(`${s.repo!.repo}.zip`, zipBinary)
            }
            return
          }

          const bin = await downloadBinary(getScriptDownloadURL(s.name))
          downloadBinaryFile(`${s.name}.zip`, bin)
        } catch (e) {
          console.error("handleDownloadScript error for", s.name || s, e)
          // report the first error to UI
          setErrorMsg(String(e))
        }
      }

      if (Array.isArray(script)) {
        await Promise.all(script.map((s) => downloadOne(s)))
      } else {
        await downloadOne(script)
      }
    },
    [setErrorMsg],
  )

  return {
    fuseRef,
    downloadName,
    allDeps,
    download,
    downloadPortableConfig,
    resetData,
    handleSearch,
    handleDownloadScript,
    addLocalPackages,
  }
}

export function getConflicts(selectedRowKeys: string[], ui: UI) {
  return checkConflict([
    ...selectedRowKeys,
    ...(UI_LIST.find((i) => i.name === ui)?.requires || []),
  ])
}

export function getIncludes(ui: UI): string[] {
  return IncludesMap[ui] || []
}
