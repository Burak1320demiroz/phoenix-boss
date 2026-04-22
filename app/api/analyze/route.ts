import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const DATA_ROOT = path.join(process.cwd(), "data")

function getLatestData(dirName: string, pattern?: string): any | null {
  try {
    const dirPath = path.join(DATA_ROOT, dirName)
    if (!fs.existsSync(dirPath)) return null
    let files = fs.readdirSync(dirPath).filter(f => f.endsWith(".txt"))
    if (pattern) {
      files = files.filter(f => f.includes(pattern))
    }
    files.sort().reverse()
    if (files.length === 0) return null
    const raw = fs.readFileSync(path.join(dirPath, files[0]), "utf-8")
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function GET() {
  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) return NextResponse.json({ error: "Groq key missing" }, { status: 500 })

  // Collect all data
  const weather = getLatestData("weather")
  const gold = getLatestData("gold")
  const currency = getLatestData("currency")
  const news = getLatestData("news", "general")
  const credits = getLatestData("credits", "ihtiyac") // Just one for sample
  const football = getLatestData("football", "league_super-lig")
  const pray = getLatestData("pray", "bursa")
  const gas = getLatestData("gas", "bursa")

  const context = {
    weather,
    gold,
    currency,
    news: news?.slice(0, 5),
    credits: credits?.slice(0, 3),
    football: football?.slice(0, 5),
    pray,
    gas
  }

  const systemPrompt = `
    Sen "Jarvis AI" asistanısın. Aşağıda verilen güncel verileri incele ve kullanıcı için 6 ana kategoride derinlemesine bir analiz yap.
    
    Kategoriler:
    1. Finans & Piyasa (Altın, Döviz ve Genel Ekonomik Durum)
    2. Günlük Yaşam & Hava Durumu (Hava durumuna göre tavsiyeler)
    3. Gündem & Haberler (Önemli haberlerin özeti ve yorumu)
    4. Kredi & Yatırım (Banka faiz oranları analizi)
    5. Spor (Ligdeki durum ve kritik maç yorumları)
    6. Ulaşım & Yakıt (Akaryakıt fiyatları ve rota tavsiyeleri)

    Her kategori için kısa, öz, profesyonel ama samimi bir paragraf hazırla.
    Yanıtı JSON formatında şu anahtarlarla ver: "finance", "life", "news", "investment", "sport", "logistics".
    Dil: Türkçe.
  `

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "qwen-2.5-32b", // Using Qwen via Groq if available, or fallback
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Veriler: ${JSON.stringify(context)}` }
        ],
        response_format: { type: "json_object" }
      })
    })

    const aiData = await response.json()
    const rawContent = aiData.choices[0].message.content
    const analysis = JSON.parse(rawContent)

    return NextResponse.json({ success: true, analysis })
  } catch (error) {
    console.error("Analysis API Error:", error)
    return NextResponse.json({ error: "Analiz oluşturulamadı" }, { status: 500 })
  }
}
