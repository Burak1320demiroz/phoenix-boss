"use client"

import { useState, useCallback, useEffect } from "react"
import { Apple, RefreshCw, AlertCircle, Carrot, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AnimatedOrb } from "./animated-orb"

interface FoodResult {
  mevsim_meyve: string[]
  mevsim_sebze: string[]
  her_zaman_sebze: string[]
}

export function FoodMenu() {
  const [open, setOpen] = useState(false)
  
  // Logic to get the current month number (1-12)
  const currentMonthNum = (new Date().getMonth() + 1).toString()

  const [foodData, setFoodData] = useState<FoodResult | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFood = useCallback(async (isRefresh = false) => {
    setLoading(true)
    setError(null)
    setFoodData(null)

    try {
      // Use the month number calculated above
      const url = isRefresh ? `/api/food?month=${currentMonthNum}&refresh=true` : `/api/food?month=${currentMonthNum}`
      const res = await fetch(url)
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Gıda bilgisi alınamadı")
      }

      const data = await res.json()
      if (data.success && data.result) {
        setFoodData(data.result)
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
  }, [currentMonthNum])

  useEffect(() => {
    if (open && !foodData && !loading) {
      fetchFood(false)
    }
  }, [open, foodData, loading, fetchFood])

  const renderFoodList = (title: string, items: string[], icon: React.ReactNode, bgColor: string, textColor: string) => (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${bgColor} ${textColor} w-fit font-bold text-sm mb-1`}>
        {icon}
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white border border-stone-100 shadow-sm px-4 py-2 rounded-2xl text-sm font-semibold text-stone-700 hover:scale-105 transition-transform">
            {item}
          </div>
        ))}
        {items.length === 0 && <div className="text-stone-400 text-xs italic">Kayıt bulunamadı.</div>}
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-52 z-20 h-10 w-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-stone-600"
          aria-label="Mevsimlik Gidalar"
        >
          <Apple className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl bg-stone-50 border-none shadow-2xl rounded-3xl p-6 h-[85vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between shrink-0 mb-4">
          <DialogTitle className="text-2xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
            <Apple className="w-6 h-6 text-stone-600" />
            Mevsimlik Gıdalar
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

        <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-2xl w-fit shadow-md">
          <span className="text-sm font-black uppercase tracking-widest">Mevsimin Meyve ve Sebzeleri</span>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <AnimatedOrb size={64} variant="default" />
            <span className="text-stone-500 font-medium">Veriler hazırlanıyor...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
            {foodData ? (
              <>
                {renderFoodList("Mevsim Meyveleri", foodData.mevsim_meyve, <Apple className="w-4 h-4" />, "bg-rose-50", "text-rose-600")}
                {renderFoodList("Mevsim Sebzeleri", foodData.mevsim_sebze, <Carrot className="w-4 h-4" />, "bg-orange-50", "text-orange-600")}
                {renderFoodList("Her Zaman Tüketilebilen Sebzeler", foodData.her_zaman_sebze, <Leaf className="w-4 h-4" />, "bg-emerald-50", "text-emerald-600")}
              </>
            ) : (
              <div className="text-center py-20 text-stone-400">Veri yüklenemedi.</div>
            )}
          </div>
        )}

        {error && (
          <div className="shrink-0 mt-4 flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            <AlertCircle className="w-4 h-4" />
            <span className="flex-1 font-medium">{error}</span>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-stone-200 shrink-0 flex justify-end">
          <Button
            variant="default"
            onClick={() => fetchFood(true)}
            disabled={loading}
            className="rounded-full shadow-md bg-stone-800 hover:bg-stone-900 text-white gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Yenile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
