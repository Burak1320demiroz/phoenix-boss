import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const WEATHER_DIR = path.join(process.cwd(), "data", "weather")

function getLatestFile(city: string): { file: string; timestamp: string } | null {
  try {
    if (!fs.existsSync(WEATHER_DIR)) return null
    const base = city.toLowerCase()
    const files = fs.readdirSync(WEATHER_DIR)
      .filter(f => f.startsWith(base + "_") && f.endsWith(".txt"))
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
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const city = searchParams.get("city") || "bursa"
  const isRefresh = searchParams.get("refresh") === "true"

  // Try cache first
  if (!isRefresh) {
    const latest = getLatestFile(city)
    if (latest) {
      try {
        const filePath = path.join(WEATHER_DIR, latest.file)
        const raw = fs.readFileSync(filePath, "utf-8")
        const result = JSON.parse(raw)
        return NextResponse.json({ success: true, result, cached: true, lastUpdated: latest.timestamp })
      } catch { /* fall through */ }
    }
  }

  // Fetch fresh from CollectAPI
  try {
    const authHeader = apiKey.startsWith("apikey ") ? apiKey : `apikey ${apiKey}`
    const response = await fetch(
      `https://api.collectapi.com/weather/getWeather?lang=tr&city=${encodeURIComponent(city)}`,
      {
        headers: { "content-type": "application/json", authorization: authHeader },
        cache: "no-store",
      }
    )
    if (!response.ok) throw new Error(`CollectAPI Error: ${response.status}`)

    const data = await response.json()

    // CollectAPI weather returns a plain array OR { result: [...] }
    const result = Array.isArray(data) ? data : data.result
    if (result && result.length > 0) {
      if (!fs.existsSync(WEATHER_DIR)) fs.mkdirSync(WEATHER_DIR, { recursive: true })

      const now = new Date()
      const ts = now.toISOString().replace("T", "_").replace(/:/g, "-").slice(0, 19)
      const fileName = `${city.toLowerCase()}_${ts}.txt`
      fs.writeFileSync(path.join(WEATHER_DIR, fileName), JSON.stringify(result, null, 2), "utf-8")

      const lastUpdated = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`
      return NextResponse.json({ success: true, result, cached: false, lastUpdated })
    }
    throw new Error("Invalid API response")
  } catch (error) {
    console.error("Weather API Error:", error)
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 })
  }
}
