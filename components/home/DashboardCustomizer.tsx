"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { Settings2, X, LayoutDashboard, ChevronDown } from "lucide-react"

export type DashboardRole = "Executive" | "Fraud Team" | "Compliance Team" | "Onboarding Team" | "Custom"

export type WidgetId = 
  | "sandra_briefing"
  | "attention_required"
  | "recent_activity"
  | "platform_activity"
  | "billing_snapshot"
  | "operations_snapshot"
  | "customer_360"
  | "workflow_health"
  | "agent_status"

export const defaultLayouts: Record<DashboardRole, WidgetId[]> = {
  "Executive": ["sandra_briefing", "attention_required", "billing_snapshot", "platform_activity", "recent_activity"],
  "Fraud Team": ["sandra_briefing", "attention_required", "operations_snapshot", "recent_activity"],
  "Compliance Team": ["sandra_briefing", "operations_snapshot", "workflow_health", "customer_360"],
  "Onboarding Team": ["sandra_briefing", "operations_snapshot", "recent_activity", "customer_360"],
  "Custom": []
}

export const availableWidgets: { id: WidgetId, label: string, column: "left" | "right" }[] = [
  { id: "sandra_briefing", label: "Sandra Briefing", column: "left" },
  { id: "attention_required", label: "Attention Required", column: "left" },
  { id: "recent_activity", label: "Recent Activity Feed", column: "left" },
  { id: "customer_360", label: "Customer 360", column: "left" },
  { id: "workflow_health", label: "Workflow Health", column: "left" },
  { id: "billing_snapshot", label: "Billing & Wallet", column: "right" },
  { id: "platform_activity", label: "Platform Activity", column: "right" },
  { id: "operations_snapshot", label: "Operations Queues", column: "right" },
  { id: "agent_status", label: "Agent Status Panel", column: "right" },
]

interface DashboardCustomizerProps {
  currentRole: DashboardRole
  visibleWidgets: WidgetId[]
  onRoleChange: (role: DashboardRole) => void
  onWidgetToggle: (widget: WidgetId) => void
}

export function DashboardCustomizer({ 
  currentRole, 
  visibleWidgets, 
  onRoleChange, 
  onWidgetToggle 
}: DashboardCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const roles: DashboardRole[] = ["Executive", "Onboarding Team", "Fraud Team", "Compliance Team"]

  return (
    <div className="relative">
      <button 
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#141414] border border-[#222] rounded-md text-sm hover:bg-[#1A1A1A] transition-colors"
      >
        <LayoutDashboard size={14} className="text-[#888]" />
        {currentRole === "Custom" ? "Custom View" : currentRole}
        <ChevronDown size={14} className="text-[#666]" />
      </button>

      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
          <div className="absolute right-0 mt-1 w-48 bg-[#111] border border-[#333] rounded-md shadow-xl z-50 overflow-hidden py-1">
            {roles.map(role => (
              <button
                key={role}
                onClick={() => {
                  onRoleChange(role)
                  setDropdownOpen(false)
                }}
                className={`block w-full text-left px-3 py-2 text-xs transition-colors ${
                  currentRole === role ? "bg-[#222] text-[#EAEAEA] font-medium" : "text-[#888] hover:bg-[#1A1A1A] hover:text-[#EAEAEA]"
                }`}
              >
                {role}
              </button>
            ))}
            <div className="h-px bg-[#222] my-1" />
            <button
              onClick={() => {
                setIsOpen(true)
                setDropdownOpen(false)
              }}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-[#37b7ab] hover:bg-[#1A1A1A] transition-colors"
            >
              <Settings2 size={13} />
              Customize...
            </button>
          </div>
        </>
      )}

      {isOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#050505] border border-[#222] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#222] bg-[#0A0A0A]">
              <div className="flex items-center gap-2 font-semibold text-[#EAEAEA]">
                <Settings2 size={16} className="text-[#37b7ab]" />
                Customize Dashboard
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[#888] hover:text-[#EAEAEA] transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto sidebar-scrollbar space-y-6">
              
              {/* Widget Toggles */}
              <div>
                <h3 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-3">Visible Components</h3>
                <div className="space-y-2">
                  {availableWidgets.map(widget => {
                    const isVisible = visibleWidgets.includes(widget.id)
                    return (
                      <label 
                        key={widget.id} 
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                          isVisible ? "bg-[#1A1A1A] border-[#333]" : "bg-[#0A0A0A] border-[#111] opacity-60"
                        }`}
                      >
                        <span className={`text-xs font-medium ${isVisible ? "text-[#EAEAEA]" : "text-[#888]"}`}>
                          {widget.label}
                        </span>
                        <div className={`w-8 h-4 rounded-full transition-colors relative ${isVisible ? "bg-[#37b7ab]" : "bg-[#333]"}`}>
                          <div className={`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all ${isVisible ? "left-[18px]" : "left-0.5"}`} />
                        </div>
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={isVisible} 
                          onChange={() => onWidgetToggle(widget.id)} 
                        />
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-[#222] bg-[#0A0A0A]">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-2 bg-[#EAEAEA] text-[#0A0A0A] font-semibold rounded-lg text-sm hover:bg-white transition-colors"
              >
                Save Layout
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
