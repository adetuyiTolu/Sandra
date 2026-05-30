"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Circle, ArrowRight } from "lucide-react"
import { sandraBriefing } from "@/lib/mock/home"
import { Skeleton } from "@/components/ui/skeleton"

export function SandraBriefing({ refreshTrigger }: { refreshTrigger: number }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [refreshTrigger])

  return (
    <div className="relative w-full glass-card rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-premium">
      {/* Left Teal Border Accent */}
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#37b7ab]" />

      <div className="p-5 pl-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Circle size={8} className="fill-[#37b7ab] text-[#37b7ab] animate-pulse" />
            <span className="text-[11px] font-bold text-[#888] tracking-widest uppercase">
              Sandra's Briefing
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {!loading && sandraBriefing.agents.map((agent, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1A1A1A] border border-[#333]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-[#A0A0A0]">{agent}</span>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 mb-6">
            <Skeleton className="h-4 w-full bg-[#1A1A1A]" />
            <Skeleton className="h-4 w-[95%] bg-[#1A1A1A]" />
            <Skeleton className="h-4 w-[98%] bg-[#1A1A1A]" />
            <Skeleton className="h-4 w-[80%] bg-[#1A1A1A]" />
          </div>
        ) : (
          <p className="text-[13px] leading-relaxed text-[#D1D1D1] mb-5">
            {sandraBriefing.text}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {loading ? (
            <div className="flex gap-3">
              <Skeleton className="h-8 w-32 bg-[#1A1A1A] rounded-md" />
              <Skeleton className="h-8 w-32 bg-[#1A1A1A] rounded-md" />
              <Skeleton className="h-8 w-40 bg-[#1A1A1A] rounded-md" />
            </div>
          ) : (
            <>
              <Link 
                href="/operations"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#EAEAEA] bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10 rounded-md transition-colors"
              >
                Review Operations Queue <ArrowRight size={14} className="text-[#888]" />
              </Link>
              <Link 
                href="/alerts"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#EAEAEA] bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10 rounded-md transition-colors"
              >
                View Critical Alert <ArrowRight size={14} className="text-[#888]" />
              </Link>
              <Link 
                href={`/chat?prefill=${encodeURIComponent("What workflows are affected by the CBN KYC circular update?")}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#37b7ab] bg-[#37b7ab]/5 hover:bg-[#37b7ab]/10 border border-transparent hover:border-[#37b7ab]/20 rounded-md transition-colors"
              >
                Check Compliance Impact <ArrowRight size={14} className="text-[#37b7ab]" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
