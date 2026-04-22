"use client"

import { useState, useEffect } from "react"
import { MapPin, Clock } from "lucide-react"

export function ClockDisplay() {
  const [time, setTime] = useState<string>("")
  const [dateStr, setDateStr] = useState<string>("")

  useEffect(() => {
    // Update every second
    const tick = () => {
      const now = new Date()
      
      // Format time
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      const seconds = now.getSeconds().toString().padStart(2, "0")
      setTime(`${hours}:${minutes}:${seconds}`)

      // Format date
      const options: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }
      setDateStr(now.toLocaleDateString('tr-TR', options))
    }

    tick()
    const timerId = setInterval(tick, 1000)
    return () => clearInterval(timerId)
  }, [])

  return (
    <div className="absolute top-4 left-16 z-20 flex flex-col items-start bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-stone-200 shadow-sm transition-all hover:bg-white">
      <div className="flex items-center gap-2">
        <MapPin className="w-3 h-3 text-red-500 fill-red-500" />
        <span className="text-[10px] font-bold text-stone-800 tracking-tighter uppercase">Bursa, Türkiye</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-black text-stone-900 tabular-nums">
          {time}
        </span>
        <div className="w-[1px] h-3 bg-stone-300" />
        <span className="text-[10px] font-medium text-stone-500">
          {dateStr}
        </span>
      </div>
    </div>
  )
}
