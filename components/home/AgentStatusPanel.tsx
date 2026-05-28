"use client"

import Link from "next/link"
import { Circle, ArrowRight } from "lucide-react"
import { agentStatus } from "@/lib/mock/home"

export function AgentStatusPanel() {
  if (agentStatus.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-[#EAEAEA] mb-4">Connected Agents</h2>
        <div className="rounded-xl border border-[#222] bg-[#111] p-5 text-center">
          <p className="text-sm text-[#888] mb-3">No agents connected. Sandra is operating in manual mode. Some features are unavailable.</p>
          <Link href="/settings" className="text-xs text-[#37b7ab] hover:text-[#2da096]">
            Configure Agents <ArrowRight size={14} className="inline ml-1" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-[#EAEAEA] mb-4">Connected Agents</h2>
      
      <div className="flex flex-col gap-3">
        {agentStatus.map((agent, i) => {
          const isOperational = agent.state === "nominal"
          const isDegraded = agent.state === "degraded"
          const dotColor = isOperational ? "text-emerald-400 fill-emerald-400" : isDegraded ? "text-amber-400 fill-amber-400" : "text-rose-400 fill-rose-400"
          
          return (
            <div key={i} className="glass-card rounded-xl p-5 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-premium">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Circle size={10} className={`${dotColor} ${isOperational ? 'animate-pulse' : ''}`} />
                  <div>
                    <div className="font-semibold text-[#EAEAEA]">{agent.name}</div>
                    <div className="text-[11px] text-[#888] mt-0.5">
                      {isOperational && "Operational"}
                      {isDegraded && "Degraded · Responding slowly"}
                      {!isOperational && !isDegraded && "Disconnected · Sandra operating without this agent"}
                      {agent.lastQuery && ` · Last query ${agent.lastQuery}`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {agent.jurisdictions?.map(j => (
                  <span key={j} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#A0A0A0] font-mono">
                    {j}
                  </span>
                ))}
                {agent.capabilities?.map(c => (
                  <span key={c} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#A0A0A0]">
                    {c}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#222]">
                <div className="text-xs font-semibold text-[#EAEAEA]">{agent.stat}</div>
                
                {isOperational || isDegraded ? (
                  <Link 
                    href={agent.name.includes("Fraud") ? "/alerts" : "/chat"}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#37b7ab] hover:text-[#2da096] transition-colors"
                  >
                    {agent.name.includes("Fraud") ? "View Alerts" : "Query Agent"} <ArrowRight size={14} />
                  </Link>
                ) : (
                  <Link href="/platform/status" className="text-xs text-[#888] hover:text-white transition-colors">
                    Check Status
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
