"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Menu } from "lucide-react"

import { SandraBriefing } from "@/components/home/SandraBriefing"
import { AttentionRequired } from "@/components/home/AttentionRequired"
import { PlatformActivity } from "@/components/home/PlatformActivity"
import { RecentActivityFeed } from "@/components/home/RecentActivityFeed"
import { AgentStatusPanel } from "@/components/home/AgentStatusPanel"
import { OperationsSnapshot } from "@/components/home/OperationsSnapshot"
import { Customer360Snapshot } from "@/components/home/Customer360Snapshot"
import { BillingSnapshot } from "@/components/home/BillingSnapshot"
import { WorkflowHealth } from "@/components/home/WorkflowHealth"
import { Skeleton } from "@/components/ui/skeleton"

function DashboardSkeleton() {
  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Left Column Skeleton */}
      <div className="flex-[6.5] min-w-0 flex flex-col gap-8">
        
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

        {/* Block 3: Activity */}
        <div>
          <div className="flex justify-between mb-4">
            <Skeleton className="h-4 w-32 bg-[#1A1A1A]" />
            <Skeleton className="h-6 w-24 bg-[#1A1A1A] rounded-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="glass-card rounded-xl p-5">
                <Skeleton className="h-3 w-24 bg-[#222] mb-2" />
                <div className="flex justify-between items-end mb-3">
                  <Skeleton className="h-8 w-16 bg-[#222]" />
                  <Skeleton className="h-4 w-12 bg-[#222] rounded" />
                </div>
                <Skeleton className="h-3 w-32 bg-[#222]" />
              </div>
            ))}
          </div>
        </div>

        {/* Block 4: Feed */}
        <div>
          <div className="flex justify-between mb-4">
            <Skeleton className="h-4 w-32 bg-[#1A1A1A]" />
            <Skeleton className="h-4 w-16 bg-[#1A1A1A]" />
          </div>
          <div className="glass-card rounded-xl p-3 space-y-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-full bg-[#1A1A1A]" />
                <Skeleton className="h-4 w-full bg-[#1A1A1A]" />
                <Skeleton className="h-4 w-24 bg-[#1A1A1A]" />
              </div>
            ))}
          </div>
        </div>

        {/* Block 9: Workflow */}
        <div>
          <div className="flex justify-between mb-4">
            <Skeleton className="h-4 w-32 bg-[#1A1A1A]" />
            <Skeleton className="h-4 w-16 bg-[#1A1A1A]" />
          </div>
          <div className="glass-card rounded-xl p-3 space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-32 bg-[#1A1A1A]" />
                <Skeleton className="h-4 w-16 bg-[#1A1A1A]" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column Skeleton */}
      <div className="flex-[3.5] min-w-0 flex flex-col gap-8">

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
        
        {/* Block 5: Agents */}
        <div>
          <Skeleton className="h-4 w-32 bg-[#1A1A1A] mb-4" />
          <div className="space-y-3">
            {[1,2].map(i => (
              <div key={i} className="glass-card rounded-xl p-5">
                <Skeleton className="h-4 w-32 bg-[#222] mb-4" />
                <Skeleton className="h-5 w-48 bg-[#222] mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24 bg-[#222]" />
                  <Skeleton className="h-4 w-20 bg-[#222]" />
                </div>
              </div>
            ))}
          </div>
        </div>

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

        {/* Block 7: Customer 360 */}
        <div>
          <div className="flex justify-between mb-4">
            <Skeleton className="h-4 w-32 bg-[#1A1A1A]" />
            <Skeleton className="h-4 w-24 bg-[#1A1A1A]" />
          </div>
          <div className="glass-card rounded-xl">
            <div className="grid grid-cols-3 gap-px bg-[#222] mb-1">
              <Skeleton className="h-16 w-full bg-[#111]" />
              <Skeleton className="h-16 w-full bg-[#111]" />
              <Skeleton className="h-16 w-full bg-[#111]" />
            </div>
            <div className="p-3 space-y-3 bg-[#111]">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-32 bg-[#222]" />
                  <Skeleton className="h-4 w-16 bg-[#222]" />
                </div>
              ))}
            </div>
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

  useEffect(() => {
    setTime(new Date())
    const interval = setInterval(() => setTime(new Date()), 60000)
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
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#141414] border border-[#222] rounded-md text-sm hover:bg-[#1A1A1A] transition-colors"
          >
            <RefreshCw size={14} className="text-[#888]" />
            Refresh Briefing
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="p-8 max-w-[1600px] mx-auto">
        {initialLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="flex flex-col xl:flex-row gap-6">
            
            {/* Left Column (65%) */}
            <div className="flex-[6.5] min-w-0 flex flex-col gap-0">
              <SandraBriefing refreshTrigger={refreshTrigger} />
              <div className="mt-8">
                <AttentionRequired />
              </div>
              <PlatformActivity />
              <RecentActivityFeed />
              <WorkflowHealth />
            </div>

            {/* Right Column (35%) */}
            <div className="flex-[3.5] min-w-0 flex flex-col gap-0">
              <BillingSnapshot />
              <AgentStatusPanel />
              <OperationsSnapshot />
              <Customer360Snapshot />
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
