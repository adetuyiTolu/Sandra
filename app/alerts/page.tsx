"use client"

import { useState, useEffect, useMemo } from "react"
import { SandraHeader } from "@/components/layout/SandraHeader"
import { AlertCard } from "@/components/alerts/AlertCard"
import { ReasoningPanel } from "@/components/alerts/ReasoningPanel"
import { useDemoMode } from "@/lib/demo-context"
import { fraudAlerts, injectableAlerts } from "@/lib/tools/executors"
import type { FraudAlert } from "@/lib/types"
import { dispatchSandraAsk } from "@/lib/sandra-events"
import { Bell, Filter } from "lucide-react"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<FraudAlert[]>(fraudAlerts)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [newAlertIds, setNewAlertIds] = useState<Set<string>>(new Set())
  const [injectIndex, setInjectIndex] = useState(0)
  const [agentFilter, setAgentFilter] = useState<string>("All")
  const [toolFilter, setToolFilter] = useState<string>("All")

  const { isActive, currentStepData } = useDemoMode()

  useEffect(() => {
    if (!isActive || !currentStepData) return
    if (currentStepData.autoSelectAlert !== undefined) {
      setSelectedIndex(currentStepData.autoSelectAlert)
    }
  }, [isActive, currentStepData])
  // Extract all unique tools used across all alerts
  const availableTools = useMemo(() => {
    const tools = new Set<string>()
    alerts.forEach(a => a.what_checked?.forEach(t => tools.add(t.tool)))
    return Array.from(tools).sort()
  }, [alerts])

  const formatToolName = (tool: string) => {
    return tool.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchAgent = agentFilter === "All" || a.source_agent === agentFilter
      const matchTool = toolFilter === "All" || a.what_checked?.some(t => t.tool === toolFilter)
      return matchAgent && matchTool
    })
  }, [alerts, agentFilter, toolFilter])

  // Auto-inject new alerts every 45 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (injectIndex >= injectableAlerts.length) return

      const newAlert = {
        ...injectableAlerts[injectIndex],
        created_at: new Date().toISOString(),
      }
      setAlerts((prev) => [newAlert, ...prev])
      setNewAlertIds((prev) => {
        const next = new Set(prev)
        next.add(newAlert.alert_id)
        // Clear "new" indicator after 5s
        setTimeout(() => {
          setNewAlertIds((s) => {
            const n = new Set(s)
            n.delete(newAlert.alert_id)
            return n
          })
        }, 5000)
        return next
      })
      setInjectIndex((i) => i + 1)

      // Shift selected index if needed
      setSelectedIndex((i) => i + 1)
    }, 45000)

    return () => clearInterval(interval)
  }, [injectIndex])

  function handleAskSandra() {
    const selected = filteredAlerts[selectedIndex]
    if (!selected) return
    dispatchSandraAsk(`Explain the alert for ${selected.entity_name}`)
  }

  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL" && a.status === "NEW").length
  const newCount = alerts.filter((a) => a.status === "NEW").length

  return (
    <div className="flex flex-col h-full">
      <SandraHeader
        title="Alerts"
        subtitle="Sandra surfaces these proactively — new alerts appear automatically"
      />
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Alert feed */}
        <div className="w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-white/5 flex flex-col overflow-hidden bg-[#0A0A0A] h-[45vh] md:h-auto">
          {/* Feed header */}
          <div className="px-4 py-3 border-b border-white/5 bg-[#0A0A0A] flex items-center gap-2 sticky top-0 z-10 shrink-0">
            <Bell size={14} className="text-[#555555]" />
            <span className="text-xs font-semibold text-[#888888]">{alerts.length} alerts</span>
            {newCount > 0 && (
              <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/20">
                {newCount} new
              </span>
            )}
            {criticalCount > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20">
                {criticalCount} critical
              </span>
            )}
          </div>
          
          {/* Filters */}
          <div className="px-4 py-3 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md flex flex-col gap-2 sticky top-[45px] z-20">
            <div className="flex items-center gap-2 text-xs">
              <Filter size={13} className="text-[#37b7ab]" />
              <span className="font-semibold text-[#888888]">Filter alerts</span>
            </div>
            <div className="flex flex-col gap-2.5 mt-1">
              <div className="relative">
                <select 
                  value={agentFilter}
                  onChange={(e) => { setAgentFilter(e.target.value); setSelectedIndex(0); }}
                  className="appearance-none w-full text-xs font-medium text-[#A1A1AA] px-3 py-2 pr-8 rounded-xl border border-white/10 glass-panel shadow-premium hover:shadow-premium-hover focus:outline-none focus:border-[#37b7ab]/50 cursor-pointer hover:bg-white/5 transition-all duration-300"
                >
                  <option value="All">All Agents</option>
                  <option value="Compliance Agent">Compliance Agent</option>
                  <option value="Fraud Intelligence Agent">Fraud Intelligence Agent</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#555555]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
              
              <div className="relative">
                <select 
                  value={toolFilter}
                  onChange={(e) => { setToolFilter(e.target.value); setSelectedIndex(0); }}
                  className="appearance-none w-full text-xs font-medium text-[#A1A1AA] px-3 py-2 pr-8 rounded-xl border border-white/10 glass-panel shadow-premium hover:shadow-premium-hover focus:outline-none focus:border-[#37b7ab]/50 cursor-pointer hover:bg-white/5 transition-all duration-300"
                >
                  <option value="All">All Tools</option>
                  {availableTools.map(tool => (
                    <option key={tool} value={tool}>{formatToolName(tool)}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#555555]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Alert list */}
          <div className="flex-1 overflow-y-auto">
            {filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[#555555] text-sm">
                No alerts match filters
              </div>
            ) : (
              filteredAlerts.map((alert, i) => (
                <AlertCard
                  key={alert.alert_id}
                  alert={alert}
                  isSelected={i === selectedIndex}
                  isNew={newAlertIds.has(alert.alert_id)}
                  onSelect={() => setSelectedIndex(i)}
                />
              ))
            )}
          </div>
        </div>

        {/* Reasoning panel */}
        <div className="flex-1 overflow-y-auto bg-[#0A0A0A]">
          {filteredAlerts[selectedIndex] ? (
            <ReasoningPanel
              alert={filteredAlerts[selectedIndex]}
              onAskSandra={handleAskSandra}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#555555]">
              <Bell size={32} className="mb-3 opacity-30" />
              <div className="text-sm">Select an alert to see Sandra&apos;s reasoning</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
