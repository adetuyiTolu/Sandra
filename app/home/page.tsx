"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Menu } from "lucide-react"

import { SandraBriefing } from "@/components/home/SandraBriefing"
import { AttentionRequired } from "@/components/home/AttentionRequired"
import { RecentActivityFeed } from "@/components/home/RecentActivityFeed"
import { PlatformActivity } from "@/components/home/PlatformActivity"
import { BillingSnapshot } from "@/components/home/BillingSnapshot"
import { OperationsSnapshot } from "@/components/home/OperationsSnapshot"
import { Customer360Snapshot } from "@/components/home/Customer360Snapshot"
import { WorkflowHealth } from "@/components/home/WorkflowHealth"
import { AgentStatusPanel } from "@/components/home/AgentStatusPanel"
import { DashboardCustomizer, DashboardRole, WidgetId, defaultLayouts, availableWidgets } from "@/components/home/DashboardCustomizer"
import { Skeleton } from "@/components/ui/skeleton"

function DashboardSkeleton() {
  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Left Column Skeleton */}
      <div className="flex-[6.5] min-w-0 flex flex-col gap-5">
        
        {/* Block 1: Briefing */}
        <div className="w-full glass-card rounded-xl p-6">
          <Skeleton className="h-5 w-32 bg-[#1A1A1A] mb-4" />
          <div className="space-y-3 mb-6">
            <Skeleton className="h-4 w-full bg-[#1A1A1A]" />
            <Skeleton className="h-4 w-[95%] bg-[#1A1A1A]" />
            <Skeleton className="h-4 w-[98%] bg-[#1A1A1A]" />
            <Skeleton className="h-4 w-[80%] bg-[#1A1A1A]" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-8 w-32 bg-[#1A1A1A] rounded-md" />
            <Skeleton className="h-8 w-32 bg-[#1A1A1A] rounded-md" />
            <Skeleton className="h-8 w-40 bg-[#1A1A1A] rounded-md" />
          </div>
        </div>

        {/* Block 2: Attention */}
        <div>
          <Skeleton className="h-4 w-32 bg-[#1A1A1A] mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="glass-card rounded-xl p-5">
                <Skeleton className="h-4 w-24 bg-[#222] mb-3" />
                <Skeleton className="h-8 w-16 bg-[#222] mb-2" />
                <Skeleton className="h-3 w-full bg-[#222] mb-1" />
                <Skeleton className="h-3 w-[80%] bg-[#222] mb-5" />
                <Skeleton className="h-4 w-20 bg-[#222]" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column Skeleton */}
      <div className="flex-[3.5] min-w-0 flex flex-col gap-5">

        {/* Block 8: Billing */}
        <div>
          <div className="flex justify-between mb-4">
            <Skeleton className="h-4 w-32 bg-[#1A1A1A]" />
            <Skeleton className="h-4 w-20 bg-[#1A1A1A]" />
          </div>
          <div className="glass-card rounded-xl p-5">
            <Skeleton className="h-10 w-full bg-[#222] mb-6" />
            <Skeleton className="h-8 w-32 bg-[#222] mb-3" />
            <Skeleton className="h-1.5 w-full bg-[#222] rounded-full mb-2" />
            <Skeleton className="h-3 w-full bg-[#222] mb-6" />
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-3 w-24 bg-[#222]" />
                  <Skeleton className="h-3 w-16 bg-[#222]" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Block 5: Agents removed */}

        {/* Block 6: Operations Snapshot */}
        <div>
          <div className="flex justify-between mb-4">
            <Skeleton className="h-4 w-32 bg-[#1A1A1A]" />
            <Skeleton className="h-4 w-24 bg-[#1A1A1A]" />
          </div>
          <div className="glass-card rounded-xl p-4 space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i}>
                <div className="flex justify-between mb-1.5">
                  <Skeleton className="h-3 w-20 bg-[#222]" />
                  <Skeleton className="h-3 w-12 bg-[#222]" />
                </div>
                <Skeleton className="h-1.5 w-full bg-[#222] rounded-full" />
              </div>
            ))}
            <Skeleton className="h-3 w-full bg-[#222] mt-5" />
          </div>
        </div>

      </div>
    </div>
  )
}


export default function HomeDashboard() {
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [time, setTime] = useState<Date | null>(null)
  
  const [role, setRole] = useState<DashboardRole>("Executive")
  const [visibleWidgets, setVisibleWidgets] = useState<WidgetId[]>(defaultLayouts["Executive"])
  const [isClient, setIsClient] = useState(false)

  // Hydration and standard setup
  useEffect(() => {
    setIsClient(true)
    setTime(new Date())
    const interval = setInterval(() => setTime(new Date()), 60000)
    
    // Load persisted layout
    const savedRole = localStorage.getItem("sandra_role") as DashboardRole
    const savedWidgets = localStorage.getItem("sandra_widgets")
    if (savedRole && defaultLayouts[savedRole]) {
      setRole(savedRole)
    }
    if (savedWidgets) {
      setVisibleWidgets(JSON.parse(savedWidgets))
    }
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleRoleChange = (newRole: DashboardRole) => {
    setRole(newRole)
    setVisibleWidgets(defaultLayouts[newRole])
    localStorage.setItem("sandra_role", newRole)
    localStorage.setItem("sandra_widgets", JSON.stringify(defaultLayouts[newRole]))
  }

  const handleWidgetToggle = (widget: WidgetId) => {
    setVisibleWidgets(prev => {
      const newWidgets = prev.includes(widget) 
        ? prev.filter(w => w !== widget)
        : [...prev, widget]
      
      localStorage.setItem("sandra_widgets", JSON.stringify(newWidgets))
      return newWidgets
    })
  }

  // Component Map for dynamic rendering
  const WidgetComponents: Record<WidgetId, React.FC<any>> = {
    sandra_briefing: () => <SandraBriefing refreshTrigger={refreshTrigger} />,
    attention_required: () => <AttentionRequired />,
    recent_activity: () => <RecentActivityFeed />,
    customer_360: () => <Customer360Snapshot />,
    workflow_health: () => <WorkflowHealth />,
    billing_snapshot: () => <BillingSnapshot />,
    platform_activity: () => <PlatformActivity />,
    operations_snapshot: () => <OperationsSnapshot />,
    agent_status: () => <AgentStatusPanel />
  }

  const leftColumnWidgets = availableWidgets.filter(w => w.column === "left" && visibleWidgets.includes(w.id))
  const rightColumnWidgets = availableWidgets.filter(w => w.column === "right" && visibleWidgets.includes(w.id))

  const formattedDate = time?.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#050505] text-[#EAEAEA]">
      {/* Header */}
      <header className="px-4 md:px-8 py-5 border-b border-[#222] flex flex-col sm:flex-row sm:items-center justify-between sticky top-0 bg-[#050505]/95 backdrop-blur z-30 gap-4 sm:gap-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.dispatchEvent(new Event('sandra:toggle-menu'))}
            className="md:hidden text-[#888] hover:text-[#EAEAEA] transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-[15px] font-semibold text-[#EAEAEA]">Home</h1>
            <p className="text-xs text-[#888888] mt-0.5 hidden sm:block">
              Last updated 2 minutes ago
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <div className="text-xs text-[#888] font-mono">
            {time ? formattedDate : '...'}
          </div>
          
          {isClient && (
            <DashboardCustomizer 
              currentRole={role}
              visibleWidgets={visibleWidgets}
              onRoleChange={handleRoleChange}
              onWidgetToggle={handleWidgetToggle}
            />
          )}

          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#141414] border border-[#222] rounded-md text-sm hover:bg-[#1A1A1A] transition-colors"
          >
            <RefreshCw size={14} className="text-[#888]" />
            Refresh
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="p-5 max-w-[1600px] mx-auto">
        {initialLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="flex flex-col xl:flex-row gap-6">
            
            {/* Empty State */}
            {leftColumnWidgets.length === 0 && rightColumnWidgets.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center border border-dashed border-[#222] rounded-xl bg-[#0A0A0A]/50">
                <h3 className="text-[15px] font-semibold text-[#EAEAEA] mb-2">Your Dashboard is empty</h3>
                <p className="text-sm text-[#888] max-w-[300px]">
                  Use the <strong>Customize View</strong> dropdown in the top right to enable widgets or select a role preset.
                </p>
              </div>
            )}

            {/* Left Column */}
            {leftColumnWidgets.length > 0 && (
              <div className="flex-[6.5] min-w-0 flex flex-col gap-5">
                {leftColumnWidgets.map(w => {
                  const Component = WidgetComponents[w.id]
                  return <Component key={w.id} />
                })}
              </div>
            )}

            {/* Right Column */}
            {rightColumnWidgets.length > 0 && (
              <div className="flex-[3.5] min-w-0 flex flex-col gap-5">
                {rightColumnWidgets.map(w => {
                  const Component = WidgetComponents[w.id]
                  return <Component key={w.id} />
                })}
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  )
}
