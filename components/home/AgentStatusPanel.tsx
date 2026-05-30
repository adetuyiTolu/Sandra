"use client"

import Link from "next/link"
import { Circle, ArrowRight } from "lucide-react"
import { agentStatus } from "@/lib/mock/home"

export function AgentStatusPanel() {
  if (agentStatus.length === 0) {
    return (
    <div className="mb-5">
      <h2 className="text-[13px] font-semibold text-[#EAEAEA] mb-3">Connected Agents</h2>
      <div className="rounded-xl border border-[#222] bg-[#111] p-4 text-center">
        <p className="text-[13px] text-[#888] mb-3">No agents connected. Sandra is operating in manual mode. Some features are unavailable.</p>
          <Link href="/settings" className="text-xs text-[#37b7ab] hover:text-[#2da096]">
            Configure Agents <ArrowRight size={14} className="inline ml-1" />
          </Link>
        </div>
      </div>
    )
  }

  return (
  <div className="mb-5">
    <h2 className="text-[13px] font-semibold text-[#EAEAEA] mb-3">Connected Agents</h2>
    
    <div className="glass-card rounded-xl overflow-hidden shadow-sm">
      <div className="divide-y divide-[#222]">
        {agentStatus.map((agent, i) => {
          const state = agent.state as string
          const isOperational = state === "nominal"
          const isDegraded = state === "degraded"
          const dotColor = isOperational ? "text-emerald-400 fill-emerald-400" : isDegraded ? "text-amber-400 fill-amber-400" : "text-rose-400 fill-rose-400"
          
          return (
            <div key={i} className="p-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center gap-3">
                <Circle size={8} className={`${dotColor} ${isOperational ? 'animate-pulse' : ''}`} />
                <div className="font-medium text-[#EAEAEA] text-[13px]">{agent.name}</div>
              </div>
              <div className="text-[11px] text-[#888]">
                {isOperational && "Operational"}
                {isDegraded && "Degraded"}
                {!isOperational && !isDegraded && "Disconnected"}
              </div>
            </div>
          )
        })}
      </div>
    </div>
    </div>
  )
}
