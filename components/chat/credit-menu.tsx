"use client"

import { useState, useCallback, useEffect } from "react"
import { Landmark, RefreshCw, AlertCircle, Home, Briefcase, Percent, Clock } from "lucide-react"
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

interface CreditItem {
  bank: string
  kredi: string
  faiz: string
  min: string
  max: string
}

export function CreditMenu() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("konut")
  const [credits, setCredits] = useState<CreditItem[]>([])
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCredits = useCallback(async (type: string, isRefresh = false) => {
    setLoading(true)
    setError(null)
    setCredits([])

    try {
      const params = new URLSearchParams({ type })
      if (isRefresh) params.set("refresh", "true")

      const res = await fetch(`/api/credits?${params.toString()}`)
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Kredi bilgileri alınamadı")
      }

      const data = await res.json()
      if (data.success && data.result) {
        setCredits(data.result)
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

  // Load on open
  useEffect(() => {
    if (open && credits.length === 0 && !loading) {
      fetchCredits(activeTab, false)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setCredits([])
    setLastUpdated(null)
    fetchCredits(tab, false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-28 z-20 h-10 w-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-stone-600"
          aria-label="Kredi Faiz Oranları"
        >
          <Landmark className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl bg-stone-50 border-none shadow-2xl rounded-3xl p-6 h-[85vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between shrink-0 mb-2">
          <DialogTitle className="text-2xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
            <Landmark className="w-6 h-6 text-stone-600" />
            Banka Kredi Faizleri
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

        <div className="shrink-0 mb-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-stone-200/50 rounded-xl p-1">
              <TabsTrigger value="konut" className="rounded-lg font-medium flex items-center gap-2">
                <Home className="w-4 h-4" /> Konut Kredisi
              </TabsTrigger>
              <TabsTrigger value="ihtiyac" className="rounded-lg font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> İhtiyaç Kredisi
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <AnimatedOrb size={64} variant="default" />
            <span className="text-stone-500 font-medium">Banka verileri alınıyor...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {credits.map((item, idx) => (
                <Card key={idx} className="border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow bg-white">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-stone-800 text-lg">{item.bank}</h3>
                        <p className="text-xs text-stone-500 font-medium line-clamp-1">{item.kredi}</p>
                      </div>
                      <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5" />
                        <span className="font-bold text-lg">{item.faiz.replace('%', '')}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 text-xs font-semibold text-stone-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Vade: {item.min} - {item.max}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {credits.length === 0 && !loading && !error && (
              <div className="text-center py-20 text-stone-400">Gösterilecek kredi verisi bulunamadı.</div>
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
            onClick={() => fetchCredits(activeTab, true)}
            disabled={loading}
            className="rounded-full shadow-md bg-stone-800 hover:bg-stone-900 text-white gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Oranları Güncelle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
