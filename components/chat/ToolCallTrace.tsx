// Sandra AI — ToolCallTrace [CONVERSATIONAL / OPERATIONAL]
//
// Component classification: CONVERSATIONAL (appears in chat) + OPERATIONAL (appears in Sidebar)
// Renders the collapsible trace of tool calls Sandra made for the most recent response.
// This is Sandra's transparency layer made visible.
//
// Why the trace matters architecturally:
// A key Sandra value proposition is that operators can see EXACTLY how each answer
// was formed — which tools were called, in which order, with what inputs and outputs.
// This component is the UI manifestation of that promise. Without it, Sandra would
// feel like a black box. With it, it feels like a colleague showing its work.
//
// Color coding by category (Verification=blue, Fraud=amber, Case=purple, Finance=emerald,
// Agent=violet) maps directly to the 5 Tool Mesh categories in the registry. Any new
// tool category added to registry.ts automatically gets a badge here because of the
// categoryColors Record — this is intentionally data-driven, not hard-coded per category.
//
// The totalTime display (sum of all tool timing_ms values) gives operators a feel for
// how long Sandra's "thinking" took across all tool calls combined.

"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Clock, Shield, Zap, FileText, DollarSign, Cpu } from "lucide-react"
import type { ToolCall, AgentName } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ToolCallTraceProps {
  tool_calls: ToolCall[]
  agent_used?: AgentName | null
  intent?: string
}



const CategoryIcon: Record<string, React.ElementType> = {
  Verification: Shield,
  Fraud: Zap,
  Case: FileText,
  Finance: DollarSign,
  Agent: Cpu,
}

const intentColors: Record<string, string> = {
  RETRIEVAL: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ACTION: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REASONING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ALERT: "bg-red-500/10 text-red-400 border-red-500/20",
}

const categoryColors: Record<string, string> = {
  Verification: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Fraud: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Case: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  Finance: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Agent: "bg-[#37b7ab]/10 text-[#37b7ab] border-[#37b7ab]/20",
}

export function ToolCallTrace({ tool_calls, agent_used, intent }: ToolCallTraceProps) {
  const [expanded, setExpanded] = useState(true)
  const [openTools, setOpenTools] = useState<Set<number>>(new Set())

  function toggleTool(i: number) {
    setOpenTools((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  if (tool_calls.length === 0) return null

  const totalTime = tool_calls.reduce((sum, t) => sum + t.timing_ms, 0)

  return (
    <div className="mb-3 rounded-xl border border-white/5 bg-[#0A0A0A] overflow-hidden text-sm">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 w-full px-3 py-2.5 bg-[#1C1C1E]/50 border-b border-white/5 text-left hover:bg-[#1C1C1E] transition-all-150"
      >
        {expanded ? <ChevronDown size={13} className="text-[#888888]" /> : <ChevronRight size={13} className="text-[#888888]" />}
        <span className="text-xs font-semibold text-[#EAEAEA]">Tool Call Trace</span>
        <span className="text-xs text-[#888888] font-mono">{tool_calls.length} call{tool_calls.length !== 1 ? "s" : ""}</span>

        {intent && (
          <span className={cn("ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded border", intentColors[intent] ?? intentColors.RETRIEVAL)}>
            {intent}
          </span>
        )}
        <span className="text-[11px] text-[#555555] font-mono ml-auto flex items-center gap-1">
          <Clock size={11} />
          {totalTime}ms
        </span>
      </button>

      {expanded && (
        <div className="bg-[#0A0A0A]">
          {tool_calls.map((call, i) => {
            const Icon = CategoryIcon[call.category] ?? Shield
            const colorClass = categoryColors[call.category] ?? categoryColors.Verification
            const isOpen = openTools.has(i)
            return (
              <div key={i} className="border-b border-white/5 last:border-0">
                <button
                  onClick={() => toggleTool(i)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-white/5 transition-all-150"
                >
                  {isOpen ? <ChevronDown size={11} className="text-[#555555]" /> : <ChevronRight size={11} className="text-[#555555]" />}
                  <span className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium shrink-0", colorClass)}>
                    <Icon size={10} />
                    {call.category}
                  </span>
                  <span className="tool-mono text-[#EAEAEA] text-[12px] flex-1 truncate">{call.tool}</span>
                  <span className="text-[11px] text-[#555555] font-mono shrink-0">{call.timing_ms}ms</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-3 bg-[#050505] pt-2 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] font-semibold text-[#555555] uppercase tracking-wide mb-1">Inputs</div>
                        <pre className="tool-mono text-[#A1A1AA] bg-[#121212] border border-white/5 rounded-lg p-2 text-[11px] overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(call.inputs, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-[#555555] uppercase tracking-wide mb-1">Output</div>
                        <div className="tool-mono text-[#A1A1AA] bg-[#121212] border border-white/5 rounded-lg p-2 text-[11px]">
                          {call.output_summary}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Agent invoked */}
          {agent_used && (
            <div className="px-3 py-2 bg-[#0A0A0A] border-t border-white/5 flex items-center gap-2">
              <Cpu size={13} className="text-[#37b7ab]" />
              <span className="text-xs font-semibold text-[#EAEAEA]">
                {agent_used === "compliance" ? "Compliance Agent" : "Fraud Intelligence Agent"} Invoked
              </span>
              {agent_used === "compliance" && (
                <div className="flex gap-1 ml-auto">
                  {["NG", "EU", "KE"].map((j) => (
                    <span key={j} className="text-[10px] px-1 py-0.5 rounded bg-white/5 text-[#888888] font-mono">
                      {j}
                    </span>
                  ))}
                </div>
              )}
              {agent_used === "fraud" && (
                <span className="ml-auto text-[10px] text-gray-500 font-mono">pattern-analysis · fraud-bank</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
