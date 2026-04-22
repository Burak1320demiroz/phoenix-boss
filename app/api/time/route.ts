import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const apiKey = process.env.COLLECT_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured." }, { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const city = searchParams.get("city") || "bursa"

  try {
    const authHeader = apiKey.startsWith("apikey ") ? apiKey : `apikey ${apiKey}`
    const response = await fetch(`https://api.collectapi.com/time/timezone?data.city=${city}`, {
      headers: { "content-type": "application/json", authorization: authHeader },
      cache: "no-store",
    })
    
    if (!response.ok) throw new Error(`CollectAPI Error: ${response.status}`)

    const data = await response.json()
    if (data.success && data.result) {
      return NextResponse.json({ success: true, result: data.result })
    }
    throw new Error("Invalid API response")
  } catch (error) {
    console.error("Time API Error:", error)
    return NextResponse.json({ error: "Failed to fetch time" }, { status: 500 })
  }
}
