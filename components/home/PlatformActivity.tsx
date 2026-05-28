"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { platformActivityData } from "@/lib/mock/home"

type DateRange = keyof typeof platformActivityData

export function PlatformActivity() {
  const [dateRange, setDateRange] = useState<DateRange>("Last 7 days")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const ranges: DateRange[] = ["Today", "Last 7 days", "Last 30 days", "This month"]

  const metrics = platformActivityData[dateRange]

  const getTrendColor = (type: string) => {
    switch(type) {
      case "positive": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
      case "warning": return "text-amber-400 bg-amber-400/10 border-amber-400/20"
      case "neutral": default: return "text-[#888] bg-white/5 border-white/10"
    }
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#EAEAEA]">Platform Activity</h2>
        
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#EAEAEA] bg-[#111] border border-[#333] rounded-md hover:bg-[#1A1A1A] transition-colors"
          >
            {dateRange} <ChevronDown size={14} className="text-[#888]" />
          </button>
          
          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-36 bg-[#111] border border-[#333] rounded-md shadow-xl z-20 overflow-hidden">
                {ranges.map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      setDateRange(r)
                      setDropdownOpen(false)
                    }}
                    className={`block w-full text-left px-3 py-2 text-xs transition-colors ${
                      r === dateRange ? "bg-[#222] text-white" : "text-[#888] hover:bg-[#1A1A1A] hover:text-[#EAEAEA]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="glass-card rounded-xl p-5 hover:-translate-y-1 transition-all duration-300 shadow-premium">
            <div className="text-[11px] font-semibold text-[#888] uppercase tracking-wider mb-2">
              {m.label}
            </div>
            <div className="flex items-end justify-between mb-3">
              <div className="text-2xl font-bold text-[#EAEAEA]">{m.value}</div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTrendColor(m.trendType)}`}>
                {m.trend}
              </div>
            </div>
            <div className="text-xs text-[#666]">
              {m.subtext}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
