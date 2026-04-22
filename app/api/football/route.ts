import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const FOOTBALL_DIR = path.join(process.cwd(), "data", "football")

function getLatestFile(type: string): { file: string; timestamp: string } | null {
  try {
    if (!fs.existsSync(FOOTBALL_DIR)) return null
    const files = fs.readdirSync(FOOTBALL_DIR)
      .filter(f => f.startsWith(type + "_") && f.endsWith(".txt"))
      .sort()
      .reverse()
    if (files.length === 0) return null
    const match = files[0].match(/_(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})\.txt$/)
    let timestamp = ""
    if (match) {
      timestamp = `${match[1]} ${match[2].replace(/-/g, ":")}`
    }
    return { file: files[0], timestamp }
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const apiKey = process.env.COLLECT_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured." }, { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") || "league" // results, league, goalKings, list
  const isRefresh = searchParams.get("refresh") === "true"
  const league = searchParams.get("league") || "super-lig"

  if (!isRefresh) {
    const cacheKey = type === "list" ? "leagues_list" : `${type}_${league}`
    const latest = getLatestFile(cacheKey)
    if (latest) {
      try {
        const filePath = path.join(FOOTBALL_DIR, latest.file)
        const raw = fs.readFileSync(filePath, "utf-8")
        const result = JSON.parse(raw)
        return NextResponse.json({ success: true, result, cached: true, lastUpdated: latest.timestamp })
      } catch { /* fall through */ }
    }
  }

  try {
    const authHeader = apiKey.startsWith("apikey ") ? apiKey : `apikey ${apiKey}`
    
    let url = ""
    if (type === "list") {
      url = "https://api.collectapi.com/football/leaguesList"
    } else {
      const endpoint = type === "league" ? "league" : type
      url = `https://api.collectapi.com/football/${endpoint}?league=${league}`
    }
    
    const response = await fetch(url, {
      headers: { "content-type": "application/json", authorization: authHeader },
      cache: "no-store",
    })
    
    if (!response.ok) throw new Error(`CollectAPI Error: ${response.status}`)

    const data = await response.json()
    
    // Normalize data: sometimes it is {success: true, result: [...]}, sometimes just [...]
    let normalizedResult = null
    if (Array.isArray(data)) {
      normalizedResult = data
    } else if (data && data.success && data.result) {
      normalizedResult = data.result
    } else if (data && data.result) {
      normalizedResult = data.result
    }

    if (normalizedResult) {
      if (!fs.existsSync(FOOTBALL_DIR)) fs.mkdirSync(FOOTBALL_DIR, { recursive: true })

      const now = new Date()
      const ts = now.toISOString().replace("T", "_").replace(/:/g, "-").slice(0, 19)
      const cacheKey = type === "list" ? "leagues_list" : `${type}_${league}`
      const fileName = `${cacheKey}_${ts}.txt`
      fs.writeFileSync(path.join(FOOTBALL_DIR, fileName), JSON.stringify(normalizedResult, null, 2), "utf-8")

      const lastUpdated = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`
      return NextResponse.json({ success: true, result: normalizedResult, cached: false, lastUpdated })
    }
    throw new Error(data?.message || "Invalid API response format")
  } catch (error: any) {
    console.error("Football API Error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch football data" }, { status: 500 })
  }
}
