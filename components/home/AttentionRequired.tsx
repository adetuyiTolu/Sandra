"use client"

import Link from "next/link"
import { Bell, Clock, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react"
import { attentionRequired } from "@/lib/mock/home"

export function AttentionRequired() {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "bell": return <Bell size={16} className="text-[#888]" />
      case "clock": return <Clock size={16} className="text-[#888]" />
      case "shield": return <ShieldAlert size={16} className="text-[#888]" />
      default: return <Bell size={16} className="text-[#888]" />
    }
  }

  if (attentionRequired.length === 0) {
    return (
      <div className="mb-5">
        <h2 className="text-[13px] font-semibold text-[#EAEAEA] mb-3">Attention Required</h2>
        <div className="w-full rounded-xl border border-[#222] bg-[#111] p-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 size={18} className="text-[#888]" />
            <h3 className="font-bold text-[#EAEAEA]">All Clear</h3>
          </div>
          <p className="text-sm text-[#888] mb-4">No critical items require your attention right now</p>
          <div className="text-[11px] text-[#555] flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#37b7ab] animate-pulse" />
            Sandra checked all queues and agents 2 minutes ago
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-5">
      <h2 className="text-[13px] font-semibold text-[#EAEAEA] mb-3">Attention Required</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {attentionRequired.map((item, i) => (
          <div 
            key={i} 
            className="glass-card rounded-xl border border-[#222] p-5 flex flex-col hover:-translate-y-1 transition-all duration-300 shadow-premium bg-[#111]"
          >
            <div className="flex items-center gap-2 mb-3">
              {getIcon(item.icon)}
              <span className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">{item.label}</span>
            </div>
            
            <div className="text-lg font-bold text-[#EAEAEA] mb-1.5">{item.value}</div>
            
            <p className="text-[11px] text-[#888] leading-relaxed mb-4 flex-1">
              {item.description}
            </p>
            
            <div className="mt-auto pt-4 border-t border-[#222]">
              <Link 
                href={item.action.href}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                  item.action.label.includes("Sandra") 
                    ? "text-[#37b7ab] hover:text-[#2da096]" 
                    : "text-[#EAEAEA] hover:text-white"
                }`}
              >
                {item.action.label} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
