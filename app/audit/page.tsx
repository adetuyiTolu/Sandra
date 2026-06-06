"use client"

import { SandraHeader } from "@/components/layout/SandraHeader"

export default function Page() {
  return (
    <div className="flex flex-col h-full">
      <SandraHeader 
        title="Audit Trail" 
        subtitle="This module is currently being configured." 
      />
      <div className="flex-1 p-8">
        <div className="glass-panel border border-white/5 rounded-xl p-8 flex flex-col items-center justify-center h-64 text-center">
          <div className="w-12 h-12 rounded-full bg-[#37b7ab]/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-[#37b7ab]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-[#EAEAEA] font-semibold text-lg mb-2">Audit Trail</h3>
          <p className="text-[#888888] text-sm max-w-md">
            The trust and explainability layer. Every action, AI decision, workflow step, and approval is permanently recorded here for regulators and audits.
          </p>
        </div>
      </div>
    </div>
  )
}
