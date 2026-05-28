"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { workflowHealth } from "@/lib/mock/home"

export function WorkflowHealth() {
  const router = useRouter()
  const hasNeedsReview = workflowHealth.some(w => w.status === "Needs Review")

  if (workflowHealth.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#EAEAEA]">Active Workflows</h2>
        </div>
        <div className="rounded-xl border border-[#222] bg-[#111] p-5 text-center">
          <p className="text-sm text-[#888] mb-3">No active workflows.</p>
          <Link href="/workflows" className="text-xs text-[#37b7ab] hover:text-[#2da096]">
            Create your first workflow in Configure
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#EAEAEA]">Active Workflows</h2>
        <Link 
          href="/workflows"
          className="text-xs font-medium text-[#37b7ab] hover:text-[#2da096] transition-colors"
        >
          Manage
        </Link>
      </div>

      <div className="glass-card rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-premium">
        <div className="divide-y divide-[#222]">
          {workflowHealth.map((workflow, i) => (
            <button
              key={i}
              onClick={() => router.push(`/workflows`)}
              className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors text-left"
            >
              <div className="min-w-0 pr-4">
                <div className="text-[13px] font-semibold text-[#EAEAEA] truncate">
                  {workflow.name}
                </div>
                <div className="text-[10px] text-[#888] mt-1">
                  {workflow.steps} steps · {workflow.completions.toLocaleString()} completions
                </div>
              </div>
              <div className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border ${
                workflow.status === "Needs Review" 
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                  : workflow.status === "Paused"
                    ? "bg-[#1A1A1A] text-[#888] border-[#333]"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}>
                {workflow.status}
              </div>
            </button>
          ))}
        </div>

        {hasNeedsReview && (
          <div className="bg-[#111] p-3 border-t border-[#222]">
            <p className="text-[11px] text-[#888]">
              1 workflow may be affected by upcoming CBN regulatory changes.{" "}
              <Link 
                href={`/chat?prefill=${encodeURIComponent("Which of my active workflows are affected by upcoming CBN changes?")}`}
                className="text-[#37b7ab] hover:text-[#2da096] font-medium"
              >
                Ask Sandra
              </Link>
              {" "}for details.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
