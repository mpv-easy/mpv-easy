import React, { useEffect, useRef } from "react"
import { Checkbox, Input, Tooltip } from "antd"
import type { GetProps } from "antd"
const { Search } = Input
type SearchProps = GetProps<typeof Input.Search>
import { Button, Flex, Spin, Table, type TableProps } from "antd"
import {
  DownloadOutlined,
  GithubOutlined,
  TwitterOutlined,
  YoutubeOutlined,
} from "@ant-design/icons"
import Fuse from "fuse.js"
import { Tag } from "antd"
import { Radio } from "antd"
import { decode, encode, File, Fmt, guess } from "@easy-install/easy-archive"
import { Typography } from "antd"
const { Title, Link } = Typography
import { Script, installScript } from "@mpv-easy/mpsm"
import { notification } from "antd"
import { useMount } from "react-use"
import { create } from "zustand"
import { persist, StateStorage, createJSONStorage } from "zustand/middleware"

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
interface Store {
  data: Record<string, DataType>
  tableData: DataType[]
  spinning: boolean
  selectedRowKeys: string[]
  externalList: string[]
  ui: UI
  platform: Platform
  setData: (data: Record<string, DataType>) => void
  setTableData: (tableData: DataType[]) => void
  setSpinning: (spinning: boolean) => void
  setSelectedKeys: (selectedRowKeys: string[]) => void
  setExternalList: (externalList: string[]) => void
  setUI: (ui: UI) => void
  setPlatform: (platform: Platform) => void
  setState: (state: State) => void
}

// TODO: support liunx
const PLATFORM_LIST = ["mpv", "mpv-v3"] as const
type Platform = (typeof PLATFORM_LIST)[number]

type State = {
  [K in keyof Store as Store[K] extends Function ? never : K]: Store[K]
}

const DEFAULT_STATE: State = {
  data: {},
  tableData: [],
  spinning: false,
  selectedRowKeys: [],
  externalList: [],
  ui: "mpv",
  platform: "mpv-v3",
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

const MAX_SCRIPT_COUNT = 32
const TITLE_WIDTH = 150
const ITEM_WIDTH = 150
const NAME_WIDTH = 250

interface DataType extends Script {
  key: string
}

function downloadBinaryFile(fileName: string, content: Uint8Array): void {
  const blob = new Blob([content], { type: "application/octet-stream" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  const name = fileName.split("/").at(-1) ?? fileName
  a.download = name
  a.href = url
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function getMpvV3Url() {
  return getDownloadUrl(
    "mpv-easy",
    "mpv-easy-cdn",
    "main",
    "mpv-v3-windows.tar.xz",
  )
}
function getMpvUrl() {
  return getDownloadUrl("mpv-easy", "mpv-easy-cdn", "main", "mpv-windows.zip")
}
function getPlayWithUrl() {
  return getDownloadUrl(
    "mpv-easy",
    "mpv-easy-cdn",
    "main",
    "mpv-easy-play-with-windows.exe",
  )
}
function getYtdlpUrl() {
  return getDownloadUrl("mpv-easy", "mpv-easy-cdn", "main", "yt-dlp.exe")
}
function getFfmpegUrl() {
  return getDownloadUrl(
    "mpv-easy",
    "mpv-easy-cdn",
    "main",
    "ffmpeg-windows.zip",
  )
}
function getFfmpegV3Url() {
  return getDownloadUrl(
    "mpv-easy",
    "mpv-easy-cdn",
    "main",
    "ffmpeg-v3-windows.zip",
  )
}

const UI_LIST = [
  {
    name: "mpv",
    info: {
      user: "mpv-easy",
      repo: "mpv-easy-cdn",
      tag: "main",
      file: "mpv-v3-windows.tar.xz",
    },
    repo: "https://github.com/mpv-player/mpv",
    deps: [],
  },
  {
    name: "mpv-uosc",
    info: {
      user: "mpv-easy",
      repo: "mpv-easy-cdn",
      tag: "main",
      file: "mpv-uosc-windows-full.tar.xz",
    },
    repo: "https://github.com/tomasklaen/uosc",
    deps: ["thumbfast", "uosc"],
  },
  {
    name: "mpv-easy",
    info: {
      user: "mpv-easy",
      repo: "mpv-easy-cdn",
      tag: "main",
      file: "mpv-easy-windows-full.tar.xz",
    },
    repo: "https://github.com/mpv-easy/mpv-easy",
    deps: [
      "thumbfast",
      "mpv-easy",
      "mpv-easy-anime4k",
      "mpv-easy-clipboard-play",
      "mpv-easy-copy-time",
      "mpv-easy-cut",
      "mpv-easy-translate",
      "mpv-easy-autoload",
      "mpv-easy-copy-screen",
      "mpv-easy-crop",
      "mpv-easy-thumbfast",
      "autoload",
    ],
  },
  {
    name: "mpv-modernx",
    info: {
      user: "mpv-easy",
      repo: "mpv-easy-cdn",
      tag: "main",
      file: "mpv-modernx-windows-full.tar.xz",
    },
    repo: "https://github.com/cyl0/ModernX",
    deps: ["thumbfast", "ModernX", "ModernX cyl0", "autoload"],
  },
  {
    name: "mpv-modernz",
    info: {
      user: "mpv-easy",
      repo: "mpv-easy-cdn",
      tag: "main",
      file: "mpv-modernz-windows-full.tar.xz",
    },
    repo: "https://github.com/Samillion/ModernZ",
    deps: ["thumbfast", "ModernZ", "autoload"],
  },
  {
    name: "mpv.net",
    info: {
      user: "mpv-easy",
      repo: "mpv-easy-cdn",
      tag: "main",
      file: "mpv.net.zip",
    },
    repo: "https://github.com/mpvnet-player/mpv.net",
    deps: ["mpv.net"],
  },
] as const

type UI = (typeof UI_LIST)[number]["name"]

const ExternalList = ["ffmpeg", "yt-dlp", "play-with"]

async function downloadBinary(url: string): Promise<Uint8Array> {
  return fetch(url)
    .then((resp) => resp.arrayBuffer())
    .then((i) => new Uint8Array(i))
}

function getDownloadUrl(user: string, repo: string, tag: string, file: string) {
  return `https://raw.githubusercontent.com/${user}/${repo}/${tag}/${file}`
}

function getScriptDownloadURL({ name }: Script) {
  return getDownloadUrl("mpv-easy", "mpv-easy-cdn", "main", `${name}.zip`)
}

async function getScriptFiles(script: Script): Promise<File[]> {
  const { download } = script
  if (![".js", ".lua", ".zip"].some((i) => download.endsWith(i))) {
    console.log("not support script: ", script)
    return []
  }

  const url = getScriptDownloadURL(script)
  const bin = await downloadBinary(url)

  const v = decode(guess(url)!, bin)!.filter((i) => !i.isDir)
  return v
}

async function getMpvFiles(platform: Platform, ui: UI) {
  let uiUrl = ""
  if (platform === "mpv" && ui === "mpv") {
    uiUrl = getMpvUrl()
  } else {
    const info = UI_LIST.find((i) => i.name === ui)?.info
    if (info) {
      const { repo, user, tag, file } = info
      uiUrl = getDownloadUrl(user, repo, tag, file)
    }
  }

  if (!uiUrl) {
    return []
  }

  // ui
  const uiBinary = await downloadBinary(uiUrl)
  const fmt = guess(uiUrl)
  if (!fmt) {
    console.log("fmt error")
    return []
  }
  const uiFiles = decode(fmt, uiBinary)
  if (!uiFiles) {
    console.log("uiFiles error")
    return []
  }
  const v: File[] = []
  for (const item of uiFiles) {
    try {
      const { path, mode, isDir, lastModified, buffer } = item
      if (isDir) {
        continue
      }
      v.push(new File(path, new Uint8Array(buffer), mode, isDir, lastModified))
    } catch (e) {
      console.log(e)

      return []
    }
  }

  // replace all v3 files
  if (platform === "mpv" && ui !== "mpv" && ui !== "mpv.net") {
    const mpvUrl = getMpvUrl()
    const bin = await downloadBinary(mpvUrl)
    const files = decode(guess(mpvUrl)!, bin)!
    for (const file of files) {
      const index = v.findIndex((i) => i.path === file.path)
      if (index !== -1) {
        v[index] = file
      }
    }
  }

  return v
}

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
  } = store

  const uiDeps: readonly string[] =
    UI_LIST.find((i) => i.name === ui)?.deps || []

  const [api, contextHolder] = notification.useNotification()

  const reset = () => {
    setState({ ...DEFAULT_STATE, data, tableData })
  }

  const zipAll = async () => {
    const mpvFiles = await getMpvFiles(platform, ui)

    // ffmpeg
    if (externalList.includes("ffmpeg")) {
      const ffmpegBinary = await downloadBinary(
        platform === "mpv-v3" ? getFfmpegV3Url() : getFfmpegUrl(),
      )
      const ffmpegFiles = decode(guess(getFfmpegUrl())!, ffmpegBinary)!
      for (const { path, mode, isDir, lastModified, buffer } of ffmpegFiles) {
        if (isDir) {
          continue
        }
        mpvFiles.push(new File(path, buffer, mode, isDir, lastModified))
      }
    }

    // yt-dlp
    if (externalList.includes("yt-dlp")) {
      const bin = await downloadBinary(getYtdlpUrl())
      mpvFiles.push(
        new File("yt-dlp.exe", bin, null, false, BigInt(+new Date())),
      )
    }

    // play-with
    if (externalList.includes("play-with")) {
      const bin = await downloadBinary(getPlayWithUrl())
      mpvFiles.push(
        new File("play-with.exe", bin, null, false, BigInt(+new Date())),
      )
    }

    // scripts
    for (const i of selectedRowKeys) {
      const scriptFiles = await getScriptFiles(data[i])
      installScript(mpvFiles, scriptFiles, data[i])
    }

    // encode to zip
    const zipBinary = encode(Fmt.Zip, mpvFiles)
    if (!zipBinary) {
      console.log("zip file error")
      return
    }
    return zipBinary
  }
  const download = async () => {
    setSpinning(true)
    // Wait for spinning
    await new Promise((r) => setTimeout(r))
    const zipBinary = await zipAll()
    setSpinning(false)
    if (zipBinary) {
      downloadBinaryFile(`${ui}.zip`, zipBinary)
    }
  }

  const resetData = async () => {
    const META_URL = getDownloadUrl(
      "mpv-easy",
      "mpsm-scripts",
      "main",
      "scripts-full.json",
    )

    const data: Record<string, DataType> = await fetch(META_URL)
      .then((i) => i.text())
      .then((text) => JSON.parse(text))

    for (const i in data) {
      data[i].key = i
    }

    setData(data)

    const selectedData = selectedRowKeys.map((i) => data[i])
    const tableData = Object.values(data)
      .sort(() => 0.5 - Math.random())
      .filter((i) => !selectedRowKeys.includes(i.name))

    setTableData([...selectedData, ...tableData])
    fuseRef.current = new Fuse(Object.values(data), {
      keys: ["name"],
    })
  }

  useMount(resetData)

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "name",
      dataIndex: "name",
      key: "key",
      render: (_, i) => {
        return (
          <Link href={i.homepage} target="_blank" rel="noreferrer">
            {i.name}
          </Link>
        )
      },
      width: NAME_WIDTH,
    },
    {
      title: "description",
      dataIndex: "description",
      key: "key",
    },
    {
      title: "author",
      dataIndex: "author",
      key: "url",
    },
    {
      title: "download",
      dataIndex: "download",
      key: "url",
      render: (_, script) => {
        return (
          <Button
            key={script.download}
            icon={<DownloadOutlined />}
            onClick={async () => {
              const bin = await downloadBinary(getScriptDownloadURL(script))
              downloadBinaryFile(`${script.name}.zip`, bin)
            }}
          />
        )
      },
    },
  ]

  const onSearch: SearchProps["onSearch"] = (value, _e, info) => {
    const v = fuseRef.current?.search(value)
    if (v?.length) {
      setTableData(v.map((i) => i.item))
    }
  }

  if (!Object.keys(data).length) {
    return (
      <Flex
        className="main"
        vertical
        gap="middle"
        justify="center"
        align="center"
      >
        <Typography>
          <Title level={3}>Loading...</Title>
        </Typography>
      </Flex>
    )
  }

  return (
    <>
      {contextHolder}
      <Flex
        className="main"
        vertical
        gap="middle"
        justify="center"
        align="center"
      >
        <Flex
          gap="middle"
          justify="center"
          align="center"
          style={{ position: "absolute", top: "1rem", right: "1rem" }}
        >
          <Typography.Link
            href="https://github.com/mpv-easy/mpv-easy"
            target="_blank"
          >
            <GithubOutlined />
          </Typography.Link>
          <Typography.Link
            href="https://www.youtube.com/@mpveasy"
            target="_blank"
          >
            <YoutubeOutlined />
          </Typography.Link>
          <Typography.Link href="https://x.com/mpv_easy" target="_blank">
            <TwitterOutlined />
          </Typography.Link>
        </Flex>

        <Flex gap="middle" vertical align="start">
          <Flex gap="middle" justify="center" align="center">
            <Typography.Title
              level={5}
              style={{ margin: 0, width: TITLE_WIDTH }}
            >
              Platform:
            </Typography.Title>
            <Radio.Group
              value={platform}
              onChange={(e) => {
                setPlatform(e.target.value)
              }}
            >
              {PLATFORM_LIST.map((i) => (
                <Tooltip
                  key={i}
                  placement="topLeft"
                  title={
                    i === "mpv"
                      ? `Typically, you should use mpv-v3 unless it fails to run or you're using an older CPU (manufactured around 2015 or earlier).`
                      : ""
                  }
                >
                  <Radio value={i} key={i} style={{ width: ITEM_WIDTH }}>
                    {i}
                  </Radio>
                </Tooltip>
              ))}
            </Radio.Group>
          </Flex>

          <Flex gap="middle" justify="center" align="center">
            <Typography.Title
              level={5}
              style={{ margin: 0, width: TITLE_WIDTH }}
            >
              UI:
            </Typography.Title>
            <Radio.Group
              onChange={(e) => {
                setUI(e.target.value)
              }}
              value={ui}
            >
              {UI_LIST.map((i) => (
                <Radio
                  value={i.name}
                  key={i.name}
                  style={{ width: ITEM_WIDTH }}
                >
                  <Typography.Link href={i.repo} target="_blank">
                    {i.name}
                  </Typography.Link>
                </Radio>
              ))}
            </Radio.Group>
          </Flex>

          <Flex gap="middle" justify="center" align="center">
            <Typography.Title
              level={5}
              style={{ margin: 0, width: TITLE_WIDTH }}
            >
              External:
            </Typography.Title>
            <Checkbox.Group
              value={externalList}
              onChange={(e) => {
                setExternalList(e)
              }}
            >
              {ExternalList.map((i) => (
                <Checkbox value={i} key={i} style={{ width: ITEM_WIDTH }}>
                  {i}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Flex>
        </Flex>

        <Search
          placeholder="input search text"
          onSearch={onSearch}
          enterButton
        />
        <Table<DataType>
          rowSelection={{
            hideSelectAll: true,
            type: "checkbox",
            onSelect: (record, selected) => {
              if (selected) {
                setSelectedKeys([...selectedRowKeys, record.name])
              } else {
                setSelectedKeys(
                  [...selectedRowKeys].filter((i) => i !== record.name),
                )
              }
            },
            getCheckboxProps: (record: DataType) => {
              return {
                disabled: uiDeps.includes(record.name),
                name: record.name,
              }
            },
            selectedRowKeys: [...selectedRowKeys, ...uiDeps],
          }}
          className="table"
          columns={columns}
          dataSource={tableData}
        />
        <Spin spinning={spinning} fullscreen />
        <Flex>
          <Tag color="processing" key={ui}>
            {ui}
          </Tag>
          {uiDeps.map((i) => {
            return (
              data[i] && (
                <Tag color="success" key={data[i].key}>
                  {data[i].name}
                </Tag>
              )
            )
          })}
          {selectedRowKeys.map((i) => {
            return (
              <Tag
                closable
                color="success"
                key={data[i].key}
                onClose={(e) => {
                  const index = selectedRowKeys.indexOf(data[i].key)
                  if (index !== -1) {
                    const v = [...selectedRowKeys]
                    v.splice(index, 1)
                    setSelectedKeys(v)
                  }
                  e.preventDefault()
                }}
              >
                {data[i].name}
              </Tag>
            )
          })}
        </Flex>
        <Flex gap="middle">
          <Button color="danger" size={"large"} variant="solid" onClick={reset}>
            Reset
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size={"large"}
            onClick={download}
          >
            Download {ui}.zip
          </Button>
        </Flex>
      </Flex>
    </>
  )
}

export default App
