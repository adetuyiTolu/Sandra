// Sandra AI — ReasoningPanel [ALERT-FOCUSED]
//
// Component classification: ALERT-FOCUSED
// The ReasoningPanel is Sandra's "show your work" surface for proactive alerts.
// When an operator clicks an alert in the Alerts page, this panel opens and
// shows the complete reasoning chain Sandra used to generate that alert.
//
// WHY FIVE SECTIONS:
//
//   1. "What I detected" — the narrative finding. What Sandra actually observed.
//      Written in plain language, not technical jargon.
//
//   2. "What I checked" — the ToolCallTrace. Which Prembly APIs and sub-agents
//      Sandra invoked before reaching its conclusion. This section directly
//      reuses the ToolCallTrace component from the chat interface, reinforcing
//      that Sandra's monitoring pipeline and conversational pipeline are the
//      same underlying system.
//
//   3. "Regulatory context" — the specific regulation that makes this alert
//      actionable. Not just "this looks bad" — "this violates CBN Section 14.3
//      and here's what you're legally required to do." This is what elevates
//      Sandra from a fraud detector to a compliance intelligence system.
//
//   4. "What I recommend" — the specific action. Named explicitly (e.g.,
//      FREEZE_ACCOUNT_FILE_STR) rather than vaguely ("take action"). Operators
//      can act without needing to interpret.
//
//   5. "Related entities" — other BVNs, accounts, or cases that Sandra has
//      linked to this alert. This is what makes ring fraud visible: one alert
//      surfaces connections that individually might look benign.
//
// WHY "ASK SANDRA" IS IN THIS PANEL:
// Clicking "Ask Sandra" opens the ChatWindow with the alert pre-loaded as
// context. The operator can then have a conversation about the alert —
// "why is this a ring fraud pattern?" or "what would happen if we don't file
// the STR?" — without losing the alert context. The chat and alerts interfaces
// are deliberately connected, not siloed.

"use client"

import type { FraudAlert } from "@/lib/types"
import { ToolCallTrace } from "@/components/chat/ToolCallTrace"
import { cn } from "@/lib/utils"
import {
  Eye,
  TrendingUp,
  FolderOpen,
  X,
  MessageSquare,
  Shield,
  BookOpen,
  Target,
  Network,
} from "lucide-react"

const severityColor: Record<string, string> = {
  CRITICAL: "text-red-400 border-red-500/20 bg-red-500/10",
  HIGH: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  MEDIUM: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  LOW: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
}

interface ReasoningPanelProps {
  alert: FraudAlert
  onAskSandra?: () => void
}

export function ReasoningPanel({ alert, onAskSandra }: ReasoningPanelProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0A0A0A]">
      {/* Alert header */}
      <div className="px-5 py-4 border-b border-white/5 bg-[#0A0A0A]">
        <div className="flex items-center gap-2 mb-2">
          <span className={cn("text-xs font-bold px-2.5 py-1 rounded-lg border", severityColor[alert.severity])}>
            {alert.severity}
          </span>
          <span className="text-xs font-semibold text-[#888888] bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
            {alert.type.replace(/_/g, " ")}
          </span>
          <span className="text-xs font-semibold text-[#888888] bg-white/5 border border-white/5 px-2 py-0.5 rounded-md ml-auto">
            {alert.status}
          </span>
        </div>
        <div className="font-bold text-[#EAEAEA] text-base">{alert.entity_name}</div>
        <div className="text-xs text-[#37b7ab] font-medium mt-0.5">{alert.source_agent}</div>
      </div>

      {/* Scrollable reasoning body */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 bg-[#0A0A0A]">

        {/* What I detected */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#555555] uppercase tracking-wide mb-2">
            <Eye size={13} className="text-[#37b7ab]" /> What I detected
          </div>
          <p className="text-sm text-[#A1A1AA] leading-relaxed">{alert.what_detected}</p>
        </div>

        {/* What I checked — tool trace */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#555555] uppercase tracking-wide mb-2">
            <Shield size={13} className="text-[#37b7ab]" /> What I checked
          </div>
          <ToolCallTrace tool_calls={alert.what_checked} />
        </div>

        {/* Regulatory context */}
        {alert.regulatory_context && (
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#555555] uppercase tracking-wide mb-2">
              <BookOpen size={13} className="text-[#37b7ab]" /> Regulatory context
            </div>
            <div className="text-sm text-[#A1A1AA] bg-[#1C1C1E] border border-white/5 rounded-xl p-3 leading-relaxed">
              {alert.regulatory_context}
            </div>
          </div>
        )}

        {/* What I recommend */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#555555] uppercase tracking-wide mb-2">
            <Target size={13} className="text-[#37b7ab]" /> What I recommend
          </div>
          <div className="bg-[#1C1C1E] border border-white/5 rounded-xl p-3">
            <div className="text-sm font-bold text-[#EAEAEA]">{alert.recommendation.replace(/_/g, " ")}</div>
          </div>
        </div>

        {/* Related entities */}
        {alert.related_entities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#555555] uppercase tracking-wide mb-2">
              <Network size={13} className="text-[#37b7ab]" /> Related entities
            </div>
            <div className="flex flex-col gap-1.5">
              {alert.related_entities.map((entity) => (
                <div
                  key={entity}
                  className="text-xs font-mono text-[#A1A1AA] bg-[#1C1C1E] border border-white/5 rounded-lg px-3 py-2"
                >
                  {entity}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="px-5 py-4 border-t border-white/5 bg-[#050505]">
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#37b7ab]/10 border border-[#37b7ab]/20 text-[#37b7ab] text-xs font-medium hover:bg-[#37b7ab]/20 transition-colors">
            <Eye size={13} /> Acknowledge
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1C1C1E] border border-white/10 text-red-400 text-xs font-medium hover:bg-white/5 transition-colors">
            <TrendingUp size={13} /> Escalate
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1C1C1E] border border-white/10 text-[#A1A1AA] text-xs font-medium hover:bg-white/5 transition-colors">
            <FolderOpen size={13} /> Open Case
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1C1C1E] border border-white/10 text-[#A1A1AA] text-xs font-medium hover:bg-white/5 transition-colors">
            <X size={13} /> Dismiss
          </button>
          <button
            onClick={onAskSandra}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-[#EAEAEA] text-xs font-medium hover:bg-white/10 transition-colors ml-auto"
          >
            <MessageSquare size={13} /> Ask Sandra
          </button>
        </div>
      </div>
    </div>
  )
}
