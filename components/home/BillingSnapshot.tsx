"use client"

import Link from "next/link"
import { Wallet, Plus } from "lucide-react"
import { billingSnapshot } from "@/lib/mock/home"

export function BillingSnapshot() {
  const progressColor = billingSnapshot.usagePercent > 95 ? "bg-rose-500" : billingSnapshot.usagePercent > 80 ? "bg-amber-500" : "bg-emerald-500"

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#EAEAEA]">Billing & Wallet</h2>
        <Link 
          href="/reports/billing"
          className="text-xs font-medium text-[#37b7ab] hover:text-[#2da096] transition-colors"
        >
          View Details
        </Link>
      </div>

      <div className="glass-card rounded-xl p-5 hover:-translate-y-1 transition-all duration-300 shadow-premium">
        
        {/* Wallet Section */}
        <div className="flex items-center justify-between mb-6 pb-5 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center">
              <Wallet size={18} className="text-[#A0A0A0]" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-[#888] uppercase tracking-wider mb-0.5">Wallet Balance</div>
              <div className="text-lg font-bold text-white">₦{billingSnapshot.walletBalance.toLocaleString()}</div>
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
          <span className="text-2xl font-bold text-[#EAEAEA]">₦{billingSnapshot.amountUsed.toLocaleString()}</span>
          <span className="text-xs text-[#666]">used</span>
        </div>

        <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full ${progressColor} rounded-full transition-all duration-500`}
            style={{ width: `${billingSnapshot.usagePercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#888] mb-6">
          <span>{billingSnapshot.usagePercent}% of quota</span>
          <span>₦{billingSnapshot.creditRemaining.toLocaleString()} remaining</span>
        </div>

        {/* Breakdown */}
        <div className="space-y-3 mb-6">
          {billingSnapshot.breakdown.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-[#A0A0A0]">{item.label}</span>
              <div className="flex flex-col items-end">
                <span className="font-semibold text-[#EAEAEA]">₦{item.amount.toLocaleString()}</span>
                <span className="text-[10px] text-[#666]">{item.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Subscriptions */}
        <div className="text-[11px] font-medium text-[#888] uppercase tracking-wider mb-3">
          Active Subscriptions
        </div>
        <div className="space-y-3">
          {billingSnapshot.subscriptions?.map((sub, i) => (
            <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#1A1A1A] border border-[#333]">
              <span className="text-[#EAEAEA] font-medium pl-1">{sub.name}</span>
              <div className="flex items-center gap-4 text-[#888] pr-1">
                <span className="text-[10px]">Usage: <span className="text-[#EAEAEA]">{sub.usage}</span></span>
                <span className="text-[10px]">Renews: <span className="text-[#EAEAEA]">{sub.nextBilling}</span></span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-[#222]">
          <p className="text-[10px] text-[#666]">
            Next billing date: {billingSnapshot.nextBillingDate}
          </p>
        </div>
      </div>
    </div>
  )
}
