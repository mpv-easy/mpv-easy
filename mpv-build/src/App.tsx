import React, { useEffect, useRef, useState } from "react"
import { Checkbox, Input } from "antd"
import type { CheckboxOptionType, GetProps } from "antd"
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
import { Meta } from "@mpv-easy/mpsm"
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
  selectedKeys: string[]
  externalList: string[]
  ui: UI
  setData: (data: Record<string, DataType>) => void
  setTableData: (tableData: DataType[]) => void
  setSpinning: (spinning: boolean) => void
  setSelectedKeys: (selectedKeys: string[]) => void
  setExternalList: (externalList: string[]) => void
  setUI: (ui: UI) => void
}

const useMpvStore = create<Store>()(
  persist(
    (set, get) => ({
      data: {},
      tableData: [],
      spinning: false,
      selectedKeys: [],
      externalList: [],
      ui: "mpv",
      setData: (data: Record<string, DataType>) => set({ ...get(), data }),
      setTableData: (tableData: DataType[]) => set({ ...get(), tableData }),
      setSpinning: (spinning: boolean) => set({ ...get(), spinning }),
      setSelectedKeys: (selectedKeys: string[]) =>
        set({ ...get(), selectedKeys }),
      setExternalList: (externalList: string[]) =>
        set({ ...get(), externalList }),
      setUI: (ui: UI) => set({ ...get(), ui }),
    }),
    {
      name: "mpv-build-storage",
      storage: createJSONStorage(() => hashStorage),
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

interface DataType extends Meta {
  key: string
}

const META_URL =
  "https://raw.githubusercontent.com/mpv-easy/mpsm-scripts/main/meta.json"

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

const MPV_UI = [
  {
    name: "mpv",
    url: "https://raw.githubusercontent.com/mpv-easy/mpv-easy-cdn/main/mpv-windows.tar.xz",
    repo: "https://github.com/mpv-player/mpv",
  },
  {
    name: "mpv-uosc",
    url: "https://raw.githubusercontent.com/mpv-easy/mpv-easy-cdn/main/mpv-uosc-windows-full.tar.xz",
    repo: "https://github.com/tomasklaen/uosc",
  },
  {
    name: "mpv-easy",
    url: "https://raw.githubusercontent.com/mpv-easy/mpv-easy-cdn/main/mpv-easy-windows-full.tar.xz",
    repo: "https://github.com/mpv-easy/mpv-easy",
  },
  {
    name: "mpv-modernx",
    url: "https://raw.githubusercontent.com/mpv-easy/mpv-easy-cdn/main/mpv-modernx-windows-full.tar.xz",
    repo: "https://github.com/cyl0/ModernX",
  },
  {
    name: "mpv-modernz",
    url: "https://raw.githubusercontent.com/mpv-easy/mpv-easy-cdn/main/mpv-modernz-windows-full.tar.xz",
    repo: "https://github.com/Samillion/ModernZ",
  },
] as const

type UI = (typeof MPV_UI)[number]["name"]

const FFMPEG_URL =
  "https://raw.githubusercontent.com/mpv-easy/mpv-easy-cdn/main/ffmpeg-windows.zip"
const YT_DLP_URL =
  "https://raw.githubusercontent.com/mpv-easy/mpv-easy-cdn/main/yt-dlp.exe"
const PLAY_WITH_URL =
  "https://raw.githubusercontent.com/mpv-easy/mpv-easy-cdn/main/mpv-easy-play-with-windows.exe"

async function downloadBinary(url: string): Promise<Uint8Array> {
  return fetch(url)
    .then((resp) => resp.arrayBuffer())
    .then((i) => new Uint8Array(i))
}

async function getScriptFiles(meta: Meta): Promise<File[]> {
  let name = meta.name
  const { downloadURL } = meta
  if (downloadURL.endsWith("master.zip") || downloadURL.endsWith("main.zip")) {
    name = `${meta.name}.zip`
  } else if (downloadURL.endsWith(".js") || downloadURL.endsWith(".lua")) {
    name = downloadURL.split("/").at(-1)!
  }
  if (![".js", ".lua", ".zip"].some((i) => downloadURL.endsWith(i))) {
    console.log("not support script: ", meta)
    return []
  }

  const url = `https://raw.githubusercontent.com/mpv-easy/mpv-easy-cdn/main/${name}`
  const bin = await downloadBinary(url)

  if (downloadURL.endsWith("master.zip") || downloadURL.endsWith("main.zip")) {
    const v = decode(guess(name)!, bin)!.filter((i) => !i.isDir)
    return v.map(
      ({ path, mode, isDir, buffer }) =>
        new File(`portable_config/scripts/${path}`, buffer, mode, isDir),
    )
  }
  if (name.endsWith(".js") || name.endsWith(".lua")) {
    return [new File(`portable_config/scripts/${name}`, bin, null, false)]
  }
  return []
}

function App() {
  const store = useMpvStore()
  const fuseRef = useRef<Fuse<any> | null>(null)
  const {
    data,
    tableData,
    spinning,
    selectedKeys,
    externalList,
    ui,
    setData,
    setTableData,
    setSpinning,
    setUI,
    setSelectedKeys,
    setExternalList,
  } = store
  const [api, contextHolder] = notification.useNotification()

  const options: CheckboxOptionType<string>[] = [
    { label: "ffmpeg", value: "ffmpeg" },
    { label: "yt-dlp", value: "yt-dlp" },
    { label: "play-with", value: "play-with" },
  ]
  const zipAll = async () => {
    const uiUrl = MPV_UI.find((i) => i.name === ui)?.url
    if (!uiUrl) {
      return
    }
    // ui
    const uiBinary = await downloadBinary(uiUrl)
    const fmt = guess(uiUrl)
    if (!fmt) {
      console.log("fmt error")
      return
    }
    const uiFiles = decode(fmt, uiBinary)
    if (!uiFiles) {
      console.log("uiFiles error")
      return
    }
    const v: File[] = []
    for (const item of uiFiles) {
      try {
        const { path, mode, isDir, buffer } = item
        if (isDir) {
          continue
        }
        v.push(new File(path, new Uint8Array(buffer), mode, isDir))
      } catch (e) {
        console.log(e)
      }
    }

    // ffmpeg
    if (externalList.includes("ffmpeg")) {
      const ffmpegBinary = await downloadBinary(FFMPEG_URL)
      const ffmpegFiles = decode(guess(FFMPEG_URL)!, ffmpegBinary)!
      for (const { path, mode, isDir, buffer } of ffmpegFiles) {
        if (isDir) {
          continue
        }
        v.push(new File(path, buffer, mode, isDir))
      }
    }

    // yt-dlp
    if (externalList.includes("yt-dlp")) {
      const bin = await downloadBinary(YT_DLP_URL)
      v.push(new File("yt-dlp.exe", bin, null, false))
    }

    // play-with
    if (externalList.includes("play-with")) {
      const bin = await downloadBinary(PLAY_WITH_URL)
      v.push(new File("play-with.exe", bin, null, false))
    }

    // scripts
    for (const i of selectedKeys) {
      const files = await getScriptFiles(data[i])
      for (const i of files) {
        v.push(i)
      }
    }

    // encode to zip
    const zipBinary = encode(Fmt.Zip, v)
    if (!zipBinary) {
      console.log("zip file error")
      return
    }
    return zipBinary
  }
  const download = async () => {
    setSpinning(true)
    const zipBinary = await zipAll()
    setSpinning(false)
    if (zipBinary) {
      downloadBinaryFile(`${ui}.zip`, zipBinary)
    }
  }

  useMount(async () => {
    const data: Record<string, DataType> = await fetch(META_URL)
      .then((i) => i.text())
      .then((text) => JSON.parse(text))

    for (const i in data) {
      data[i].key = i
    }

    setData(data)

    const selectedData = selectedKeys.map((i) => data[i])
    const tableData = Object.values(data)
      .sort(() => 0.5 - Math.random())
      .filter((i) => !selectedKeys.includes(i.name))

    setTableData([...selectedData, ...tableData])
    fuseRef.current = new Fuse(Object.values(data), {
      keys: ["name"],
    })
  })

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "name",
      dataIndex: "name",
      key: "key",
      render: (_, i) => {
        return (
          <Link href={i.url} target="_blank" rel="noreferrer">
            {i.name}
          </Link>
        )
      },
      width: 250,
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

        <Flex gap="middle" vertical justify="center" align="center">
          <Typography>
            <Title level={3}>UI</Title>
          </Typography>
          <Radio.Group
            onChange={(e) => {
              setUI(e.target.value)
            }}
            value={ui}
          >
            {MPV_UI.map((i) => (
              <Radio value={i.name} key={i.url}>
                <Typography.Link href={i.repo} target="_blank">
                  {" "}
                  {i.name}
                </Typography.Link>
              </Radio>
            ))}
          </Radio.Group>
        </Flex>

        <Flex gap="middle" vertical justify="center" align="center">
          <Typography>
            <Title level={3}>External</Title>
          </Typography>
          <Checkbox.Group
            value={externalList}
            options={options}
            onChange={(e) => {
              setExternalList(e)
            }}
          />
        </Flex>

        <Search
          placeholder="input search text"
          onSearch={onSearch}
          enterButton
        />
        <Table<DataType>
          rowSelection={{
            type: "checkbox",
            onChange: (selectedRowKeys: React.Key[]) => {
              if (selectedRowKeys.length > MAX_SCRIPT_COUNT) {
                api.open({
                  message: "Too many scripts",
                  description: `The maximum supported number of selectable scripts is ${MAX_SCRIPT_COUNT}`,
                  duration: 3,
                })
                return
              }
              setSelectedKeys(selectedRowKeys as string[])
            },
            selectedRowKeys: selectedKeys,
          }}
          className="table"
          columns={columns}
          dataSource={tableData}
        />
        <Spin spinning={spinning} fullscreen />
        <Flex>
          {selectedKeys.map((i) => {
            return (
              <Tag
                closable
                color="success"
                key={data[i].key}
                onClose={(e) => {
                  const index = selectedKeys.indexOf(data[i].key)
                  if (index !== -1) {
                    const v = [...selectedKeys]
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

        <Button
          type="primary"
          icon={<DownloadOutlined />}
          size={"large"}
          onClick={download}
        >
          Download {ui}.zip
        </Button>
      </Flex>
    </>
  )
}

export default App
