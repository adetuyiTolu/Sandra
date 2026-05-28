// ── Sandra AI — API Route ─────────────────────────────────────────────────────
//
// THE FULL SANDRA REQUEST LIFECYCLE:
//
// This route is the single entry point for every Sandra response. Here is the
// complete call sequence from HTTP request to streamed client response:
//
//   1. REQUEST RECEIVED
//      Client sends POST /api/sandra with { message, history?, context? }.
//      "history" is the prior conversation (for context). "context" is entity
//      context passed from the Operations page when a user asks about a specific
//      item from the queue.
//
//   2. DECISION LOG SEEDING (first request only)
//      On the very first request to this route, we seed the decision log with
//      3 pre-existing decisions. This makes the "full picture" demo step feel
//      like Sandra has been working all day, not just since the page loaded.
//      In production, the decision log would be a persistent database table,
//      not seeded in the API route.
//
//   3. INTENT CLASSIFICATION (inside simulateResponse)
//      routeIntent(message) classifies the message as REASONING, ACTION, or
//      RETRIEVAL. This runs before any tool selection. See intent-router.ts
//      for why this gate matters and what it would cost to skip it.
//
//   4. SCENARIO MATCHING (inside simulateResponse)
//      matchScenario(message) selects which of the 12 pre-scripted tool plans
//      to execute. In production, this step would be Sandra's tool-planning
//      model deciding which tools to call based on intent + available tools.
//
//   5. ENTITY MEMORY RETRIEVAL (inside the scenario function)
//      isMemoryEntity(message) checks if the message references an entity with
//      history. If yes, getMemorySummary() is called and the memory context is
//      attached to the response. This happens INSIDE the scenario execution,
//      before the response is formed — not after.
//
//   6. TOOL EXECUTION (inside the scenario function)
//      Each executor function (executeListVerificationRequests, executeRunAMLScreening,
//      etc.) is called. These are the boundary between Sandra's orchestration
//      and Prembly's API surface. Each call returns structured data.
//
//   7. AGENT INVOCATION (inside the scenario function, when needed)
//      For REASONING intent scenarios, queryComplianceAgent() or queryFraudAgent()
//      is called. This is Sandra invoking a specialist sub-agent — structurally
//      identical to a tool call from Sandra's perspective.
//
//   8. RESPONSE SYNTHESIS (inside simulateResponse)
//      The scenario function assembles the SandraResponse object: intent, tool_calls,
//      message text, component type, component data, actions, memory metadata,
//      agent metadata.
//
//   9. SSE STREAMING (buildSSEStream)
//      The completed SandraResponse is streamed back to the client as a sequence
//      of SSE events in this order:
//        tool_start → tool_end (per tool, with realistic delay)
//        → agent_invoked (if applicable)
//        → memory_used (if applicable)
//        → token (word-by-word message streaming)
//        → component (structured data payload)
//        → done (final metadata)
//
// WHY SERVER-SENT EVENTS (SSE) INSTEAD OF WEBSOCKETS?
//
// SSE is unidirectional (server → client), which is exactly what we need here.
// There's no need for bidirectional communication during a Sandra response —
// the client sends one request and receives one streamed response. SSE is also
// simpler to implement in Next.js App Router (just a ReadableStream in the
// response), works through HTTP/2 multiplexing, and reconnects automatically
// if the connection drops. WebSockets would add complexity with no benefit.
//
// WHY DOES TOOL EXECUTION HAPPEN BEFORE MESSAGE STREAMING?
//
// This is the most important architectural decision to understand. Sandra does
// all the work first (tool calls, agent invocations, memory retrieval), THEN
// starts streaming the message. This is different from how most chatbots work.
//
// The reason: Sandra's message is GROUNDED in the tool call results. Sandra
// says "I found 9 pending verifications" because it called the tool and got 9
// back. If we streamed the message concurrently with tool execution, Sandra
// would have to speculate about what the tools would return.
//
// Showing tool_start/tool_end events during the delay gives the user the
// impression of watching Sandra "think" — but the message is only revealed
// after all tools have resolved. This is the correct user experience for an
// AI that grounds every statement in real data.

import { NextRequest } from "next/server"
import { buildSSEStream, simulateResponse } from "@/lib/mock-engine"
import { seedDemoLog } from "@/lib/memory/decision-log"

// Module-level flag to seed the decision log exactly once per server process.
// This is intentionally not a React state or database flag — it resets when
// the dev server restarts, which is the right behavior for a demo environment.
let seeded = false

export async function POST(req: NextRequest) {
  if (!seeded) {
    seedDemoLog()
    seeded = true
  }

  const body = await req.json() as { message: string; history?: unknown[]; context?: unknown; hasAttachments?: boolean }
  const { message, hasAttachments } = body

  if (typeof message !== "string" && !hasAttachments) {
    return new Response(JSON.stringify({ error: "message or attachments are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  // simulateResponse() executes the full Sandra pipeline synchronously (with
  // deliberate internal delays to simulate realistic tool execution timing).
  // It returns a fully-formed SandraResponse before we begin streaming.
  // This ensures the SSE stream has complete data to work from — no mid-stream
  // speculation or partial results.
  const response = await simulateResponse(message || "", hasAttachments)

  // buildSSEStream() converts the complete SandraResponse into a streaming
  // sequence of SSE events. The stream drives the ChatWindow's real-time
  // UI updates: tool traces appearing, agents being invoked, tokens printing.
  const stream = buildSSEStream(response)

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      // Prevent any intermediate proxy or CDN from buffering the stream.
      // Without this, the client would receive all events in one batch at the
      // end instead of seeing them arrive in real-time.
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",  // Specific nginx directive for pass-through streaming
    },
  })
}
