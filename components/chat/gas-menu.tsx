"use client"

import { useState, useCallback, useEffect } from "react"
import { Fuel, RefreshCw, AlertCircle, Droplets, Gauge, MapPin } from "lucide-react"
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

interface GasResult {
  gasoline: string
  diesel: string
  lpg: string
  currency: string
  unit: string
}

export function GasMenu() {
  const [open, setOpen] = useState(false)
  const [gasData, setGasData] = useState<GasResult | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGasPrices = useCallback(async (isRefresh = false) => {
    setLoading(true)
    setError(null)

    try {
      const url = isRefresh ? "/api/gas?refresh=true&city=bursa" : "/api/gas?city=bursa"
      const res = await fetch(url)
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Akaryakıt fiyatları alınamadı")
      }

      const data = await res.json()
      if (data.success && data.result) {
        setGasData(data.result)
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
    if (open && !gasData) {
      fetchGasPrices(false)
    }
  }, [open, gasData, fetchGasPrices])

  const renderGasCard = (label: string, value: string, icon: React.ReactNode, color: string) => (
    <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden group hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">{label}</span>
          <div className={`p-2 rounded-xl bg-stone-50 group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-black ${color}`}>{value}</span>
          <span className="text-[10px] font-bold text-stone-400 uppercase">{gasData?.currency} / {gasData?.unit}</span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-64 z-20 h-10 w-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-stone-600"
          aria-label="Akaryakıt Fiyatları"
        >
          <Fuel className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl bg-stone-50 border-none shadow-2xl rounded-3xl p-6 flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between shrink-0 mb-4">
          <DialogTitle className="text-2xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
            <Fuel className="w-6 h-6 text-orange-600" />
            Akaryakıt Fiyatları
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
            <span className="text-stone-500 font-medium">Fiyatlar güncelleniyor...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gasData && (
              <>
                {renderGasCard("Kurşunsuz 95", gasData.gasoline, <Gauge className="w-5 h-5 text-orange-500" />, "text-orange-600")}
                {renderGasCard("Motorin", gasData.diesel, <Droplets className="w-5 h-5 text-blue-500" />, "text-blue-600")}
                {renderGasCard("LPG Otogaz", gasData.lpg, <Fuel className="w-5 h-5 text-emerald-500" />, "text-emerald-600")}
              </>
            )}
            {!gasData && !loading && !error && (
              <div className="col-span-3 text-center py-20 text-stone-400">Fiyat verisi bulunamadı.</div>
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
            onClick={() => fetchGasPrices(true)}
            disabled={loading}
            className="rounded-full shadow-md bg-stone-800 hover:bg-stone-900 text-white gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Fiyatları Yenile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
