"use client"

import { useState, useCallback, useEffect } from "react"
import { Moon, RefreshCw, AlertCircle, Clock, MapPin, Sun, CloudMoon, Sunrise, Sunset, CloudSun } from "lucide-react"
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

interface PrayItem {
  vakit: string
  saat: string
}

export function PrayMenu() {
  const [open, setOpen] = useState(false)
  const [prayData, setPrayData] = useState<PrayItem[]>([])
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPrayTimes = useCallback(async (isRefresh = false) => {
    setLoading(true)
    setError(null)

    try {
      const url = isRefresh ? "/api/pray?refresh=true&city=bursa" : "/api/pray?city=bursa"
      const res = await fetch(url)
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Namaz vakitleri alınamadı")
      }

      const data = await res.json()
      if (data.success && data.result) {
        setPrayData(data.result)
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
    if (open && prayData.length === 0) {
      fetchPrayTimes(false)
    }
  }, [open, prayData.length, fetchPrayTimes])

  const getVakitIcon = (vakit: string) => {
    const v = vakit.toLowerCase()
    if (v.includes("imsak")) return <Sunrise className="w-5 h-5 text-indigo-500" />
    if (v.includes("güneş")) return <Sun className="w-5 h-5 text-amber-500" />
    if (v.includes("öğle")) return <Sun className="w-5 h-5 text-yellow-500" />
    if (v.includes("ikindi")) return <CloudSun className="w-5 h-5 text-orange-500" />
    if (v.includes("akşam")) return <Sunset className="w-5 h-5 text-rose-500" />
    if (v.includes("yatsı")) return <CloudMoon className="w-5 h-5 text-slate-500" />
    return <Clock className="w-5 h-5 text-stone-400" />
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-52 z-20 h-10 w-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-stone-600"
          aria-label="Namaz Vakitleri"
        >
          <Moon className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl bg-stone-50 border-none shadow-2xl rounded-3xl p-6 flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between shrink-0 mb-4">
          <DialogTitle className="text-2xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
            <Moon className="w-6 h-6 text-indigo-600" />
            Namaz Vakitleri
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
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AnimatedOrb size={64} variant="default" />
            <span className="text-stone-500 font-medium">Vakitler yükleniyor...</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {prayData.map((item, idx) => (
                <Card key={idx} className="border-none shadow-sm rounded-2xl bg-white overflow-hidden group hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-stone-50 group-hover:bg-stone-100 transition-colors">
                        {getVakitIcon(item.vakit)}
                      </div>
                      <span className="font-bold text-stone-700">{item.vakit}</span>
                    </div>
                    <span className="text-xl font-black text-stone-900 tabular-nums">
                      {item.saat}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
            {prayData.length === 0 && !loading && !error && (
              <div className="text-center py-20 text-stone-400">Vakit verisi bulunamadı.</div>
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
            onClick={() => fetchPrayTimes(true)}
            disabled={loading}
            className="rounded-full shadow-md bg-stone-800 hover:bg-stone-900 text-white gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Vakitleri Güncelle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
