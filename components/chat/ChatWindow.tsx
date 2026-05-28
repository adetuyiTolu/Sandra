// Sandra AI — ChatWindow [CONVERSATIONAL]
//
// Component classification: CONVERSATIONAL
// This component owns the entire chat interaction surface. It is the primary
// consumer of the /api/sandra SSE stream and the holder of SESSION MEMORY
// (the messages array). Everything the user sees as Sandra "working" — the
// tool call trace appearing in real time, the text printing word by word, the
// memory badge, the component cards — is driven by state mutations inside
// this component's SSE event handler.
//
// KEY ARCHITECTURAL RESPONSIBILITIES:
//
//   1. SSE consumption: The sendMessage() function opens a ReadableStream to
//      /api/sandra and processes each event type (tool_start, tool_end,
//      agent_invoked, memory_used, token, component, done) as it arrives.
//      The order matters — see buildSSEStream() in mock-engine.ts for the why.
//
//   2. Session memory: The messages array IS session memory. It's not persisted.
//      Sandra uses prior messages for conversational coherence within a session.
//      Refreshing the page resets session memory entirely — by design.
//
//   3. Trace panel state: latestToolCalls, latestAgent, latestIntent, latestMemory
//      are all extracted from the most recent SSE stream and passed to the
//      ToolCallTrace right panel. These are not persisted across messages —
//      only the most recent Sandra response is traced. This is intentional:
//      the trace panel is for understanding the current response, not auditing
//      the full session history. For that, see the Decision Log.
//
//   4. Progressive enhancement: The Sandra placeholder message is inserted
//      into the messages array immediately (isStreaming: true) so the user sees
//      a "thinking" state instantly. Content, tool calls, and component data
//      are added progressively as SSE events arrive.
//
//   5. Context injection: The entityContext prop is passed from the Operations
//      page when the user clicks "Ask Sandra" on a specific KYC item. This
//      pre-seeds the conversation with entity information so Sandra knows which
//      entity the operator is asking about without them having to repeat it.

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Command, Paperclip, X } from "lucide-react"
import { MessageBubble, type Message } from "./MessageBubble"
import type { ToolCall, AgentName, ComponentType } from "@/lib/types"
import { cn } from "@/lib/utils"
import type { SandraAskEvent } from "@/lib/sandra-events"

const DEFAULT_SUGGESTIONS = [
  "Show pending KYC",
  "Check fraud alerts",
  "Run AML on Greenfield Commodity Trading Ltd",
  "View billing summary",
]

const POST_KYC_SUGGESTIONS = [
  "Open a case for top risk items",
  "Approve all low risk",
  "Why was this transaction flagged?",
  "Escalate flagged items",
]

interface ChatWindowProps {
  initialMessage?: string
  entityContext?: string
}

export function ChatWindow({ initialMessage, entityContext }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState(initialMessage ?? "")
  const [attachments, setAttachments] = useState<{ name: string; type: string; url?: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS)

  // Scroll to bottom when new messages arrive
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        name: file.name,
        type: file.type,
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      }))
      setAttachments(prev => [...prev, ...newFiles])
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (initialMessage) {
      setInput(initialMessage)
      inputRef.current?.focus()
    }
  }, [initialMessage])

  const sendMessage = useCallback(async (text: string, currentAttachments = attachments) => {
    if ((!text.trim() && currentAttachments.length === 0) || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      attachments: currentAttachments.length > 0 ? [...currentAttachments] : undefined,
      timestamp: new Date(),
    }

    const sandraPlaceholderId = `sandra-${Date.now()}`
    const sandraPlaceholder: Message = {
      id: sandraPlaceholderId,
      role: "sandra",
      content: "",
      isStreaming: true,
      tool_calls: [],
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage, sandraPlaceholder])
    setInput("")
    setAttachments([])
    setIsLoading(true)

    // State accumulated during streaming
    let accContent = ""
    const accToolCalls: ToolCall[] = []
    let accAgentUsed: AgentName | null = null
    let accIntent = ""
    let accMemoryUsed = false
    let accMemorySummary: string | undefined
    let accComponent: ComponentType | undefined
    let accComponentData: unknown
    let accActions: string[] = []

    try {
      const res = await fetch("/api/sandra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: text, 
          context: entityContext,
          hasAttachments: currentAttachments.length > 0 
        }),
      })

      if (!res.body) throw new Error("No response body")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const raw = line.slice(6).trim()
          if (!raw) continue

          let parsed: { type: string; data: Record<string, unknown> }
          try {
            parsed = JSON.parse(raw) as { type: string; data: Record<string, unknown> }
          } catch {
            continue
          }

          const { type, data } = parsed

          if (type === "tool_start") {
            // Show tool starting
            accToolCalls.push({
              tool: data.tool as string,
              inputs: data.inputs as Record<string, string | number | boolean>,
              output_summary: "Running...",
              timing_ms: 0,
              category: data.category as ToolCall["category"],
            })
            setMessages((prev) =>
              prev.map((m) =>
                m.id === sandraPlaceholderId
                  ? { ...m, tool_calls: [...accToolCalls] }
                  : m
              )
            )
          } else if (type === "tool_end") {
            // Update last tool with result
            const idx = accToolCalls.findLastIndex((t) => t.tool === (data.tool as string) && t.output_summary === "Running...")
            if (idx >= 0) {
              accToolCalls[idx] = {
                ...accToolCalls[idx],
                output_summary: data.output as string,
                timing_ms: data.timing_ms as number,
              }
            }

          } else if (type === "agent_invoked") {
            accAgentUsed = data.agent as AgentName

          } else if (type === "memory_used") {
            accMemoryUsed = true
            accMemorySummary = data.summary as string

          } else if (type === "token") {
            accContent += data.token as string
            setMessages((prev) =>
              prev.map((m) =>
                m.id === sandraPlaceholderId
                  ? { ...m, content: accContent, isStreaming: true }
                  : m
              )
            )
          } else if (type === "component") {
            accComponent = data.component as ComponentType
            accComponentData = data.component_data
            accActions = (data.actions as string[]) ?? []
          } else if (type === "done") {
            accIntent = data.intent as string

          }
        }
      }
    } catch (err) {
      accContent = "I encountered an error processing your request. Please try again."
      console.error(err)
    }

    // Finalize the Sandra message
    setMessages((prev) =>
      prev.map((m) =>
        m.id === sandraPlaceholderId
          ? {
              ...m,
              content: accContent,
              isStreaming: false,
              tool_calls: accToolCalls,
              agent_used: accAgentUsed,
              intent: accIntent,
              memory_used: accMemoryUsed,
              memory_summary: accMemorySummary,
              component: accComponent,
              component_data: accComponentData,
              actions: accActions,
            }
          : m
      )
    )

    setIsLoading(false)

    // Update suggestions based on what just happened
    if (accComponent === "verification_list") {
      setSuggestions(POST_KYC_SUGGESTIONS)
    } else {
      setSuggestions(DEFAULT_SUGGESTIONS)
    }
  }, [isLoading, entityContext, attachments])

  // Listen for cross-component ask events from Operations, Alerts, and Workspace.
  useEffect(() => {
    const handleAsk = (e: SandraAskEvent) => {
      const detail = e.detail
      if (!detail) return
      const message = typeof detail === "string" ? detail : detail.message

      if (typeof detail !== "string" && detail.submit) {
        sendMessage(message)
        return
      }

      setInput(message)
      inputRef.current?.focus()
    }

    window.addEventListener("sandra:ask", handleAsk as EventListener)
    return () => window.removeEventListener("sandra:ask", handleAsk as EventListener)
  }, [sendMessage])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function handleAction(action: string) {
    sendMessage(action)
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-full overflow-hidden bg-[#0A0A0A]">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-2">
              <div className="w-11 h-11 rounded-lg bg-[#37b7ab] flex items-center justify-center text-white mb-4 shadow-sm">
                <Command size={20} />
              </div>
              <h2 className="text-base font-semibold text-[#EAEAEA] mb-2">Ask Sandra</h2>
              <p className="text-gray-500 text-xs max-w-[260px] mb-6 leading-relaxed">
                I&apos;m your AI operating layer for compliance and fraud detection.
                {entityContext && ` I have context loaded for ${entityContext}.`}
              </p>
              <div className="flex flex-col gap-2 w-full max-w-[280px]">
                {suggestions.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs text-left px-3 py-2 rounded-md border border-white/5 bg-white/5 text-[#888888] hover:border-[#37b7ab]/40 hover:bg-[#37b7ab]/10 hover:text-[#37b7ab] transition-all duration-150"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} onActionClick={handleAction} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className="px-4 pb-4 pt-2 bg-[#0A0A0A] border-t border-white/5">
          {/* Suggestion chips */}
          {!isEmpty && (
            <div className="flex gap-2 flex-wrap mb-3">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-[10px] px-2.5 py-1 rounded-md border border-white/5 bg-white/5 text-[#888888] hover:border-[#37b7ab]/50 hover:text-[#37b7ab] hover:bg-[#37b7ab]/10 transition-all duration-150"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="max-w-4xl mx-auto relative flex flex-col">
            {/* Attachment Previews */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 px-2">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-[#2A2A2C] border border-[#3A3A3C] rounded-md shadow-sm">
                    {file.type.startsWith('image/') ? (
                      <div className="w-4 h-4 rounded-[2px] bg-[#444] overflow-hidden flex items-center justify-center shrink-0">
                        {file.url ? <img src={file.url} alt={file.name} className="w-full h-full object-cover" /> : <div className="text-[8px] text-white">IMG</div>}
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-[2px] bg-[#37b7ab]/20 flex items-center justify-center text-[#37b7ab] shrink-0">
                        <Paperclip size={10} />
                      </div>
                    )}
                    <span className="text-[11px] text-[#EAEAEA] truncate max-w-[120px]">{file.name}</span>
                    <button 
                      onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                      className="ml-1 w-4 h-4 flex items-center justify-center text-[#888] hover:text-[#EAEAEA] rounded-full hover:bg-white/10 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex-1 relative flex items-end">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="absolute left-2 bottom-2 w-8 h-8 rounded-md flex items-center justify-center text-[#888] hover:text-[#EAEAEA] hover:bg-white/10 transition-colors z-10 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Attach files"
              >
                <Paperclip size={16} />
              </button>
              <input 
                type="file" 
                multiple 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
              />
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Sandra anything — KYC, AML, fraud, compliance..."
                rows={1}
                disabled={isLoading}
                className={cn(
                  "w-full resize-none rounded-lg border border-white/10 py-3.5 pl-11 pr-12 text-sm text-[#EAEAEA] placeholder-[#555555] bg-white/5 backdrop-blur-md transition-all shadow-premium",
                  "focus:outline-none focus:border-[#37b7ab]/60 focus:bg-white/10 glow-primary",
                  "overflow-hidden max-h-32",
                  "disabled:opacity-60 disabled:cursor-not-allowed"
                )}
                style={{ height: "52px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = "52px"
                  target.style.height = Math.min(target.scrollHeight, 128) + "px"
                }}
                id="sandra-chat-input"
              />
              <button
                onClick={() => sendMessage(input, attachments)}
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
                className={cn(
                  "absolute right-2 bottom-2 w-8 h-8 rounded-md flex items-center justify-center transition-colors z-10",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  (input.trim() || attachments.length > 0) ? "bg-[#37b7ab] text-white hover:bg-[#37b7ab]/90" : "bg-white/5 text-[#555555]"
                )}
                id="sandra-send-button"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={14} className="ml-0.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
