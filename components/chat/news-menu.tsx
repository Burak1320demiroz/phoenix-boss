"use client"

import { useState, useCallback, useEffect } from "react"
import { Newspaper, ExternalLink, RefreshCw, AlertCircle, MapPin, Globe, Trophy, LineChart, Cpu, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedOrb } from "./animated-orb"

interface NewsItem {
  key: string
  url: string
  description: string
  image: string
  name: string
  source: string
}

const CITIES = ["bursa", "istanbul", "ankara", "izmir", "antalya"]

const TAGS = [
  { id: "general", label: "Genel", icon: <Globe className="w-3.5 h-3.5" /> },
  { id: "sport", label: "Spor", icon: <Trophy className="w-3.5 h-3.5" /> },
  { id: "economy", label: "Ekonomi", icon: <LineChart className="w-3.5 h-3.5" /> },
  { id: "technology", label: "Teknoloji", icon: <Cpu className="w-3.5 h-3.5" /> },
  { id: "ai", label: "Yapay Zeka", icon: <Brain className="w-3.5 h-3.5" /> },
]

export function NewsMenu() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("general") // general, sport, economy, technology, ai, local
  const [selectedCity, setSelectedCity] = useState("bursa")
  const [news, setNews] = useState<NewsItem[]>([])
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = useCallback(async (tab: string, city: string, isRefresh = false) => {
    setLoading(true)
    setError(null)
    setNews([])

    try {
      const params = new URLSearchParams()
      if (tab === "local") {
        params.set("source", "local")
        params.set("city", city)
      } else {
        params.set("source", "general")
        // Mapping 'ai' to 'technology' if needed, but let's try 'ai' first as it might be supported
        params.set("tag", tab === "ai" ? "technology" : tab) 
      }
      if (isRefresh) params.set("refresh", "true")

      const res = await fetch(`/api/news?${params.toString()}`)
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Haberler alınamadı")
      }

      const data = await res.json()
      if (data.success && data.result) {
        setNews(data.result)
        setLastUpdated(data.lastUpdated || null)
        setIsCached(data.cached === true)
      } else {
        throw new Error("Geçersiz API yanıtı")
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu"
      console.error(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open && news.length === 0 && !loading) {
      fetchNews(activeTab, selectedCity, false)
    }
  }, [open, activeTab, selectedCity, fetchNews, news.length, loading])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setNews([])
    setLastUpdated(null)
    fetchNews(tab, selectedCity, false)
  }

  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    setNews([])
    setLastUpdated(null)
    fetchNews("local", city, false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-16 z-20 h-10 w-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-stone-600"
          aria-label="Haberler"
        >
          <Newspaper className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl bg-stone-50 border-none shadow-2xl rounded-3xl p-6 h-[85vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between shrink-0 mb-2">
          <DialogTitle className="text-2xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-stone-600" />
            Haber Akışı
          </DialogTitle>
          {lastUpdated && (
            <div className="text-xs font-medium pr-8 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isCached ? "bg-amber-400" : "bg-emerald-500"}`} />
              <span className="text-stone-500">
                {isCached ? "Önbellekten" : "Güncellendi"}: {lastUpdated}
              </span>
            </div>
          )}
        </DialogHeader>

        <div className="shrink-0 space-y-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-stone-200/50 rounded-xl p-1 gap-1 h-auto">
              {TAGS.map(tag => (
                <TabsTrigger key={tag.id} value={tag.id} className="rounded-lg font-bold text-[10px] md:text-xs py-2 flex items-center gap-1.5">
                  {tag.icon} {tag.label}
                </TabsTrigger>
              ))}
              <TabsTrigger value="local" className="rounded-lg font-bold text-[10px] md:text-xs py-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Şehir
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {activeTab === "local" && (
            <div className="flex flex-wrap gap-2 p-2 bg-white rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              {CITIES.map(city => (
                <button
                  key={city}
                  onClick={() => handleCityChange(city)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                    selectedCity === city
                      ? "bg-stone-800 text-white shadow-md scale-105"
                      : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <AnimatedOrb size={64} variant="default" />
            <span className="text-stone-500 font-bold animate-pulse uppercase tracking-widest text-xs">Haberler Getiriliyor...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto mt-3 pr-2 space-y-4 custom-scrollbar">
            {news.map((item, idx) => (
              <Card
                key={item.key || `${idx}`}
                className="border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group bg-white"
              >
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="block sm:flex">
                  {item.image && (
                    <div className="sm:w-56 h-48 sm:h-auto shrink-0 bg-stone-100 overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                    </div>
                  )}
                  <CardContent className="p-5 flex flex-col justify-center flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-[9px] font-black text-stone-500 uppercase tracking-widest border border-stone-200">
                        {item.source || (activeTab === "local" ? selectedCity : activeTab)}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-stone-800 leading-tight mb-2 group-hover:text-amber-700 transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-sm text-stone-500 font-medium line-clamp-2 mb-4 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center text-[10px] font-black text-amber-600 uppercase tracking-widest">
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Haberi Oku
                    </div>
                  </CardContent>
                </a>
              </Card>
            ))}
            {news.length === 0 && !loading && !error && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
                <Newspaper className="w-12 h-12 text-stone-200 mx-auto mb-3" />
                <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Bu kategoride haber bulunamadı.</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="shrink-0 mt-4 flex items-center gap-2 p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100">
            <AlertCircle className="w-5 h-5" />
            <span className="flex-1 font-bold">{error}</span>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-stone-200 shrink-0 flex justify-end">
          <Button
            variant="default"
            onClick={() => fetchNews(activeTab, selectedCity, true)}
            disabled={loading}
            className="rounded-full shadow-lg bg-stone-900 hover:bg-black text-white px-6 font-black uppercase tracking-widest text-xs gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Akışı Yenile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
