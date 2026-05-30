"use client"

import Link from "next/link"
import { Circle } from "lucide-react"
import { operationsQueueStatus } from "@/lib/mock/home"

export function OperationsSnapshot() {
  const totalItems = operationsQueueStatus.reduce((acc, q) => acc + q.count, 0)

  if (totalItems === 0) {
    return (
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-semibold text-[#EAEAEA]">Operations Queue</h2>
          <Link href="/operations" className="text-xs text-[#37b7ab] hover:text-[#2da096]">
            Go to Operations
          </Link>
        </div>
        <div className="rounded-xl border border-[#222] bg-[#111] p-5 text-center">
          <p className="text-sm text-[#888]">All queues are clear. Sandra is monitoring for new items.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-semibold text-[#EAEAEA]">Operations Queue</h2>
        <Link href="/operations" className="text-xs font-medium text-[#37b7ab] hover:text-[#2da096] transition-colors">
          Go to Operations
        </Link>
      </div>

      <div className="glass-card rounded-xl p-3.5 hover:-translate-y-1 transition-all duration-300 shadow-sm">
        <div className="flex flex-col gap-3">
          {operationsQueueStatus.map((queue, i) => {
            const dotColor = queue.dot === "red" ? "text-rose-500 fill-rose-500" : queue.dot === "amber" ? "text-amber-500 fill-amber-500" : "text-emerald-500 fill-emerald-500"
            const riskPct = Math.round(queue.highRiskRatio * 100)
            
            return (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Circle size={8} className={dotColor} />
                    <span className="text-xs font-medium text-[#EAEAEA]">{queue.name}</span>
                  </div>
                  <div className="text-xs font-bold text-white">{queue.count} items</div>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-5 pt-4 border-t border-[#222]">
          <p className="text-[11px] text-[#888] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#37b7ab] animate-pulse" />
            Sandra has pre-assessed all {totalItems} items. 4 require urgent attention.
          </p>
        </div>
      </div>
    </div>
  )
}
