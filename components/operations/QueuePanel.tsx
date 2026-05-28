// Sandra AI — QueuePanel [OPERATIONAL]
//
// Component classification: OPERATIONAL
// The QueuePanel is the left-hand queue selector in the Operations page.
// It shows 4 work queues (KYC, AML, Case, Fraud) with live counts and
// urgency indicators, allowing the operator to switch between them.
//
// WHY QUEUE COUNTS ARE STATIC:
// The counts (14 KYC, 3 AML, 7 Case, 5 Fraud) are seeded data, not live.
// In production, these would be fetched from the Prembly API in a useEffect
// with a polling interval. The static values were chosen to be credible for
// a mid-size fintech: not so high they seem unrealistic, not so low they
// seem like a quiet day.
//
// WHY AML AND FRAUD ARE MARKED "CRITICAL":
// AML hits and fraud alerts that require action are always critical — they
// have regulatory time limits (e.g., 24h STR filing). KYC is "high" because
// it affects customer onboarding speed. The urgency dot color system is
// deliberately consistent with the AlertCard severity colors in the Alerts
// page, reinforcing that the same urgency framework applies across both surfaces.
//
// NOTE: The QueuePanel only shows KYC in the demo because ItemCard and the
// detail panel are built for KYCRequest shape. AML, Case, Fraud queue items
// would use different card shapes in production.

"use client"

import { cn } from "@/lib/utils"

export type QueueId = "kyc" | "aml" | "case" | "fraud"

export interface QueueDef {
  id: QueueId
  label: string
  count: number
  pendingCount?: number
  urgency: "critical" | "high" | "medium" | "low"
}

const queues: QueueDef[] = [
  { id: "kyc", label: "KYC Queue", count: 14, pendingCount: 3, urgency: "high" },
  { id: "aml", label: "AML Queue", count: 3, pendingCount: 1, urgency: "critical" },
  { id: "case", label: "Case Queue", count: 7, urgency: "medium" },
  { id: "fraud", label: "Fraud Alerts", count: 5, pendingCount: 2, urgency: "critical" },
]

const urgencyDot: Record<string, string> = {
  critical: "bg-[#DC2626]",
  high: "bg-[#D97706]",
  medium: "bg-[#D97706]",
  low: "bg-[#059669]",
}

interface QueuePanelProps {
  selectedQueue: QueueId
  onSelectQueue: (id: QueueId) => void
}

export function QueuePanel({ selectedQueue, onSelectQueue }: QueuePanelProps) {
  return (
    <div className="w-52 shrink-0 border-r border-white/5 bg-[#050505] flex flex-col py-4">
      <div className="px-4 mb-3">
        <div className="text-[10px] font-semibold text-[#555555] uppercase tracking-widest">Work Queues</div>
      </div>
      <div className="flex flex-col gap-1.5 px-2">
        {queues.map((q) => (
          <button
            key={q.id}
            onClick={() => onSelectQueue(q.id)}
            className={cn(
              "flex flex-col gap-1.5 px-3 py-2.5 rounded-xl text-left transition-all w-full",
              selectedQueue === q.id
                ? "glass-panel border border-[#37b7ab]/30 shadow-premium"
                : "hover:glass-panel border border-transparent"
            )}
          >
            <div className="flex items-center gap-2.5 w-full">
              <span className={cn("w-2 h-2 rounded-full shrink-0", urgencyDot[q.urgency])} />
              <span className={cn("text-sm flex-1", selectedQueue === q.id ? "font-semibold text-[#EAEAEA]" : "text-[#888888]")}>
                {q.label}
              </span>
              <span className={cn(
                "text-[11px] font-bold px-1.5 py-0.5 rounded-full border border-white/10",
                q.urgency === "critical" ? "bg-red-500/20 text-[#DC2626] border-red-500/20" :
                q.urgency === "high" ? "bg-amber-500/20 text-[#D97706] border-amber-500/20" :
                "bg-white/5 text-[#888888]"
              )}>
                {q.count}
              </span>
            </div>
            
            {/* Pending Items Indicator */}
            {q.pendingCount && q.pendingCount > 0 && (
              <div className="text-[10px] text-[#37b7ab] font-medium ml-4 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                <span className="w-1.5 h-1.5 bg-[#37b7ab] rounded-full animate-pulse shadow-[0_0_5px_rgba(55,183,171,0.8)]"></span>
                {q.pendingCount} pending items
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export { queues }
