"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { customer360Snapshot } from "@/lib/mock/home"

export function Customer360Snapshot() {
  const router = useRouter()
  
  if (customer360Snapshot.totalEnrolled === 0) {
    return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-semibold text-[#EAEAEA]">Customer 360</h2>
      </div>
      <div className="rounded-xl border border-[#222] bg-[#111] p-4 text-center">
        <p className="text-[13px] text-[#888]">No customers enrolled yet. Customers appear here once they complete a verification flow.</p>
      </div>
      </div>
    )
  }

  const getRiskColor = (score: number) => {
    if (score < 40) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    if (score <= 70) return "bg-amber-500/10 text-amber-400 border-amber-500/20"
    return "bg-rose-500/10 text-rose-400 border-rose-500/20"
  }

  return (
  <div className="mb-5">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[13px] font-semibold text-[#EAEAEA]">Customer 360</h2>
      <Link 
          href="/customer-360"
          className="text-xs font-medium text-[#37b7ab] hover:text-[#2da096] transition-colors"
        >
          View All Customers
        </Link>
      </div>

  <div className="glass-card rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-sm">
    {/* Stats Row */}
    <div className="grid grid-cols-3 gap-px bg-[#222] border-b border-[#222]">
      <div className="bg-[#111] p-3 text-center">
            <div className="text-[10px] font-semibold text-[#888] uppercase tracking-wider mb-1">Total Enrolled</div>
            <div className="text-lg font-bold text-[#EAEAEA]">{customer360Snapshot.totalEnrolled.toLocaleString()}</div>
          </div>
      <div className="bg-[#111] p-3 text-center">
        <div className="text-[10px] font-semibold text-[#888] uppercase tracking-wider mb-1">Avg Risk Score</div>
            <div className="text-lg font-bold text-[#EAEAEA] flex items-center justify-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${customer360Snapshot.avgRiskScore < 40 ? "bg-emerald-400" : customer360Snapshot.avgRiskScore <= 70 ? "bg-amber-400" : "bg-rose-400"}`} />
              {customer360Snapshot.avgRiskScore}
            </div>
          </div>
      <div className="bg-[#111] p-3 text-center">
        <div className="text-[10px] font-semibold text-[#888] uppercase tracking-wider mb-1">New This Week</div>
            <div className="text-lg font-bold text-emerald-400">+{customer360Snapshot.newThisWeek}</div>
          </div>
        </div>

        {/* List */}
      <div className="divide-y divide-[#222] bg-[#111]">
        {customer360Snapshot.recentProfiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => router.push(`/customer-360/${profile.id}`)}
            className="w-full flex items-center justify-between py-2 px-3 hover:bg-white/[0.02] transition-colors text-left"
          >
            <div className="min-w-0 pr-4 flex-1">
                <div className="text-[13px] font-semibold text-[#EAEAEA] truncate">
                  {profile.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-[#A0A0A0]">{profile.type}</span>
                  <span className="text-[#555] text-[10px]">·</span>
                  <span className="text-[10px] text-[#777]">{profile.time}</span>
                </div>
              </div>
              <div className={`px-2 py-0.5 rounded text-[11px] font-bold border shrink-0 ${getRiskColor(profile.risk)}`}>
                Risk: {profile.risk}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
