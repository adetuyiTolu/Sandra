// Sandra AI — ItemCard [OPERATIONAL]
//
// Component classification: OPERATIONAL
// ItemCard renders a single KYC/KYB item in the Operations queue list.
// It's the primary surface where Sandra's pre-assessment is visible before
// the operator makes any decision.
//
// WHY SANDRA'S ASSESSMENT IS SHOWN INLINE ON THE CARD:
// The AISummaryBadge (ai_recommendation) and the ai_summary text are Sandra's
// pre-computed assessment, not the operator's decision. Showing them on the
// card means the operator can triage the queue at a glance — "Approve, Approve,
// Manual Review" — without opening each item. This is the 10x productivity
// gain Sandra's pitch claims: operators review 10x more items in the same time
// because Sandra does the initial assessment work.
//
// WHY RISK SCORE IS SHOWN AS A NUMBER (not just a label):
// The numeric risk score (0-100) is more information-dense than a label alone.
// A score of 72 vs. 68 both say "Medium" but 72 might warrant extra scrutiny.
// Operators who use the system regularly develop intuition for where their
// team's action threshold lies — numeric scores support that calibration.
//
// Why this is a button, not a div (same reason as AlertCard):
// Keyboard navigation and screen reader accessibility. Clickable list items
// should always be interactive elements, not divs with onClick handlers.

"use client"

import type { KYCRequest } from "@/lib/types"
import { AISummaryBadge } from "./AISummaryBadge"
import { cn } from "@/lib/utils"

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 24) return `${Math.floor(h / 24)}d ago`
  if (h > 0) return `${h}h ago`
  return `${m}m ago`
}

function riskColor(score: number): string {
  if (score < 40) return "text-[#666] border border-[#222] bg-[#111]"
  if (score <= 70) return "text-[#888] border border-[#222] bg-[#111]"
  return "text-[#EAEAEA] border border-[#333] bg-[#1A1A1A]"
}

interface ItemCardProps {
  item: KYCRequest
  isSelected: boolean
  onSelect: () => void
}

export function ItemCard({ item, isSelected, onSelect }: ItemCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left p-3 border-b border-white/5 transition-colors relative",
        isSelected 
          ? "bg-[#1C1C1E] border-l-[3px] border-l-[#37b7ab] shadow-sm z-10" 
          : "bg-transparent hover:bg-white/5 border-l-[3px] border-l-transparent"
      )}
      id={`item-card-${item.request_id}`}
    >
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <div className="font-semibold text-[#EAEAEA] text-[13px] truncate">{item.full_name}</div>
        <span className={cn("text-sm font-bold px-1.5 py-0.5 rounded-lg shrink-0", riskColor(item.risk_score))}>
          {item.risk_score}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-[11px] font-mono text-[#555555] truncate max-w-[80px]">{item.request_id}</span>
        <span className="text-[11px] text-[#555555]">·</span>
        <span className="text-[11px] text-[#555555] shrink-0">{timeAgo(item.submitted_at)}</span>
        <span className="text-[11px] text-[#555555]">·</span>
        <span className="text-[11px] text-[#888888] truncate">{item.jurisdiction}</span>
      </div>
      <div className="flex items-center justify-between gap-2 mt-2">
        <AISummaryBadge recommendation={item.ai_recommendation} />
      </div>
      <p className="text-xs text-[#888888] mt-2 leading-relaxed line-clamp-2">{item.ai_summary}</p>
    </button>
  )
}
