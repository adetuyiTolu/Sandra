"use client"

import { useState } from "react"
import Link from "next/link"
import { Wallet, Plus, Eye, EyeOff } from "lucide-react"
import { billingSnapshot } from "@/lib/mock/home"

export function BillingSnapshot() {
  const [showBalance, setShowBalance] = useState(true)
  const progressColor = billingSnapshot.usagePercent > 95 ? "bg-rose-500" : billingSnapshot.usagePercent > 80 ? "bg-amber-500" : "bg-emerald-500"

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-semibold text-[#EAEAEA]">Billing & Wallet</h2>
        <Link 
          href="/reports/billing"
          className="text-xs font-medium text-[#37b7ab] hover:text-[#2da096] transition-colors"
        >
          View Details
        </Link>
      </div>

      <div className="glass-card rounded-xl p-4 hover:-translate-y-1 transition-all duration-300 shadow-sm">
        
        {/* Wallet Section */}
        <div className="flex items-center justify-between mb-6 pb-5 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center">
              <Wallet size={18} className="text-[#A0A0A0]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="text-[11px] font-medium text-[#888] uppercase tracking-wider">Wallet Balance</div>
                <button 
                  onClick={() => setShowBalance(!showBalance)} 
                  className="text-[#666] hover:text-[#EAEAEA] transition-colors"
                  aria-label={showBalance ? "Hide balance" : "Show balance"}
                >
                  {showBalance ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              <div className="text-lg font-bold text-white">
                {showBalance ? `₦${billingSnapshot.walletBalance.toLocaleString()}` : "₦ * * * *"}
              </div>
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EAEAEA] text-[#0A0A0A] hover:bg-white rounded-md text-xs font-bold transition-colors">
            <Plus size={14} /> Fund Wallet
          </button>
        </div>

        {/* Billing Usage */}
        <div className="text-[11px] font-medium text-[#888] uppercase tracking-wider mb-2">
          Current Period: {billingSnapshot.period}
        </div>
        
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-[#EAEAEA]">
            {billingSnapshot.usagePercent}%
          </span>
          <span className="text-xs text-[#666]">quota used</span>
        </div>

        <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full ${progressColor} rounded-full transition-all duration-500`}
            style={{ width: `${billingSnapshot.usagePercent}%` }}
          />
        </div>

        <div className="flex items-center justify-end text-[11px] text-[#888] mb-1">
          <span>{100 - billingSnapshot.usagePercent}% remaining</span>
        </div>

      </div>
    </div>
  )
}
