import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const NEWS_DIR = path.join(process.cwd(), "data", "news")

function getCacheFileName(source: string, city: string | null, tag: string | null): string {
  if (source === "local" && city) return `${city.toLowerCase()}`
  return `news_${tag || "general"}`
}

function getTimestampedFileName(base: string): string {
  const now = new Date()
  const ts = now.toISOString()
    .replace("T", "_")
    .replace(/:/g, "-")
    .slice(0, 19)
  return `${base}_${ts}.txt`
}

function getLatestFile(base: string): { file: string; timestamp: string } | null {
  try {
    if (!fs.existsSync(NEWS_DIR)) return null
    const files = fs.readdirSync(NEWS_DIR)
      .filter(f => f.startsWith(base + "_") && f.endsWith(".txt"))
      .sort()
      .reverse()
    if (files.length === 0) return null
    // Parse timestamp from filename e.g. genelhaberler_2026-04-16_15-23-16.txt
    const match = files[0].match(/_(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})\.txt$/)
    let timestamp = ""
    if (match) {
      const datePart = match[1]
      const timePart = match[2].replace(/-/g, ":")
      timestamp = `${datePart} ${timePart}`
    }
    return { file: files[0], timestamp }
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const apiKey = process.env.COLLECT_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured. Lütfen .env dosyasına COLLECT_API_KEY ekleyin." },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(req.url)
  const source = searchParams.get("source") || "general"
  const city = searchParams.get("city") || "bursa"
  const tag = searchParams.get("tag") || "general"
  const isRefresh = searchParams.get("refresh") === "true"

  const fileBase = getCacheFileName(source, city, tag)

  // Try to serve from cached .txt file
  if (!isRefresh) {
    const latest = getLatestFile(fileBase)
    if (latest) {
      try {
        const filePath = path.join(NEWS_DIR, latest.file)
        const raw = fs.readFileSync(filePath, "utf-8")
        const items = JSON.parse(raw)
        return NextResponse.json({
          success: true,
          result: items,
          cached: true,
          lastUpdated: latest.timestamp,
        })
      } catch {
        // If reading fails, fall through to fetch fresh
      }
    }
  }

  // Fetch fresh from CollectAPI
  try {
    let fetchUrl = `https://api.collectapi.com/news/getNews?country=tr&tag=${tag}`
    if (source === "local") {
      fetchUrl = `https://api.collectapi.com/news/getNewsLocal?city=${encodeURIComponent(city)}`
    }

    const authHeader = apiKey.startsWith("apikey ") ? apiKey : `apikey ${apiKey}`
    const response = await fetch(fetchUrl, {
      headers: {
        "content-type": "application/json",
        authorization: authHeader,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`CollectAPI Error: ${response.status}`)
    }

    const data = await response.json()

    if (data.success && data.result) {
      // Save to .txt file with timestamp
      if (!fs.existsSync(NEWS_DIR)) {
        fs.mkdirSync(NEWS_DIR, { recursive: true })
      }
      const fileName = getTimestampedFileName(fileBase)
      const filePath = path.join(NEWS_DIR, fileName)
      fs.writeFileSync(filePath, JSON.stringify(data.result, null, 2), "utf-8")

      const now = new Date()
      const lastUpdated = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`

      return NextResponse.json({
        success: true,
        result: data.result,
        cached: false,
        lastUpdated,
      })
    } else {
      throw new Error("Geçersiz API yanıtı")
    }
  } catch (error) {
    console.error("News API Fetch Error:", error)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}
