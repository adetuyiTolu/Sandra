// Sandra AI — MemoryIndicator [SHARED]
//
// Component classification: SHARED (appears in chat bubbles above Sandra messages)
// The MemoryIndicator is a small badge that appears above Sandra's message
// when entity memory was retrieved before forming the response.
//
// WHY THIS EXISTS AS A SEPARATE COMPONENT:
// It's small, but its presence communicates something important: Sandra didn't
// reason from scratch. It had prior context. The badge makes memory retrieval
// visible to operators without requiring them to read through the tool trace.
//
// The summary prop contains the one-line entity context from getMemorySummary()
// in entity-store.ts. It's truncated to max-w-[280px] because the chat interface
// has limited width and the summary should be a hint, not a full report.
// Full entity detail is available in the Operations detail panel.
interface MemoryIndicatorProps {
  summary?: string
}

export function MemoryIndicator({ summary }: MemoryIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-700">
        <span className="w-1.5 h-1.5 rounded-full bg-[#37b7ab]" />
        <span className="font-medium">Memory Context</span>
        {summary && (
          <span className="text-gray-500 font-normal truncate max-w-[280px]">· {summary}</span>
        )}
      </div>
    </div>
  )
}
