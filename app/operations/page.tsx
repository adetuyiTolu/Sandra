"use client"

import { useState, useEffect } from "react"
import { SandraHeader } from "@/components/layout/SandraHeader"
import { QueuePanel, type QueueId } from "@/components/operations/QueuePanel"
import { ItemCard } from "@/components/operations/ItemCard"
import { AISummaryBadge } from "@/components/operations/AISummaryBadge"
import { useDemoMode } from "@/lib/demo-context"
import { kycRequests, cases, fraudAlerts } from "@/lib/tools/executors"
import type { KYCRequest, Case, FraudAlert } from "@/lib/types"
import { cn } from "@/lib/utils"
import { dispatchSandraAsk } from "@/lib/sandra-events"
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  FolderOpen,
  UserCheck,
  MessageSquare,
  Cpu,
  Send,
} from "lucide-react"

type QueueItem = KYCRequest | Case | FraudAlert

function riskColor(score: number) {
  if (score < 40) return "text-emerald-600"
  if (score <= 70) return "text-amber-600"
  return "text-red-600"
}

function getQueueItems(queueId: QueueId): QueueItem[] {
  switch (queueId) {
    case "kyc":
      return [...kycRequests].sort((a, b) => b.risk_score - a.risk_score)
    case "aml":
      return cases.filter((c) => c.type === "AML")
    case "case":
      return cases.filter((c) => c.status === "OPEN" || c.status === "IN_REVIEW")
    case "fraud":
      return fraudAlerts.slice(0, 5)
    default:
      return []
  }
}

function getItemName(item: QueueItem): string {
  if ("full_name" in item) return item.full_name
  if ("entity_name" in item) return item.entity_name
  return "Unknown"
}

function getItemId(item: QueueItem): string {
  if ("request_id" in item) return item.request_id
  if ("case_id" in item) return item.case_id
  if ("alert_id" in item) return item.alert_id
  return ""
}

function getItemRisk(item: QueueItem): number {
  if ("risk_score" in item) return item.risk_score
  if ("priority" in item) {
    const map: Record<string, number> = { CRITICAL: 95, HIGH: 72, MEDIUM: 45, LOW: 20 }
    return map[item.priority as string] ?? 50
  }
  if ("severity" in item) {
    const map: Record<string, number> = { CRITICAL: 95, HIGH: 72, MEDIUM: 45, LOW: 20 }
    return map[(item as FraudAlert).severity] ?? 50
  }
  return 50
}

function getAIAssessment(item: QueueItem): string {
  if ("ai_summary" in item) return item.ai_summary
  if ("notes" in item && typeof item.notes === "string") return item.notes
  if ("description" in item) return (item as FraudAlert).description
  return "Assessment pending."
}

export default function OperationsPage() {
  const [selectedQueue, setSelectedQueue] = useState<QueueId>("kyc")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [askInput, setAskInput] = useState("")

  const { isActive, currentStepData } = useDemoMode()

  useEffect(() => {
    if (!isActive || !currentStepData) return
    
    if (currentStepData.autoSelectQueue) {
      if (currentStepData.autoSelectQueue === "KYC Queue") setSelectedQueue("kyc")
      if (currentStepData.autoSelectQueue === "AML Queue") setSelectedQueue("aml")
    }
    
    if (currentStepData.autoSelectItem !== undefined) {
      setSelectedIndex(currentStepData.autoSelectItem)
    }
  }, [isActive, currentStepData])

  const items = getQueueItems(selectedQueue)
  const selectedItem = items[selectedIndex] ?? null

  const isKYC = selectedQueue === "kyc"
  const kyc = selectedItem as KYCRequest | null

  function handleAskSandra() {
    if (!askInput.trim() || !selectedItem) return
    dispatchSandraAsk(askInput)
    setAskInput("")
  }

  function handleQueueChange(id: QueueId) {
    setSelectedQueue(id)
    setSelectedIndex(0)
  }

  return (
    <div className="flex flex-col h-full">
      <SandraHeader
        title="Operations"
        subtitle="Sandra has pre-sorted and assessed every item in your queues"
      />
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Queue selector */}
        <QueuePanel selectedQueue={selectedQueue} onSelectQueue={handleQueueChange} />

        {/* Item list */}
        <div className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-white/5 overflow-y-auto bg-[#0A0A0A] h-[35vh] md:h-auto">
          <div className="px-4 py-3 border-b border-white/5 sticky top-0 bg-[#0A0A0A] z-10">
            <div className="text-xs font-semibold text-[#888888]">
              {items.length} items · sorted by risk score
            </div>
          </div>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#555555] text-sm">
              No items in this queue
            </div>
          ) : (
            items.map((item, i) => {
              if (selectedQueue === "kyc") {
                const k = item as KYCRequest
                return (
                  <ItemCard
                    key={k.request_id}
                    item={k}
                    isSelected={i === selectedIndex}
                    onSelect={() => setSelectedIndex(i)}
                  />
                )
              }
              // Generic card for non-KYC queues
              const risk = getItemRisk(item)
              return (
                <button
                  key={getItemId(item)}
                  onClick={() => setSelectedIndex(i)}
                  className={cn(
                    "w-full text-left p-4 border-b border-white/5 transition-all-150",
                    i === selectedIndex
                      ? "glass-panel border-l-2 border-l-[#37b7ab] shadow-premium z-10"
                      : "bg-transparent hover:glass-panel border-l-2 border-l-transparent transition-all"
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="font-semibold text-[#EAEAEA] text-sm truncate">{getItemName(item)}</div>
                    <span className={cn("text-base font-bold", riskColor(risk))}>{risk}</span>
                  </div>
                  <div className="text-[11px] font-mono text-[#555555] mb-2">{getItemId(item)}</div>
                  <p className="text-xs text-[#888888] leading-relaxed line-clamp-2">{getAIAssessment(item)}</p>
                </button>
              )
            })
          )}
        </div>

        {/* Detail panel */}
        <div className="flex-1 overflow-y-auto bg-[#0A0A0A]">
          {!selectedItem ? (
            <div className="flex flex-col items-center justify-center h-full text-[#555555]">
              <div className="text-sm">Select an item from the queue</div>
            </div>
          ) : (
            <div className="p-8 max-w-3xl">
              {/* Sandra's Assessment */}
              <div className={cn(
                "glass-card rounded-xl border border-white/5 p-6 mb-8 shadow-premium hover:shadow-premium-hover transition-all duration-300",
                isActive && currentStepData?.highlightElement === "ai-summary-column" 
                  ? "ring-2 ring-[#37b7ab] ring-offset-2 ring-offset-[#0A0A0A] shadow-[0_0_20px_rgba(55,183,171,0.2)] animate-pulse"
                  : ""
              )}>
                <div className="flex items-center gap-2 mb-3">
                  <Cpu size={14} className="text-[#37b7ab]" />
                  <span className="font-semibold text-[#EAEAEA] text-sm tracking-tight">Sandra&apos;s Assessment</span>
                  {isKYC && kyc && <AISummaryBadge recommendation={kyc.ai_recommendation} className="ml-auto" />}
                </div>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">{getAIAssessment(selectedItem)}</p>
                {isKYC && kyc && kyc.risk_flags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {kyc.risk_flags.map((flag) => (
                      <span key={flag} className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                        ⚠ {flag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Entity details */}
              <div className="mb-6">
                <div className="text-sm font-semibold text-[#EAEAEA] mb-3">Entity Details</div>
                <div className="grid grid-cols-2 gap-4">
                  {isKYC && kyc ? (
                    <>
                      {[
                        { label: "Full Name", value: kyc.full_name },
                        { label: "Request ID", value: kyc.request_id },
                        { label: "ID Type", value: kyc.id_type },
                        { label: "ID Number", value: kyc.id_number },
                        { label: "Status", value: kyc.status },
                        { label: "Risk Score", value: `${kyc.risk_score} / 100` },
                        { label: "Jurisdiction", value: kyc.jurisdiction },
                        { label: "Submitted", value: new Date(kyc.submitted_at).toLocaleString() },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div className="text-[10px] font-semibold text-[#555555] uppercase tracking-wide">{label}</div>
                          <div className="text-sm text-[#A1A1AA] font-medium mt-0.5 font-mono">{value}</div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="col-span-2">
                      <div className="text-sm text-[#A1A1AA]">{getItemId(selectedItem)}</div>
                      <div className="text-sm text-[#888888] mt-1">{getAIAssessment(selectedItem)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mb-8">
                <div className="text-sm font-semibold text-[#EAEAEA] mb-3 tracking-tight">Required Actions</div>
                <div className="flex flex-wrap gap-2.5">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#37b7ab]/10 border border-[#37b7ab]/20 text-[#37b7ab] text-xs font-medium hover:bg-[#37b7ab]/20 transition-colors">
                    <CheckCircle size={13} /> Approve
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors">
                    <XCircle size={13} /> Reject
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1C1C1E] border border-white/10 text-[#A1A1AA] text-xs font-medium hover:bg-white/5 transition-colors">
                    <TrendingUp size={13} className="text-amber-500" /> Escalate
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1C1C1E] border border-white/10 text-[#A1A1AA] text-xs font-medium hover:bg-white/5 transition-colors">
                    <FolderOpen size={13} className="text-blue-500" /> Create Case
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1C1C1E] border border-white/10 text-[#A1A1AA] text-xs font-medium hover:bg-white/5 transition-colors">
                    <UserCheck size={13} className="text-indigo-500" /> Assign
                  </button>
                </div>
              </div>

              {/* Ask Sandra */}
              <div className="glass-panel rounded-xl border border-white/5 p-5 shadow-premium">
                <div className="text-sm font-semibold text-[#EAEAEA] mb-2 flex items-center gap-2">
                  <MessageSquare size={14} className="text-[#37b7ab]" />
                  Ask Sandra about this item
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={askInput}
                    onChange={(e) => setAskInput(e.target.value)}
                    placeholder={`Ask about ${getItemName(selectedItem)}...`}
                    className="flex-1 text-sm px-3 py-2 rounded-md border border-white/10 focus:outline-none focus:border-[#37b7ab]/50 focus:bg-white/10 glass-panel glow-primary text-[#EAEAEA] placeholder-[#555555] transition-all"
                    id="operations-ask-sandra-input"
                  />
                  <button
                    onClick={handleAskSandra}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#37b7ab] text-white text-xs font-semibold hover:bg-[#37b7ab]/90 transition-colors"
                  >
                    <Send size={13} className="ml-0.5" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
