"use client"

import Link from "next/link"
import { ShieldCheck, Bell, FileText, Zap } from "lucide-react"
import { activityFeed } from "@/lib/mock/home"

export function RecentActivityFeed() {
  const getIcon = (type: string) => {
    switch (type) {
      case "verification": return <ShieldCheck size={14} className="text-emerald-400" />
      case "alert": return <Bell size={14} className="text-rose-400" />
      case "case": return <FileText size={14} className="text-blue-400" />
      case "fraud": return <Zap size={14} className="text-amber-400" />
      default: return <ShieldCheck size={14} className="text-[#888]" />
    }
  }

  if (activityFeed.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-[#EAEAEA] mb-4">Recent Activity</h2>
        <div className="w-full rounded-xl border border-[#222] bg-[#111] p-5 text-center">
          <p className="text-sm text-[#888]">No activity yet. Platform events will appear here as your team and customers use Prembly.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#EAEAEA]">Recent Activity</h2>
        <Link 
          href="/reports/verification-reports"
          className="text-xs font-medium text-[#37b7ab] hover:text-[#2da096] transition-colors"
        >
          View All
        </Link>
      </div>
      
      <div className="w-full glass-card rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-premium">
        <div className="divide-y divide-[#222]">
          {activityFeed.map((item) => (
            <div key={item.id} className="flex items-center p-3 hover:bg-white/[0.02] transition-colors group">
              <div className="w-7 h-7 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center shrink-0 mr-3">
                {getIcon(item.type)}
              </div>
              
              <div className="flex-1 min-w-0 pr-4">
                <div className="text-[13px] text-[#A0A0A0] truncate">
                  {item.description} <span className="mx-1.5 text-[#555]">·</span> 
                  <span className="font-semibold text-[#EAEAEA]">{item.entity}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-[11px] text-[#777] font-mono">{item.timestamp}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                  item.source === "Sandra" 
                    ? "bg-[#37b7ab]/10 text-[#37b7ab] border-[#37b7ab]/20" 
                    : "bg-[#1A1A1A] text-[#888] border-[#333]"
                }`}>
                  {item.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
