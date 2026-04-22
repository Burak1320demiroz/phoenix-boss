"use client"

import { useState, useCallback, useEffect } from "react"
import { Trophy, RefreshCw, AlertCircle, List, Calendar, Target, Medal, ChevronDown } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AnimatedOrb } from "./animated-orb"

interface LeagueInfo {
  league: string
  key: string
}

interface StandingItem {
  rank: string
  team: string
  play: string
  win: string
  draw: string
  lose: string
  point: string
}

interface ResultItem {
  home: string
  away: string
  score: string
  date: string
}

interface GoalKingItem {
  name: string
  goals: string
  play: string
}

export function FootballMenu() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("league")
  const [selectedLeague, setSelectedLeague] = useState<LeagueInfo>({ league: "Süper Lig", key: "super-lig" })
  const [leaguesList, setLeaguesList] = useState<LeagueInfo[]>([])
  
  const [data, setData] = useState<any[]>([])
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLeagues = useCallback(async () => {
    try {
      const res = await fetch("/api/football?type=list")
      const d = await res.json()
      if (d.success && d.result) {
        setLeaguesList(d.result)
      }
    } catch (err) {
      console.error("Failed to fetch leagues list", err)
    }
  }, [])

  const fetchFootball = useCallback(async (type: string, leagueKey: string, isRefresh = false) => {
    setLoading(true)
    setError(null)
    setData([])

    try {
      const params = new URLSearchParams({ type, league: leagueKey })
      if (isRefresh) params.set("refresh", "true")

      const res = await fetch(`/api/football?${params.toString()}`)
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Futbol bilgileri alınamadı")
      }

      const resData = await res.json()
      if (resData.success && resData.result) {
        setData(resData.result)
        setLastUpdated(resData.lastUpdated || null)
        setIsCached(resData.cached === true)
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
    if (open) {
      if (leaguesList.length === 0) fetchLeagues()
      fetchFootball(activeTab, selectedLeague.key, false)
    }
  }, [open, activeTab, selectedLeague.key, fetchFootball, fetchLeagues, leaguesList.length])

  const handleLeagueChange = (league: LeagueInfo) => {
    setSelectedLeague(league)
  }

  const renderStandings = () => (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold">
          <tr>
            <th className="px-4 py-3">Sıra</th>
            <th className="px-4 py-3 text-stone-800">Takım</th>
            <th className="px-4 py-3 text-center">O</th>
            <th className="px-4 py-3 text-center">G</th>
            <th className="px-4 py-3 text-center">M</th>
            <th className="px-4 py-3 text-center">P</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {data.map((item: StandingItem, idx) => (
            <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
              <td className="px-4 py-3 font-bold text-stone-400">#{item.rank}</td>
              <td className="px-4 py-3 font-bold text-stone-800">{item.team}</td>
              <td className="px-4 py-3 text-center font-medium">{item.play}</td>
              <td className="px-4 py-3 text-center font-medium text-emerald-600">{item.win}</td>
              <td className="px-4 py-3 text-center font-medium text-red-500">{item.lose}</td>
              <td className="px-4 py-3 text-center font-black text-stone-900">{item.point}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderResults = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((item: ResultItem, idx) => (
        <Card key={idx} className="border-none shadow-sm rounded-2xl bg-white group hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-center gap-2">
              <span className="flex-1 font-bold text-stone-800 text-right text-sm">{item.home}</span>
              <div className="bg-stone-100 px-3 py-1 rounded-lg font-black text-stone-900 text-base">
                {item.score}
              </div>
              <span className="flex-1 font-bold text-stone-800 text-left text-sm">{item.away}</span>
            </div>
            <div className="mt-2 text-center text-[10px] text-stone-400 font-medium">
              {item.date}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderGoalKings = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((item: GoalKingItem, idx) => (
        <Card key={idx} className="border-none shadow-sm rounded-2xl bg-white group overflow-hidden">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center font-bold text-amber-600 text-xs">
                {idx + 1}
              </div>
              <div>
                <h4 className="font-bold text-stone-800 text-sm">{item.name}</h4>
                <p className="text-[10px] text-stone-400 font-medium">{item.play} Maç</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-black">
              <Target className="w-3.5 h-3.5" />
              <span>{item.goals}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-40 z-20 h-10 w-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-stone-600"
          aria-label="Futbol Bilgileri"
        >
          <Trophy className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl bg-stone-50 border-none shadow-2xl rounded-3xl p-6 h-[85vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between shrink-0 mb-2">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-2xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-stone-600" />
              Futbol Dünyası
            </DialogTitle>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-fit h-7 px-2 rounded-lg text-xs font-bold border-stone-200 bg-white text-stone-700 gap-1 mt-1">
                  {selectedLeague.league}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto rounded-xl border-stone-200">
                {leaguesList.map((l) => (
                  <DropdownMenuItem 
                    key={l.key} 
                    onClick={() => handleLeagueChange(l)}
                    className="text-xs font-semibold text-stone-600 cursor-pointer"
                  >
                    {l.league}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {lastUpdated && (
            <div className="text-xs font-medium pr-8 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isCached ? "bg-amber-400" : "bg-emerald-500"}`} />
              <span className="text-stone-500">
                {isCached ? "Önbellekten" : "Güncellendi"}: {lastUpdated}
              </span>
            </div>
          )}
        </DialogHeader>

        <div className="shrink-0 mb-4 mt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-stone-200/50 rounded-xl p-1">
              <TabsTrigger value="league" className="rounded-lg font-medium flex items-center gap-2">
                <List className="w-4 h-4" /> Puan Durumu
              </TabsTrigger>
              <TabsTrigger value="results" className="rounded-lg font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Sonuçlar
              </TabsTrigger>
              <TabsTrigger value="goalKings" className="rounded-lg font-medium flex items-center gap-2">
                <Medal className="w-4 h-4" /> Gol Krallığı
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <AnimatedOrb size={64} variant="default" />
            <span className="text-stone-500 font-medium">{selectedLeague.league} verileri yükleniyor...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {activeTab === "league" && renderStandings()}
            {activeTab === "results" && renderResults()}
            {activeTab === "goalKings" && renderGoalKings()}
            {data.length === 0 && !loading && !error && (
              <div className="text-center py-20 text-stone-400">Veri bulunamadı.</div>
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
            onClick={() => fetchFootball(activeTab, selectedLeague.key, true)}
            disabled={loading}
            className="rounded-full shadow-md bg-stone-800 hover:bg-stone-900 text-white gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Verileri Yenile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
