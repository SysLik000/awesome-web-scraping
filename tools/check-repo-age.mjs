import { RESOURCE_LISTS } from "./lib/lists.mjs"

const token = process.env.GITHUB_TOKEN
const owner = process.env.GITHUB_REPOSITORY_OWNER
const name = process.env.GITHUB_REPOSITORY_NAME
const pr = process.env.PR_NUMBER
const minAgeDays = Number(process.env.MIN_AGE_DAYS ?? 30)

if (!token || !owner || !name || !pr) {
  console.error("missing env: GITHUB_TOKEN, GITHUB_REPOSITORY_OWNER, GITHUB_REPOSITORY_NAME, PR_NUMBER")
  process.exit(1)
}

const MARKER = "<!-- repo-age-check -->"

async function gh(path, { method = "GET", body } = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GitHub API ${method} ${path} -> ${res.status}: ${text.slice(0, 300)}`)
  }
  return res.json()
}

async function ghAll(path) {
  const out = []
  for (let page = 1; ; page++) {
    const batch = await gh(`${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`)
    out.push(...batch)
    if (batch.length < 100) return out
  }
}

const addedLines = (patch) =>
  (patch ?? "").split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++")).map((l) => l.slice(1))

function extractUrls(line) {
  const urls = []
  const markdown = /\[[^\]]*\]\(([^)]+)\)/g
  let m
  while ((m = markdown.exec(line))) urls.push(m[1])
  for (const u of line.match(/https?:\/\/[^\s)\]>]+/g) ?? []) urls.push(u)
  return urls
}

const strip = (u) => u.replace(/[.,;:!?]+$/, "")
const subpaths = new Set([
  "actions", "archive", "blob", "branches", "commits", "compare", "discussions",
  "graphs", "issues", "labels", "milestones", "network", "projects", "pulls",
  "pulse", "raw", "releases", "security", "settings", "tags", "tree", "wiki",
])

function repoFromUrl(raw) {
  try {
    const u = new URL(strip(raw))
    if (u.hostname !== "github.com") return null
    const parts = u.pathname.split("/").filter(Boolean)
    if (parts.length !== 2) return null
    if (subpaths.has(parts[0].toLowerCase()) || subpaths.has(parts[1].toLowerCase())) return null
    if (!parts[0] || !parts[1]) return null
    return `${parts[0]}/${parts[1]}`
  } catch {
    return null
  }
}

async function main() {
  const files = await ghAll(`/repos/${owner}/${name}/pulls/${pr}/files`)
  const targets = new Set()

  for (const f of files) {
    if (f.status !== "added" && f.status !== "modified") continue
    if (!RESOURCE_LISTS.includes(f.filename)) continue
    for (const line of addedLines(f.patch)) {
      for (const u of extractUrls(line)) {
        const repo = repoFromUrl(u)
        if (repo) targets.add(repo)
      }
    }
  }

  const young = []
  for (const repo of [...targets].sort()) {
    let data
    try {
      data = await gh(`/repos/${repo}`)
    } catch (e) {
      console.log(`skip ${repo}: ${e.message.split("\n")[0]}`)
      continue
    }
    const created = new Date(data.created_at)
    const ageDays = (Date.now() - created.getTime()) / 86400000
    const ageLabel = ageDays < 1 ? "less than a day" : `${Math.floor(ageDays)} days`
    if (ageDays < minAgeDays) {
      young.push({ repo, created: data.created_at.slice(0, 10), ageLabel })
    }
    console.log(`${repo}: created ${data.created_at.slice(0, 10)} (${ageLabel} old)`)
  }

  const comments = await ghAll(`/repos/${owner}/${name}/issues/${pr}/comments`)
  const marked = comments.find((c) => c.body.includes(MARKER))

  if (young.length === 0) {
    if (marked) {
      await gh(`/repos/${owner}/${name}/issues/comments/${marked.id}`, { method: "DELETE" })
      console.log("no young repos; removed stale warning comment")
    } else {
      console.log(`no new github repos younger than ${minAgeDays} days`)
    }
    return
  }

  const lines = [
    MARKER,
    `Warning: the following proposed GitHub repos are younger than ${minAgeDays} days:`,
    "",
    ...young.map((y) => `- [${y.repo}](https://github.com/${y.repo}) - created ${y.created} (${y.ageLabel} old)`),
  ]
  const body = lines.join("\n")

  if (marked) {
    if (marked.body === body) {
      console.log("warning comment already up to date")
      return
    }
    await gh(`/repos/${owner}/${name}/issues/comments/${marked.id}`, { method: "PATCH", body: { body } })
    console.log("updated warning comment")
  } else {
    await gh(`/repos/${owner}/${name}/issues/${pr}/comments`, { method: "POST", body: { body } })
    console.log("posted warning comment")
  }
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})