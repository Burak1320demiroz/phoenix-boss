import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const CREDITS_DIR = path.join(process.cwd(), "data", "credits")

function getLatestFile(type: string): { file: string; timestamp: string } | null {
  try {
    if (!fs.existsSync(CREDITS_DIR)) return null
    const files = fs.readdirSync(CREDITS_DIR)
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
  const type = searchParams.get("type") || "konut" // konut or ihtiyac
  const isRefresh = searchParams.get("refresh") === "true"

  if (!isRefresh) {
    const latest = getLatestFile(type)
    if (latest) {
      try {
        const filePath = path.join(CREDITS_DIR, latest.file)
        const raw = fs.readFileSync(filePath, "utf-8")
        const result = JSON.parse(raw)
        return NextResponse.json({ success: true, result, cached: true, lastUpdated: latest.timestamp })
      } catch { /* fall through */ }
    }
  }

  try {
    const authHeader = apiKey.startsWith("apikey ") ? apiKey : `apikey ${apiKey}`
    const endpoint = type === "konut" ? "konutKredi" : "ihtiyacKredi"
    const response = await fetch(`https://api.collectapi.com/credit/${endpoint}`, {
      headers: { "content-type": "application/json", authorization: authHeader },
      cache: "no-store",
    })
    if (!response.ok) throw new Error(`CollectAPI Error: ${response.status}`)

    const data = await response.json()
    if (data.success && data.result) {
      if (!fs.existsSync(CREDITS_DIR)) fs.mkdirSync(CREDITS_DIR, { recursive: true })

      const now = new Date()
      const ts = now.toISOString().replace("T", "_").replace(/:/g, "-").slice(0, 19)
      const fileName = `${type}_${ts}.txt`
      fs.writeFileSync(path.join(CREDITS_DIR, fileName), JSON.stringify(data.result, null, 2), "utf-8")

      const lastUpdated = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`
      return NextResponse.json({ success: true, result: data.result, cached: false, lastUpdated })
    }
    throw new Error("Invalid API response")
  } catch (error) {
    console.error("Credits API Error:", error)
    return NextResponse.json({ error: "Failed to fetch credit rates" }, { status: 500 })
  }
}
