// Sandra AI — AlertCard [ALERT-FOCUSED]
//
// Component classification: ALERT-FOCUSED
// Renders a single clickable alert in the Alerts page feed. AlertCard is the
// entry point for Sandra's proactive monitoring output — the operator's first
// view of what Sandra has detected before they ask about it.
//
// Why this is a button, not a div:
// AlertCard is clickable to select an alert and show its ReasoningPanel.
// Making it a <button> ensures keyboard navigation works correctly
// (Tab, Enter, Space) and screen readers announce it as interactive.
// The border-l-2 selected state gives a clear visual anchor that
// corresponds to the open ReasoningPanel on the right.
//
// The timeAgo() helper uses Date.now() (not a static value) because alert
// timestamps need to show relative time at render. This is the only component
// in the app that uses dynamic time — intentionally, because "3h ago" is
// more meaningful than a static timestamp for triage prioritization.
//
// isNew triggers the slide-in CSS animation. This is set by the Alerts page
// when injectableAlerts are added to the feed every 45 seconds, simulating
// Sandra finding new issues in real time during the demo.

"use client"

import type { FraudAlert, AlertSeverity, AlertType } from "@/lib/types"
import { cn } from "@/lib/utils"

const severityStyles: Record<AlertSeverity, string> = {
  CRITICAL: "text-red-400 border-red-500/20 bg-red-500/10",
  HIGH: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  MEDIUM: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  LOW: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
}

const typeStyles: Record<AlertType, string> = {
  FRAUD_PATTERN: "text-[#888888] border-white/10 bg-white/5",
  COMPLIANCE_TRIGGER: "text-[#888888] border-white/10 bg-white/5",
  AML_HIT: "text-[#888888] border-white/10 bg-white/5",
  VELOCITY_ANOMALY: "text-[#888888] border-white/10 bg-white/5",
  RULES_BREACH: "text-[#888888] border-white/10 bg-white/5",
}

const statusStyles: Record<string, string> = {
  NEW: "bg-[#37b7ab]/10 text-[#37b7ab] border border-[#37b7ab]/20",
  ACKNOWLEDGED: "bg-white/5 text-[#555555]",
  ESCALATED: "bg-red-500/10 text-red-400",
  RESOLVED: "bg-emerald-500/10 text-emerald-400",
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 24) return `${Math.floor(h / 24)}d ago`
  if (h > 0) return `${h}h ago`
  if (m > 0) return `${m}m ago`
  return "just now"
}

interface AlertCardProps {
  alert: FraudAlert
  isSelected: boolean
  isNew?: boolean
  onSelect: () => void
}

export function AlertCard({ alert, isSelected, isNew = false, onSelect }: AlertCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left p-4 border-b border-white/5 transition-colors relative",
        isNew && "slide-in",
        isSelected 
          ? "glass-panel border-l-[3px] border-l-[#37b7ab] shadow-premium z-10" 
          : "bg-transparent hover:glass-panel border-l-[3px] border-l-transparent transition-all"
      )}
      id={`alert-card-${alert.alert_id}`}
    >
      {/* Top row */}
      <div className="flex items-start gap-2 mb-2">
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0", severityStyles[alert.severity])}>
          {alert.severity}
        </span>
        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0", typeStyles[alert.type])}>
          {alert.type.replace(/_/g, " ")}
        </span>
        {alert.status === "NEW" && (
          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0", statusStyles.NEW)}>NEW</span>
        )}
      </div>

      {/* Entity */}
      <div className="font-semibold text-[#EAEAEA] text-sm mb-1 truncate">{alert.entity_name}</div>

      {/* Description */}
      <p className="text-xs text-[#888888] leading-relaxed line-clamp-2 mb-2">{alert.description}</p>

      {/* Footer */}
      <div className="flex items-center gap-2 text-[11px] text-[#555555]">
        <span className="text-[#37b7ab] font-medium">{alert.source_agent}</span>
        <span>·</span>
        <span>{timeAgo(alert.created_at)}</span>
        {alert.fraud_agent_confidence && (
          <>
            <span>·</span>
            <span className="font-mono">{Math.round(alert.fraud_agent_confidence * 100)}% confidence</span>
          </>
        )}
      </div>
    </button>
  )
}
