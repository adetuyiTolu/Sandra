"use client"

import Link from "next/link"
import { activityFeed } from "@/lib/mock/home"

export function RecentActivityFeed() {
  if (activityFeed.length === 0) {
    return (
      <div className="mb-5">
        <h2 className="text-[13px] font-semibold text-[#EAEAEA] mb-3">Recent Activity</h2>
        <div className="w-full rounded-xl border border-[#222] bg-[#111] p-4 text-center">
          <p className="text-[13px] text-[#888]">No activity yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-semibold text-[#EAEAEA]">Recent Activity</h2>
        <Link 
          href="/reports/verification-reports"
          className="text-xs font-medium text-[#37b7ab] hover:text-[#2da096] transition-colors"
        >
          View All
        </Link>
      </div>
      
      <div className="w-full glass-card rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-[#222]">
          {activityFeed.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[10px] text-[#555] font-mono shrink-0 w-12">{item.timestamp}</span>
                <div className="text-[13px] truncate">
                  <span className="text-[#888]">{item.description}</span>
                  <span className="mx-1.5 text-[#444]">•</span>
                  <span className="font-medium text-[#EAEAEA]">{item.entity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
