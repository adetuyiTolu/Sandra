// Sandra AI — AISummaryBadge [OPERATIONAL]
//
// Component classification: OPERATIONAL
// A pure presentational component that renders a colored pill badge showing
// Sandra's AI recommendation for a KYC item (APPROVE, MANUAL_REVIEW, ESCALATE, REJECT).
//
// Why this is a separate component:
// The same recommendation badge appears in both the ItemCard (operations queue list)
// and the StructuredResult VerificationTable (chat inline result). Extracting it
// ensures both surfaces show exactly the same visual language for the same signal.
// If the color for ESCALATE ever changes, it changes in one place.
//
// The recommendation enum values are uppercase strings to match what Prembly's
// real KYC API returns. The labels Record maps them to human-friendly display
// text without changing the underlying value throughout the system.
import type { Recommendation } from "@/lib/types"
import { cn } from "@/lib/utils"

const labels: Record<Recommendation, string> = {
  APPROVE: "Approve",
  MANUAL_REVIEW: "Manual Review",
  ESCALATE: "Escalate",
  REJECT: "Reject",
}

const colors: Record<Recommendation, string> = {
  APPROVE: "text-[#EAEAEA] border border-[#333] bg-[#1A1A1A]",
  MANUAL_REVIEW: "text-[#A0A0A0] border border-[#222] bg-[#111]",
  ESCALATE: "text-[#888] border border-[#222] bg-[#111]",
  REJECT: "text-[#666] font-bold border border-[#222] bg-[#0A0A0A]",
}

interface AISummaryBadgeProps {
  recommendation: Recommendation
  className?: string
}

export function AISummaryBadge({ recommendation, className }: AISummaryBadgeProps) {
  return (
    <span
      className={cn("flex items-center gap-1.5 px-2 py-1 rounded-[6px] border", colors[recommendation], className)}
    >
      {labels[recommendation]}
    </span>
  )
}
