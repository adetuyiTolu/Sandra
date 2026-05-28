// Sandra AI — AgentStatusBar [SHARED]
//
// Component classification: SHARED (appears across all three pages)
// The AgentStatusBar is Sandra's persistent system state display — it shows
// what Sandra has "ready" at all times, not what it's currently doing.
//
// WHY THIS INFORMATION SPECIFICALLY:
//
//   - "Sandra AI Active" (pulsing green): indicates Sandra is running and
//     ready to respond. The pulse animation is a subtle indicator that the
//     system is live, not static.
//
//   - Compliance Agent + jurisdiction flags: shows that regulatory intelligence
//     is pre-loaded for NG, KE, US, EU. Operators can see at a glance which
//     markets Sandra is "ready" to advise on without asking.
//
//   - Fraud Intelligence Agent: shows the fraud monitoring sub-system is connected
//     and continuously processing (in production it would be running inference
//     on the transaction stream in real time).
//
//   - Tool Mesh count: shows how many tools Sandra has available. This number
//     is imported directly from toolRegistry.length — it updates automatically
//     if new tools are added to the registry. Demonstrating that Sandra has 24
//     tools available at all times is a key demo talking point.
//
//   - "847 entities indexed": imported from entity-store.ts totalEntities. Shows
//     that Sandra comes pre-loaded with context, not as a blank slate.
//
// WHY THE TIMESTAMP USES setInterval:
// The timestamp updates every 30 seconds (not every second) to avoid
// excessive re-renders across all three pages. 30s is frequent enough
// to feel live but not so frequent it causes visible CPU overhead during demos.
// It's initialized in useEffect (not SSR) to avoid hydration mismatches.

"use client"

import { useState, useEffect } from "react"
import { totalEntities } from "@/lib/memory/entity-store"
import { totalToolCount } from "@/lib/tools/registry"

export function AgentStatusBar() {
  const [timestamp, setTimestamp] = useState("")

  useEffect(() => {
    function update() {
      setTimestamp(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    }
    update()
    const interval = setInterval(update, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-6 px-4 py-2 bg-white border-b border-gray-100 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
      {/* Sandra Active */}
      <div className="flex items-center gap-1.5 font-medium text-gray-700 shrink-0">
        <span className="w-2 h-2 rounded-full bg-[#37b7ab] pulse-dot" />
        <span>Sandra AI</span>
        <span className="text-[#37b7ab] font-semibold">Active</span>
      </div>

      <div className="w-px h-3 bg-gray-200 shrink-0" />

      {/* Compliance Agent */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        <span className="text-gray-600">Compliance Agent:</span>
        <span className="font-medium text-gray-900">Connected</span>
        <div className="flex gap-0.5 ml-1">
          {["NG", "KE", "US", "EU"].map((j) => (
            <span key={j} className="px-1 py-0.5 rounded text-[10px] bg-gray-100 text-gray-500 font-mono border border-gray-200">
              {j}
            </span>
          ))}
        </div>
      </div>

      <div className="w-px h-3 bg-gray-200 shrink-0" />

      {/* Fraud Agent */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        <span className="text-gray-600">Fraud Intelligence Agent:</span>
        <span className="font-medium text-gray-900">Connected</span>
      </div>

      <div className="w-px h-3 bg-gray-200 shrink-0" />

      {/* Tool Mesh */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-gray-600">Tool Mesh:</span>
        <span className="font-medium text-gray-700">{totalToolCount} tools available</span>
      </div>

      <div className="w-px h-3 bg-gray-200 shrink-0" />

      {/* Memory */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-gray-600">Memory:</span>
        <span className="font-medium text-gray-700">{totalEntities.toLocaleString()} entities indexed</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Timestamp */}
      {timestamp && (
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-gray-400">Last updated</span>
          <span className="font-mono text-gray-500">{timestamp}</span>
        </div>
      )}
    </div>
  )
}
