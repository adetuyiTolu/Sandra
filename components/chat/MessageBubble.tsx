// Sandra AI — MessageBubble [CONVERSATIONAL]
//
// Component classification: CONVERSATIONAL
// Renders a single message bubble in the chat. Handles both user messages
// (plain text, right-aligned) and Sandra messages (with streaming support,
// memory badge, intent label, component card, and action chips).
//
// Why this component is intentionally simple:
// All the complex SSE state management lives in ChatWindow.tsx. MessageBubble
// just renders what it's given. This separation means Sandra's "working" state
// (in ChatWindow) and the rendering of the result (in MessageBubble) are
// completely decoupled. You could swap out the bubble design without touching
// any SSE logic.
//
// The StructuredResult component is lazy-rendered inside MessageBubble —
// only when a component type is present. This keeps the common case (plain
// text message) as lightweight as possible.

"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import type { ToolCall, AgentName, ComponentType } from "@/lib/types"
import { ToolCallTrace } from "./ToolCallTrace"
import { StructuredResult } from "./StructuredResult"
import { MemoryIndicator } from "@/components/shared/MemoryIndicator"
import { cn } from "@/lib/utils"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

export interface Message {
  id: string
  role: "user" | "sandra"
  content: string
  isStreaming?: boolean
  tool_calls?: ToolCall[]
  agent_used?: AgentName | null
  intent?: string
  memory_used?: boolean
  memory_summary?: string
  component?: ComponentType
  component_data?: unknown
  actions?: string[]
  attachments?: { name: string; type: string; url?: string }[]
  timestamp: Date
}

interface MessageBubbleProps {
  message: Message
  onActionClick?: (action: string) => void
}



const markdownComponents: Components = {
  p: (props) => <p className="leading-relaxed" {...props} />,
  strong: (props) => <strong className="font-semibold text-white" {...props} />,
  ul: (props) => <ul className="list-disc list-outside ml-5 space-y-1 my-2" {...props} />,
  ol: (props) => <ol className="list-decimal list-outside ml-5 space-y-1 my-2" {...props} />,
  li: (props) => <li className="pl-1" {...props} />,
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "")
    const isInline = !match && !String(children).includes("\n")
    return isInline ? (
      <code className="bg-white/10 text-[#37b7ab] px-1.5 py-0.5 rounded text-[12px] font-mono" {...props}>
        {children}
      </code>
    ) : (
      <pre className="glass-panel text-[#EAEAEA] p-3 rounded-xl overflow-x-auto text-[12px] font-mono my-3 shadow-premium">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    )
  },
}

export function MessageBubble({ message, onActionClick }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const [showTech, setShowTech] = useState(false)
  
  const hasTechDetails = (message.tool_calls && message.tool_calls.length > 0) || message.memory_used

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[85%]">
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end mb-2">
              {message.attachments.map((file, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2A2A2C] border border-[#3A3A3C] rounded-lg shadow-sm">
                  {file.type.startsWith('image/') ? (
                    <div className="w-4 h-4 rounded-[2px] bg-[#444] overflow-hidden flex items-center justify-center shrink-0">
                      {file.url ? <img src={file.url} alt={file.name} className="w-full h-full object-cover" /> : <div className="text-[8px] text-white">IMG</div>}
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-[2px] bg-[#37b7ab]/20 flex items-center justify-center text-[#37b7ab] shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                  )}
                  <span className="text-xs text-[#EAEAEA] truncate max-w-[150px]">{file.name}</span>
                </div>
              ))}
            </div>
          )}
          {message.content && (
            <div className="glass-panel text-[#EAEAEA] rounded-xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed shadow-premium ml-auto w-fit">
              {message.content}
            </div>
          )}
          <div className="text-[10px] text-[#555555] text-right mt-1.5 font-medium">
            {message.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-4 mb-8 max-w-[95%]">
      {/* Sandra avatar */}
      <div className="w-8 h-8 rounded-full glass-panel border border-[#37b7ab]/30 flex items-center justify-center text-[#37b7ab] font-bold text-xs shrink-0 mt-0.5 shadow-[0_0_10px_rgba(55,183,171,0.2)]">
        S
      </div>

      <div className="flex-1 min-w-0">
        {/* Technical Details (Hidden by default) */}
        {showTech && (
          <div className="mb-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {message.memory_used && <MemoryIndicator summary={message.memory_summary} />}
            {message.tool_calls && message.tool_calls.length > 0 && (
              <ToolCallTrace
                tool_calls={message.tool_calls}
                agent_used={message.agent_used}
                intent={message.intent}
              />
            )}
          </div>
        )}

        {/* Sandra's message */}
        <div className="bg-transparent px-1 py-1">
          <div className={cn("text-sm text-[#EAEAEA] leading-loose", message.isStreaming && "streaming-cursor")}>
            {message.content ? (
              <div className="space-y-3">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
              >
                {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#555555] text-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#555555] animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#555555] animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#555555] animate-bounce [animation-delay:300ms]" />
                </div>
                Thinking...
              </div>
            )}
          </div>

          {/* Structured result inline */}
          {message.component && message.component_data !== undefined && !message.isStreaming && (
            <StructuredResult component={message.component} component_data={message.component_data as Record<string, unknown>} />
          )}
        </div>

        {/* Action chips */}
        {message.actions && message.actions.length > 0 && !message.isStreaming && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.actions.map((action) => (
              <button
                key={action}
                onClick={() => onActionClick?.(action)}
                className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-[#1C1C1E] text-[#37b7ab] hover:bg-white/5 transition-all-150 font-medium"
              >
                {action}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 mt-1.5 ml-1">
          <div className="text-[11px] text-gray-400">
            {message.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </div>
          
          {hasTechDetails && (
            <button
              onClick={() => setShowTech(!showTech)}
              className={cn(
                "flex items-center gap-1 text-[11px] transition-colors rounded-full px-2 py-0.5",
                showTech ? "bg-[#37b7ab]/10 text-[#37b7ab]" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              )}
              title="View internal processing"
            >
              <Info size={12} />
              {showTech ? "Hide internal details" : "Internal details"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
