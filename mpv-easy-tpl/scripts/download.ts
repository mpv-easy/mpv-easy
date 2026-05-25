import { createServer } from "node:http"
import { readdir, stat } from "node:fs/promises"
import { join, extname } from "node:path"
import { createReadStream } from "node:fs"

const PORT = 3000
const CWD = process.cwd()

async function getZipFiles() {
  const files = await readdir(CWD)
  const zipFiles: { name: string; size: number }[] = []
  for (const file of files) {
    if (extname(file) === ".zip") {
      const s = await stat(join(CWD, file))
      zipFiles.push({ name: file, size: s.size })
    }
  }
  return zipFiles
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function renderHtml(zipFiles: { name: string; size: number }[]) {
  const rows = zipFiles
    .map(
      (f) =>
        `<tr><td><a href="/download/${encodeURIComponent(f.name)}">${f.name}</a></td><td>${formatSize(f.size)}</td></tr>`,
    )
    .join("")
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>mpv-easy downloads</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #0d1117; color: #c9d1d9; display: flex; justify-content: center; padding: 40px 20px; }
    .container { max-width: 600px; width: 100%; }
    h1 { font-size: 24px; margin-bottom: 20px; color: #58a6ff; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #21262d; }
    th { color: #8b949e; font-weight: 500; font-size: 13px; }
    a { color: #58a6ff; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .empty { color: #8b949e; text-align: center; padding: 40px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>mpv-easy downloads</h1>
    <table>
      <thead><tr><th>Name</th><th>Size</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="2" class="empty">No zip files found</td></tr>'}</tbody>
    </table>
  </div>
</body>
</html>`
}

const server = createServer(async (req, res) => {
  const url = req.url || "/"

  if (url === "/") {
    const zipFiles = await getZipFiles()
    res.writeHead(200, { "Content-Type": "text/html" })
    res.end(renderHtml(zipFiles))
    return
  }

  if (url.startsWith("/download/")) {
    const fileName = decodeURIComponent(url.slice("/download/".length))
    const filePath = join(CWD, fileName)
    try {
      const s = await stat(filePath)
      res.writeHead(200, {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": s.size,
      })
      createReadStream(filePath).pipe(res)
    } catch {
      res.writeHead(404)
      res.end("Not found")
    }
    return
  }

  res.writeHead(404)
  res.end("Not found")
})

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
