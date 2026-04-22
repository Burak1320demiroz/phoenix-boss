"use client"

import { useState, useCallback, useEffect } from "react"
import { CloudSun, RefreshCw, AlertCircle, MapPin, Wind, Droplets, Thermometer, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedOrb } from "./animated-orb"

interface WeatherDay {
  date: string
  day: string
  icon: string
  description: string
  status: string
  degree: string
  min: string
  max: string
  night: string
  humidity: string
}

export function WeatherMenu() {
  const [open, setOpen] = useState(false)
  const [weatherData, setWeatherData] = useState<WeatherDay[]>([])
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = useCallback(async (isRefresh = false) => {
    setLoading(true)
    setError(null)

    try {
      const url = isRefresh ? "/api/weather?refresh=true&city=bursa" : "/api/weather?city=bursa"
      const res = await fetch(url)
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Hava durumu alınamadı")
      }

      const data = await res.json()
      if (data.success && data.result) {
        setWeatherData(data.result)
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
    if (open && weatherData.length === 0) {
      fetchWeather(false)
    }
  }, [open, weatherData.length, fetchWeather])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-[304px] z-20 h-10 w-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-stone-600"
          aria-label="Haftalık Hava Durumu"
        >
          <CloudSun className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl bg-stone-50 border-none shadow-2xl rounded-3xl p-6 h-[85vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between shrink-0 mb-4">
          <DialogTitle className="text-2xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-sky-500" />
            Haftalık Hava Durumu
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

        <div className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-stone-200 shadow-sm w-fit">
          <MapPin className="w-4 h-4 text-red-500" />
          <span className="text-sm font-bold text-stone-800">Bursa, Türkiye</span>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <AnimatedOrb size={64} variant="default" />
            <span className="text-stone-500 font-medium">Haftalık tahmin hazırlanıyor...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {weatherData.map((day, idx) => (
                <Card key={idx} className={`border-none shadow-sm rounded-2xl bg-white overflow-hidden transition-all hover:shadow-md ${idx === 0 ? " ring-2 ring-sky-100" : ""}`}>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{day.date}</span>
                    <span className={`text-sm font-bold mb-3 ${idx === 0 ? "text-sky-600" : "text-stone-700"}`}>
                      {day.day}
                      {idx === 0 ? " (Bugün)" : ""}
                    </span>
                    
                    <div className="w-12 h-12 mb-3">
                      <img src={day.icon} alt={day.description} className="w-full h-full object-contain" />
                    </div>

                    <div className="flex flex-col gap-0.5 mb-4">
                      <span className="text-2xl font-black text-stone-900 leading-none">{Math.round(parseFloat(day.degree))}°</span>
                      <span className="text-[10px] font-bold text-stone-500 uppercase">{day.description}</span>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2 pt-3 border-t border-stone-50">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-stone-400 uppercase">Gece</span>
                        <span className="text-xs font-bold text-stone-600">{Math.round(parseFloat(day.night))}°</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-stone-400 uppercase">Nem</span>
                        <span className="text-xs font-bold text-stone-600">%{day.humidity}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {weatherData.length === 0 && !loading && !error && (
              <div className="text-center py-20 text-stone-400">Tahmin verisi bulunamadı.</div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            <AlertCircle className="w-4 h-4" />
            <span className="flex-1 font-medium">{error}</span>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end">
          <Button
            variant="default"
            onClick={() => fetchWeather(true)}
            disabled={loading}
            className="rounded-full shadow-md bg-stone-800 hover:bg-stone-900 text-white gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Tahmini Güncelle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
