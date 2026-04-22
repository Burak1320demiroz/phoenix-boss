"use client"

import { useState, useCallback } from "react"
import {
  Grip, TrendingUp, TrendingDown, RefreshCw, AlertCircle,
  Droplets, Wind, Thermometer, CloudSun, DollarSign, Euro, PoundSterling, Coins
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

// ─── Types ──────────────────────────────────────────────────────────────────

interface GoldPrice {
  name: string
  buying: number
  buyingstr: string
  selling: number
  sellingstr: string
}

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

interface CurrencyData {
  name: string
  buying: string
  selling: string
}

interface SilverData {
  buyingstr: string
  sellingstr: string
  rate: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// ─── Component ───────────────────────────────────────────────────────────────

export function WidgetsMenu() {
  const [goldData, setGoldData] = useState<GoldPrice[]>([])
  const [goldLastUpdated, setGoldLastUpdated] = useState<string | null>(null)
  const [loadingGold, setLoadingGold] = useState(false)
  const [goldError, setGoldError] = useState<string | null>(null)

  const [currencyData, setCurrencyData] = useState<CurrencyData[]>([])
  const [currencyLastUpdated, setCurrencyLastUpdated] = useState<string | null>(null)
  const [loadingCurrency, setLoadingCurrency] = useState(false)
  const [currencyError, setCurrencyError] = useState<string | null>(null)

  const [silverData, setSilverData] = useState<SilverData | null>(null)
  const [silverLastUpdated, setSilverLastUpdated] = useState<string | null>(null)
  const [loadingSilver, setLoadingSilver] = useState(false)
  const [silverError, setSilverError] = useState<string | null>(null)

  const fetchGoldPrices = useCallback(async (isRefresh = false) => {
    try {
      setLoadingGold(true)
      setGoldError(null)

      const url = isRefresh ? "/api/gold?refresh=true" : "/api/gold"
      const res = await fetch(url)
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Altın fiyatları alınamadı")
      }

      const data = await res.json()
      if (data.success && data.result) {
        const targetNames = ["ONS Altın", "Gram Altın", "Çeyrek Altın"]
        const extracted = data.result.filter((item: GoldPrice) =>
          targetNames.includes(item.name)
        )
        setGoldData(extracted)
        setGoldLastUpdated(data.lastUpdated || new Date().toLocaleString("tr-TR"))
      } else {
        throw new Error("Geçersiz API yanıtı")
      }
    } catch (err: unknown) {
      setGoldError(err instanceof Error ? err.message : "Bilinmeyen hata")
    } finally {
      setLoadingGold(false)
    }
  }, [])

  const fetchCurrencies = useCallback(async (isRefresh = false) => {
    try {
      setLoadingCurrency(true)
      setCurrencyError(null)
      const url = isRefresh ? "/api/currency?refresh=true" : "/api/currency"
      const res = await fetch(url)
      if (!res.ok) throw new Error("Döviz kurları alınamadı")
      const data = await res.json()
      if (data.success && data.result) {
        const targetNames = ["USD Amerikan Doları", "EUR Euro", "GBP İngiliz Sterlini"]
        const extracted = data.result.filter((item: CurrencyData) =>
          targetNames.some(target => item.name.includes(target))
        )
        setCurrencyData(extracted)
        setCurrencyLastUpdated(data.lastUpdated || new Date().toLocaleString("tr-TR"))
      }
    } catch (err: unknown) {
      setCurrencyError(err instanceof Error ? err.message : "Döviz hatası")
    } finally {
      setLoadingCurrency(false)
    }
  }, [])

  const fetchSilver = useCallback(async (isRefresh = false) => {
    try {
      setLoadingSilver(true)
      setSilverError(null)
      const url = isRefresh ? "/api/silver?refresh=true" : "/api/silver"
      const res = await fetch(url)
      if (!res.ok) throw new Error("Gümüş fiyatı alınamadı")
      const data = await res.json()
      if (data.success && data.result) {
        setSilverData(data.result)
        setSilverLastUpdated(data.lastUpdated || new Date().toLocaleString("tr-TR"))
      }
    } catch (err: unknown) {
      setSilverError(err instanceof Error ? err.message : "Gümüş hatası")
    } finally {
      setLoadingSilver(false)
    }
  }, [])

  const handleOpen = (open: boolean) => {
    if (open) {
      fetchGoldPrices(false)
      fetchCurrencies(false)
      fetchSilver(false)
    }
  }

  const handleRefresh = () => {
    fetchGoldPrices(true)
    fetchCurrencies(true)
    fetchSilver(true)
  }

  const getGoldCard = (name: string) => goldData.find(g => g.name === name)

  const renderGoldCard = (name: string) => {
    const gold = getGoldCard(name)
    return (
      <Card className="border-none shadow-md rounded-2xl bg-amber-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100 rounded-bl-full -mr-4 -mt-4 opacity-50" />
        <CardHeader className="pb-2 relative z-10 pt-4">
          <CardTitle className="text-sm font-semibold text-amber-800 flex justify-between items-center">
            {name === "ONS Altın" ? "ONS" : name}
            {gold && gold.buying > 0
              ? <TrendingUp className="w-4 h-4 text-emerald-500" />
              : <TrendingDown className="w-4 h-4 text-red-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          {loadingGold && !gold ? (
            <div className="animate-pulse h-8 bg-amber-100 rounded w-3/4 mb-2" />
          ) : gold ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-amber-900">{gold.buyingstr}</span>
                <span className="text-xs font-semibold text-amber-600 mb-1">₺</span>
              </div>
              <div className="text-[10px] text-amber-700/80 uppercase font-medium tracking-wider">
                Satış: {gold.sellingstr}
              </div>
            </div>
          ) : (
            <div className="text-stone-400 text-sm">Veri yok</div>
          )}
        </CardContent>
      </Card>
    )
  }

  const getCurrencyCardData = (code: string) => {
    if (code === "USD") return currencyData.find(c => c.name.includes("USD"))
    if (code === "EUR") return currencyData.find(c => c.name.includes("EUR"))
    if (code === "GBP") return currencyData.find(c => c.name.includes("GBP"))
    return null
  }

  const renderCurrencyCard = (code: string) => {
    const data = getCurrencyCardData(code)
    const icons: { [key: string]: React.ReactNode } = {
      USD: <DollarSign className="w-4 h-4 text-emerald-600" />,
      EUR: <Euro className="w-4 h-4 text-blue-600" />,
      GBP: <PoundSterling className="w-4 h-4 text-indigo-600" />
    }

    return (
      <Card className="border-none shadow-md rounded-2xl bg-zinc-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-zinc-200/50 rounded-bl-full -mr-4 -mt-4 opacity-50" />
        <CardHeader className="pb-2 relative z-10 pt-4">
          <CardTitle className="text-sm font-semibold text-zinc-800 flex justify-between items-center uppercase tracking-wider">
            {code}
            {icons[code]}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          {loadingCurrency && !data ? (
            <div className="animate-pulse h-8 bg-zinc-200 rounded w-3/4 mb-2" />
          ) : data ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-zinc-900">{data.selling}</span>
                <span className="text-xs font-semibold text-zinc-500 mb-1">₺</span>
              </div>
              <div className="text-[10px] text-zinc-500 uppercase font-medium tracking-wider">
                Alış: {data.buying}
              </div>
            </div>
          ) : (
            <div className="text-stone-400 text-sm">Veri yok</div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderSilverCard = () => {
    return (
      <Card className="border-none shadow-md rounded-2xl bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-slate-200 rounded-bl-full -mr-4 -mt-4 opacity-50" />
        <CardHeader className="pb-2 relative z-10 pt-4">
          <CardTitle className="text-sm font-semibold text-slate-800 flex justify-between items-center">
            GÜMÜŞ
            <Coins className="w-4 h-4 text-slate-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          {loadingSilver && !silverData ? (
            <div className="animate-pulse h-8 bg-slate-200 rounded w-3/4 mb-2" />
          ) : silverData ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-slate-900">{silverData.sellingstr}</span>
                <span className="text-xs font-semibold text-slate-600 mb-1">₺</span>
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">
                Alış: {silverData.buyingstr}
              </div>
            </div>
          ) : (
            <div className="text-stone-400 text-sm">Veri yok</div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-stone-600"
          aria-label="Araçlar Menüsü"
        >
          <Grip className="w-5 h-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-6xl bg-stone-50 border-none shadow-2xl rounded-3xl p-6">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold text-stone-800 tracking-tight">Araçlar</DialogTitle>
          {(goldLastUpdated || currencyLastUpdated || silverLastUpdated) && (
            <div className="text-xs text-stone-500 font-medium pb-2 pr-8">
              Son Güncelleme: {goldLastUpdated || currencyLastUpdated || silverLastUpdated}
            </div>
          )}
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">

          {/* Cards 1, 2, 3: Gold Prices */}
          {renderGoldCard("ONS Altın")}
          {renderGoldCard("Gram Altın")}
          {renderGoldCard("Çeyrek Altın")}

          {/* Cards 5, 6, 7: Currencies */}
          {renderCurrencyCard("USD")}
          {renderCurrencyCard("EUR")}
          {renderCurrencyCard("GBP")}

          {/* Card 8: Silver */}
          {renderSilverCard()}

          {/* Remaining 5 placeholder cards (12 total) */}
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-none shadow-sm rounded-2xl bg-white flex flex-col justify-center items-center py-6 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-0 text-center text-stone-400 opacity-60">
                <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-100 mx-auto mb-3 flex items-center justify-center">
                  <div className="w-4 h-4 bg-stone-200 rounded-sm" />
                </div>
                <span className="text-xs font-semibold">Boş Araç {i + 8}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {(goldError || currencyError || silverError) && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            <AlertCircle className="w-4 h-4" />
            <span className="flex-1 font-medium">{goldError || currencyError || silverError}</span>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button
            variant="default"
            onClick={handleRefresh}
            disabled={loadingGold || loadingCurrency || loadingSilver}
            className="rounded-full shadow-md bg-stone-800 hover:bg-stone-900 text-white gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${(loadingGold || loadingCurrency || loadingSilver) ? "animate-spin" : ""}`} />
            Yenile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
