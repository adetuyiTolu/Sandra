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
      case "positive": return "text-[#A0A0A0] bg-[#1A1A1A] border-[#333]"
      case "warning": return "text-[#888] bg-[#111] border-[#222]"
      case "neutral": default: return "text-[#666] bg-[#111] border-[#222]"
    }
  }

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-semibold text-[#EAEAEA]">Platform Activity</h2>
        
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

      <div className="flex flex-col gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="glass-card rounded-xl p-4 hover:-translate-y-1 transition-all duration-300 shadow-sm">
            <div className="text-[11px] font-semibold text-[#888] uppercase tracking-wider mb-2">
              {m.label}
            </div>
            <div className="flex items-end justify-between mb-2">
              <div className="text-xl font-bold text-[#EAEAEA]">{m.value}</div>
              <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getTrendColor(m.trendType)}`}>
                {m.trend}
              </div>
            </div>
            <div className="text-[11px] text-[#666]">
              {m.subtext}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
