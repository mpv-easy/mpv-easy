import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
// export type Meta = {
//   name: string;
//   description: string;
//   author: string;
//   downloadURL: string;
//   url: string;
// };
import { Meta, metaToString } from "@mpv-easy/mpsm"

let txt = readFileSync("scripts/mpv.md", "utf8")

txt = txt.slice(txt.indexOf("# User Script"), txt.indexOf("# Shaders"))

const GITHUB_RE =
  /^https?:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\/|$)/

const branchCache: Record<string, string> = {}
const urlCache: Record<string, Meta> = {}

async function parseMarkdownLink(markdown: string): Promise<Meta | null> {
  const regex = /\[(.*?)\]\((.*?)\)\s*-\s*(.*)/
  const match = markdown.match(regex)

  if (!match) {
    return null
  }

  const [, title, url, description] = match.map((i) => i.trim())
  let author = ""
  let downloadURL = url
  for (const i of [
    "https://github.com/",
    "https://gist.github.com/",
    // TODO: support other sites
    // "https://gitlab.com/",
    // "https://codeberg.org/",
  ]) {
    if (url.startsWith(i)) {
      author = url.slice(i.length).split("/")[0] || ""
    } else {
      continue
    }

    if (url.endsWith(".lua") || url.endsWith(".js")) {
      if (url.startsWith("https://github.com/")) {
        // url =
        // console.log(url)
        const regex =
          /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/
        const match = url.match(regex)
        if (!match) {
          continue
        }
        const [, user, repo, branch, path] = match
        downloadURL = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`
        // console.log('url: ',url)
      }
    } else if (GITHUB_RE.test(url)) {
      console.log("repo1: ", url)
      const regex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(\/)?$/
      const match = url.match(regex)

      if (!match) {
        continue
      }
      const [, user, repo] = match

      const mainUrl = `https://github.com/${user}/${repo}/archive/refs/heads/main.zip`
      const masterUrl = `https://github.com/${user}/${repo}/archive/refs/heads/master.zip`
      if (branchCache[url]) {
        downloadURL = branchCache[url]
      } else {
        // const apiUrl = `https://api.github.com/repos/${user}/${repo}`;
        // const repoResponse = await fetch(apiUrl, {
        //   headers: {
        //     'Accept': 'application/vnd.github.v3+json',
        //     // Optional: Add 'Authorization': 'token YOUR_GITHUB_TOKEN' for authenticated requests to increase rate limits
        //   },
        // }).then(resp => resp.json());
        // branch = repoResponse.default_branch;
        // branchCache[url] = branch
        if ((await fetch(mainUrl)).status === 200) {
          downloadURL = mainUrl
        } else {
          downloadURL = masterUrl
        }
        branchCache[url] = downloadURL
      }
      console.log("repo2: ", url)
    }
  }

  return {
    name: title,
    url,
    downloadURL,
    description: description,
    author,
  }
}

if (!existsSync("./public/meta")) {
  mkdirSync("./public/meta", { recursive: true })
}

for (let line of txt
  .replaceAll("\r\n", "\n")
  .split("\n")
  .map((i) => i.trim())) {
  if (line.startsWith("- ")) {
    line = line.slice(2)
    // console.log(line);

    const data = urlCache[line] ? urlCache[line] : await parseMarkdownLink(line)
    urlCache[line] = data!
    // console.log(data);

    if (data) {
      const s = metaToString(data!, "js")
      writeFileSync(
        `./public/meta/${data.name.replaceAll("/", "_")}.meta.js`,
        s,
      )
    }
  }
}
