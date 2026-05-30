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

import { useState } from "react"
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
  ChevronDown,
  ChevronUp
} from "lucide-react"

const severityColor: Record<string, string> = {
  CRITICAL: "text-[#EAEAEA] border-[#333] bg-[#1A1A1A]",
  HIGH: "text-[#A0A0A0] border-[#222] bg-[#111]",
  MEDIUM: "text-[#888] border-[#222] bg-[#111]",
  LOW: "text-[#666] border-[#222] bg-[#111]",
}

interface ReasoningPanelProps {
  alert: FraudAlert
  onAskSandra?: () => void
  onDismiss?: () => void
  onAcknowledge?: () => void
}

export function ReasoningPanel({ alert, onAskSandra, onDismiss, onAcknowledge }: ReasoningPanelProps) {
  const [showTrace, setShowTrace] = useState(false)
  const [showDismissPrompt, setShowDismissPrompt] = useState(false)
  const [showActionPrompt, setShowActionPrompt] = useState(false)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0A0A0A]">
      {/* Alert header */}
      <div className="px-4 py-3 border-b border-white/5 bg-[#0A0A0A]">
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
        <div className="font-bold text-[#EAEAEA] text-[15px]">{alert.entity_name}</div>
        <div className="text-[11px] text-[#37b7ab] font-medium mt-0.5">{alert.source_agent}</div>
      </div>

      {/* Scrollable reasoning body */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#0A0A0A] sidebar-scrollbar">
        <div className="glass-card rounded-xl overflow-hidden shadow-sm border border-[#222] divide-y divide-[#222]">

          {/* What I detected */}
          <div className="p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#888] uppercase tracking-wider mb-2.5">
              <Eye size={13} className="text-[#A0A0A0]" /> What I detected
            </div>
            <p className="text-[13px] text-[#A1A1AA] leading-relaxed">{alert.what_detected}</p>
          </div>

          {/* What I checked — tool trace */}
          <div className="p-4 bg-[#111]">
            <button 
              onClick={() => setShowTrace(!showTrace)}
              className="w-full flex items-center justify-between group"
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold text-[#888] uppercase tracking-wider">
                <Shield size={13} className="text-[#A0A0A0]" /> What I checked
              </div>
              {showTrace ? <ChevronUp size={14} className="text-[#666] group-hover:text-[#A0A0A0]" /> : <ChevronDown size={14} className="text-[#666] group-hover:text-[#A0A0A0]" />}
            </button>
            {showTrace && (
              <div className="mt-3.5">
                <ToolCallTrace tool_calls={alert.what_checked} />
              </div>
            )}
          </div>

          {/* Regulatory context */}
          {alert.regulatory_context && (
            <div className="p-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-[#888] uppercase tracking-wider mb-2.5">
                <BookOpen size={13} className="text-[#A0A0A0]" /> Regulatory context
              </div>
              <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
                {alert.regulatory_context}
              </p>
            </div>
          )}

          {/* What I recommend */}
          <div className="p-4 bg-[#111]">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#888] uppercase tracking-wider mb-2.5">
              <Target size={13} className="text-[#A0A0A0]" /> What I recommend
            </div>
            <div className="text-[13px] font-bold text-[#EAEAEA]">{alert.recommendation.replace(/_/g, " ")}</div>
          </div>

          {/* Related entities */}
          {alert.related_entities.length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-[#888] uppercase tracking-wider mb-3">
                <Network size={13} className="text-[#A0A0A0]" /> Related entities
              </div>
              <div className="flex flex-wrap gap-2">
                {alert.related_entities.map((entity) => (
                  <div
                    key={entity}
                    className="text-[11px] font-mono text-[#A1A1AA] bg-[#1A1A1A] border border-[#333] rounded-md px-2.5 py-1"
                  >
                    {entity}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="px-4 py-3 border-t border-white/5 bg-[#050505]">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setShowActionPrompt(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111] border border-[#333] text-[#EAEAEA] text-xs font-medium hover:bg-[#1A1A1A] transition-colors"
          >
            <Eye size={13} /> Acknowledge
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111] border border-[#333] text-[#A0A0A0] text-xs font-medium hover:bg-[#1A1A1A] transition-colors">
            <TrendingUp size={13} /> Escalate
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111] border border-[#333] text-[#888] text-xs font-medium hover:bg-[#1A1A1A] transition-colors">
            <FolderOpen size={13} /> Open Case
          </button>
          <button 
            onClick={() => setShowDismissPrompt(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111] border border-[#333] text-[#666] text-xs font-medium hover:bg-[#1A1A1A] transition-colors"
          >
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

      {showDismissPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl shadow-2xl w-full max-w-sm p-5 animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-semibold text-[#EAEAEA] mb-2">Dismiss Alert?</h3>
            <p className="text-xs text-[#A0A0A0] mb-5 leading-relaxed">
              Are you sure you want to dismiss this alert? Please confirm that this alert has been attended to or verified before closing it off. It will be permanently removed from your dashboard.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDismissPrompt(false)} className="px-3 py-1.5 text-xs font-medium text-[#888] hover:text-[#EAEAEA] transition-colors">Cancel</button>
              <button 
                onClick={() => { setShowDismissPrompt(false); onDismiss?.(); }} 
                className="px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-md hover:bg-red-500/20 transition-colors"
              >
                Yes, Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {showActionPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl shadow-2xl w-full max-w-sm p-5 animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-semibold text-[#EAEAEA] mb-2">Acknowledge Alert?</h3>
            <p className="text-xs text-[#A0A0A0] mb-5 leading-relaxed">
              This will mark the alert as acknowledged and remove it from your active queue. Have you taken the necessary action?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowActionPrompt(false)} className="px-3 py-1.5 text-xs font-medium text-[#888] hover:text-[#EAEAEA] transition-colors">Cancel</button>
              <button 
                onClick={() => { setShowActionPrompt(false); onAcknowledge?.(); }} 
                className="px-3 py-1.5 text-xs font-bold bg-[#EAEAEA] text-[#0A0A0A] rounded-md hover:bg-white transition-colors"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
