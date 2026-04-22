"use client"

import { useState, useCallback } from "react"
import { Sparkles, RefreshCw, AlertCircle, TrendingUp, Cloud, Newspaper, Wallet, Trophy, Fuel, BrainCircuit } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedOrb } from "./animated-orb"

interface AnalysisResult {
  finance: string
  life: string
  news: string
  investment: string
  sport: string
  logistics: string
}

export function AiAnalysisMenu() {
  const [open, setOpen] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalysis = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/analyze")
      if (!res.ok) throw new Error("Yapay zeka analizi alınamadı.")
      const data = await res.json()
      if (data.success && data.analysis) {
        setAnalysis(data.analysis)
      } else {
        throw new Error(data.error || "Beklenmedik bir hata oluştu.")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const onOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && !analysis) {
      fetchAnalysis()
    }
  }

  const renderCard = (title: string, content: string, icon: React.ReactNode, gradient: string) => (
    <Card className={`border-none shadow-xl rounded-3xl overflow-hidden bg-white group hover:scale-[1.02] transition-all duration-300`}>
      <CardHeader className={`pb-2 space-y-0 relative`}>
        <div className={`absolute top-0 left-0 w-full h-1 ${gradient}`} />
        <CardTitle className="text-sm font-black text-stone-500 flex items-center gap-2 uppercase tracking-widest pt-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <p className="text-stone-700 text-sm leading-relaxed font-medium italic">
          "{content}"
        </p>
      </CardContent>
    </Card>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-[304px] z-20 h-10 w-10 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 shadow-sm"
          aria-label="AI Analiz"
        >
          <Sparkles className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-6xl bg-stone-50 border-none shadow-2xl rounded-3xl p-6 h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between shrink-0 mb-6">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-3xl font-black text-stone-900 tracking-tighter flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-amber-500" />
              Jarvis AI Stratejik Analiz
            </DialogTitle>
            <p className="text-stone-500 text-sm font-bold">Widgets verilerinden anlık olarak üretilmiştir.</p>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <AnimatedOrb size={120} variant="default" />
            <div className="text-center">
              <h2 className="text-xl font-bold text-stone-800 animate-pulse">Tüm Veriler Analiz Ediliyor...</h2>
              <p className="text-stone-400 text-sm mt-1 uppercase tracking-widest font-bold">Lütfen bekleyin, Jarvis iş başında.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6">
            {analysis ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderCard("Finans & Piyasa", analysis.finance, <TrendingUp className="w-4 h-4 text-emerald-500" />, "bg-emerald-500")}
                {renderCard("Yaşam & Hava Durumu", analysis.life, <Cloud className="w-4 h-4 text-sky-500" />, "bg-sky-500")}
                {renderCard("Gündem & Haberler", analysis.news, <Newspaper className="w-4 h-4 text-orange-500" />, "bg-orange-500")}
                {renderCard("Kredi & Yatırım", analysis.investment, <Wallet className="w-4 h-4 text-indigo-500" />, "bg-indigo-500")}
                {renderCard("Spor Dünyası", analysis.sport, <Trophy className="w-4 h-4 text-amber-500" />, "bg-amber-500")}
                {renderCard("Ulaşım & Yakıt", analysis.logistics, <Fuel className="w-4 h-4 text-rose-500" />, "bg-rose-500")}
              </div>
            ) : (
              <div className="text-center py-40 text-stone-400">Analiz verisi bulunamadı. Lütfen "Yenile" butonuna basın.</div>
            )}
          </div>
        )}

        {error && (
          <div className="shrink-0 mt-4 flex items-center gap-2 p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100">
            <AlertCircle className="w-5 h-5" />
            <span className="flex-1 font-bold">{error}</span>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-stone-200 shrink-0 flex justify-end">
          <Button
            variant="default"
            onClick={fetchAnalysis}
            disabled={loading}
            className="rounded-full shadow-lg bg-stone-900 hover:bg-black text-white px-8 py-6 text-base font-black transition-all hover:scale-105 gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            Analizi Yenile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
