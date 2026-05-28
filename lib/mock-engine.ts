// Sandra AI — Core Mock Engine
//
// THE ENGINE'S ROLE IN SANDRA'S ARCHITECTURE:
//
// This file is the heart of the demo. In production, the equivalent code would
// be Sandra's orchestration layer — the part of the system that:
//   1. Receives a classified intent from the router
//   2. Selects a tool plan (which tools to call, in which order)
//   3. Executes each tool call (against Prembly APIs and sub-agents)
//   4. Retrieves relevant memory context
//   5. Synthesizes a grounded, structured response
//   6. Streams that response to the client
//
// In this demo, steps 1-5 are deterministic (keyword to pre-scripted scenario).
// In production, steps 2-5 would be driven by a language model that dynamically
// selects tools, executes them in sequence, and synthesizes a response from
// the tool outputs. The SSE streaming format (step 6) is identical.
//
// WHY INTENT ROUTING HAPPENS BEFORE SCENARIO SELECTION:
//
// Intent classification is a cheap pre-filter. In production, it prevents the
// orchestration model from receiving REASONING queries and trying to answer them
// from weights alone (hallucination risk). The intent tells the model:
//   - REASONING: "You must invoke the Compliance or Fraud Agent. Do not guess."
//   - ACTION:    "You must call a state-changing tool. Log this to the Decision Log."
//   - RETRIEVAL: "You are fetching data. Be concise and structured."
// Without this pre-filter, a model might answer "is it legal to receive EU payments"
// from training data instead of the Compliance Agent — producing plausible but
// unverifiable regulatory advice. That's unacceptable in a compliance system.
//
// WHY TOOL CALLS RESOLVE BEFORE THE MESSAGE IS WRITTEN:
//
// Sandra's message is GROUNDED. Every factual claim in the message comes from
// a tool call result. "I found 9 pending KYC requests" is true because the tool
// returned 9. "The AML hit confidence is 91%" is true because the AML executor
// returned 0.91. If we streamed the message and ran tools concurrently, Sandra
// would have to predict what the tools would return — which is speculation, not
// intelligence. All tools resolve first; message synthesis comes last.
//
// WHY SIMULATE STREAMING AT ALL?
//
// The purpose of the SSE stream is to make Sandra's "thinking" visible in real
// time. Operators watching the demo can see:
//   - Which tools Sandra called (tool_start/tool_end)
//   - Whether an agent was invoked (agent_invoked)
//   - Whether memory context was used (memory_used)
//   - The message printing word-by-word (token events)
// This transparency is a core part of Sandra's value proposition: operators are
// not using a black box — they can see exactly how every answer was formed.

import type { SandraResponse, ToolCall } from "@/lib/types"
import { routeIntent, matchScenario } from "@/lib/intent-router"
import { queryComplianceAgent } from "@/lib/agents/compliance"
import { queryFraudAgent } from "@/lib/agents/fraud"
import { isMemoryEntity, getMemorySummary } from "@/lib/memory/entity-store"
import {
  executeListVerificationRequests,
  executeRunAMLScreening,
  executeGetFlaggedAlerts,
  executeRunFraudScan,
  executeCreateCase,
  executeAssignCase,
  executeGetBillingSummary,
  executeGetSDKReports,
} from "@/lib/tools/executors"

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// timing() produces a deterministic value that looks like real API latency.
// Using base + (base % jitter) instead of Math.random() ensures the same tool
// always takes the same amount of time across demo runs. This matters because
// the ToolCallTrace shows timing in milliseconds — if it changed every run,
// an attentive investor would notice. Determinism also means no hydration
// mismatches between server and client render.
function timing(base: number, jitter: number): number {
  // Deterministic jitter using base value — no Math.random()
  return base + (base % jitter)
}

// ── 12 pre-scripted scenarios ────────────────────────────────────────────────────────
//
// Each scenario is a function that receives the original message string and
// returns a fully-formed SandraResponse. The function has access to the
// message so it can extract entity names, case IDs, and assignee names from
// natural language input (e.g., "assign CM-2024-0091 to Tokunbo").
//
// Each scenario represents a complete Sandra "thought" — the tool calls it
// made, the agent it invoked (if any), the memory it retrieved, the message
// it would generate, the component it would render, and the action chips
// it would suggest. This is the unit of Sandra's intelligence in this demo.
//
// In production, this object would be constructed dynamically by the
// orchestration model based on the intent, tool results, and response
// constraints. The structure (tool_calls array, message, component, actions)
// would be identical.──

type ScenarioDef = (message: string) => SandraResponse

const scenarios: Record<string, ScenarioDef> = {
  // Scenario 1: Show pending KYC queue.
  // This is a RETRIEVAL scenario — one tool call, no agent, no memory context.
  // Sandra surfaces its AI assessment for each KYC item in the queue so the
  // operator doesn't have to read each one manually. The ai_summary field on
  // each KYCRequest is what Sandra has already computed — this scenario just
  // retrieves and presents it. In production, those summaries would be computed
  // at submission time by a KYC assessment model, not at query time.
  show_pending_kyc: () => {
    const data = executeListVerificationRequests()
    const pending = data.filter((r) => r.status === "PENDING" || r.status === "MANUAL_REVIEW" || r.status === "IN_PROGRESS")
    const calls: ToolCall[] = [
      {
        tool: "list_verification_requests",
        inputs: { status: "PENDING", limit: 50 },
        output_summary: `${pending.length} pending/manual review items returned. Highest risk: KYC-2024-004827 (risk score: 95).`,
        timing_ms: timing(412, 100),
        category: "Verification",
      },
    ]
    return {
      intent: "RETRIEVAL",
      tool_calls: calls,
      message: `I found **${pending.length} verification requests** requiring attention right now. The queue is sorted by risk score — I've already done the analysis on each one.\n\nThe top concern is **Emeka Chukwuemeka Nwosu** (KYC-2024-004823) with a risk score of 88. His BVN is linked to 3 previously flagged accounts. I recommend escalating that one immediately.\n\n**Mohammed Abdullahi Suleiman** (risk score: 79) is also critical — his IP address geo-fences to a sanctioned region with 18 pre-KYC cross-border transactions.\n\nThe remaining items are medium-risk requiring manual review. I've surfaced a one-line assessment for each. Would you like me to open cases for the high-risk items?`,
      component: "verification_list",
      component_data: pending,
      actions: ["Open case for top risk items", "Approve all low risk", "Export CSV", "Escalate flagged"],
      memory_used: false,
    }
  },

  // Scenario 2: AML screening on Greenfield.
  // This is an ACTION scenario — two tool calls (AML screening + Compliance Agent),
  // plus memory retrieval (Greenfield is a known entity with 2 open cases).
  //
  // The sequence is: run_aml_screening (Prembly API) → query_compliance_agent (Agent).
  // The AML screening tool returns the match. The Compliance Agent answers
  // "what is the operator legally required to do now?". These are separate
  // concerns: diagnosis (AML tool) and prescription (Compliance Agent).
  //
  // isMemoryEntity() is called here (not in the mock engine wrapper) because
  // the memory check is scenario-specific. Only scenarios where entity history
  // changes Sandra's response need to check memory.
  run_aml_greenfield: (msg) => {
    const memoryUsed = isMemoryEntity(msg)
    const amlResult = executeRunAMLScreening("Greenfield Commodity Trading Ltd")
    const complianceAnswer = queryComplianceAgent("AML hit threshold exceeded Greenfield", "NG,EU")
    const calls: ToolCall[] = [
      {
        tool: "run_aml_screening",
        inputs: { entity_name: "Greenfield Commodity Trading Ltd", entity_type: "BUSINESS", jurisdiction: "NG" },
        output_summary: "Status: HIT — NFIU Watchlist match at 91% confidence. CBN Restricted Entities partial match at 73%.",
        timing_ms: timing(1102, 200),
        category: "Verification",
      },
      {
        tool: "query_compliance_agent",
        inputs: { question: "AML hit — NFIU watchlist match on Nigerian business", jurisdictions: "NG,EU" },
        output_summary: "EDD required. STR must be filed within 24 hours. Tipping-off prohibition applies.",
        timing_ms: timing(1580, 300),
        category: "Agent",
      },
    ]
    return {
      intent: "ACTION",
      tool_calls: calls,
      message: `**AML screening complete for Greenfield Commodity Trading Ltd.**\n\nThis is a confirmed **HIT**. Two matches found:\n\n1. **NFIU Watchlist** — 91% confidence match against "Greenfield Commodities Trading Limited" (name variation — potential alias)\n2. **CBN Restricted Entities** — 73% match (same registration address)\n\nI've invoked the Compliance Agent. Under CBN AML/CFT Regulations 2022 (Section 14.3), you are required to:\n- Initiate Enhanced Due Diligence immediately\n- File a Suspicious Transaction Report with NFIU within **24 hours**\n- **Do not alert the entity** — tipping-off prohibition applies (MLPPA 2022, Section 15)\n\nShall I open a case and draft the STR?`,
      component: "aml_result",
      component_data: amlResult,
      actions: ["Open a case", "File STR", "Escalate to Compliance", "Freeze account"],
      memory_used: memoryUsed,
      memory_summary: memoryUsed ? getMemorySummary(msg) : undefined,
      agent_used: "compliance",
      reasoning_trace: complianceAnswer.answer,
    }
  },

  // Scenario 3: EU/Nigeria payment legality question.
  // Pure REASONING scenario — one agent call (Compliance Agent), no Prembly
  // API tool calls. The user is asking a regulatory question, not requesting
  // an action or data retrieval. The Compliance Agent is the entire "tool plan".
  //
  // Notice there's no Prembly tool call here. Not every Sandra response needs
  // to hit the Prembly API. Sometimes the right answer is purely regulatory
  // knowledge — which comes from the Compliance Agent, not from operational data.
  eu_ng_payment_legality: () => {
    const complianceAnswer = queryComplianceAgent("legal for Nigerian business to receive EU payments", "NG,EU")
    const calls: ToolCall[] = [
      {
        tool: "query_compliance_agent",
        inputs: { question: "Is it legal for a Nigerian business to receive payments from EU customers?", jurisdictions: "NG,EU" },
        output_summary: "Multi-jurisdiction analysis complete. CBN Section 14.3 + EU AMLD6 applied. EDD required above ₦5M threshold.",
        timing_ms: timing(1840, 400),
        category: "Agent",
      },
    ]
    return {
      intent: "REASONING",
      tool_calls: calls,
      message: `**Yes, it is legal** — with specific regulatory obligations at certain thresholds.\n\nI've run a multi-jurisdiction analysis across Nigerian (CBN) and EU (AMLD6) frameworks:\n\n**Nigerian side:** Under CBN AML/CFT Regulations 2022 (Section 14.3), receiving cross-border EU payments exceeding **₦5,000,000 from a single counterpart in 30 days** triggers:\n- Enhanced Due Diligence (EDD)\n- Suspicious Transaction Report if source of funds is unverifiable\n- 5-year record-keeping requirement\n\n**EU side:** The Nigerian business's EU correspondent must verify beneficial ownership before processing under EU AMLD6 Article 3(6)(b).\n\nConfidence: **94%**`,
      component: "compliance_answer",
      component_data: complianceAnswer,
      actions: ["Request EDD documentation", "Set threshold alert", "View full regulation", "Download guidance PDF"],
      agent_used: "compliance",
      reasoning_trace: complianceAnswer.answer,
    }
  },

  // Scenario 4: Show fraud alerts.
  // RETRIEVAL scenario — one tool call, no agent, no memory.
  // Note that Sandra goes beyond just listing the alerts: it counts by severity
  // and writes a narrative summary ("3 CRITICAL, here's the immediate picture").
  // This is Sandra's role as an intelligence layer — not just a data proxy.
  // The raw alert data goes into the component payload; the narrative goes in the message.
  show_fraud_alerts: () => {
    const alerts = executeGetFlaggedAlerts()
    const critical = alerts.filter((a) => a.severity === "CRITICAL").length
    const calls: ToolCall[] = [
      {
        tool: "get_flagged_alerts",
        inputs: { limit: 20 },
        output_summary: `${alerts.length} active alerts returned. ${critical} CRITICAL. Fraud Intelligence Agent and Compliance Agent both have pending items.`,
        timing_ms: timing(334, 80),
        category: "Fraud",
      },
    ]
    return {
      intent: "RETRIEVAL",
      tool_calls: calls,
      message: `I'm showing **${alerts.length} active alerts** across your monitoring stack. Here's the immediate picture:\n\n🔴 **${critical} CRITICAL** — The coordinated BVN ring (3 accounts, ₦12.4M cycled) requires immediate action. I've already drafted a block recommendation.\n\n🟠 **${alerts.filter((a) => a.severity === "HIGH").length} HIGH** — Including the Greenfield compliance trigger and the NFIU watchlist retroactive match on 2 previously approved entities.\n\n🟡 **${alerts.filter((a) => a.severity === "MEDIUM").length} MEDIUM** — Velocity anomalies and SLA breach warnings.\n\nSelect any alert to see my full reasoning and recommended action.`,
      component: "fraud_alerts",
      component_data: alerts,
      actions: ["Acknowledge all", "Escalate CRITICAL", "Open cases for HIGH", "Export report"],
    }
  },

  // Scenario 5: Run fraud scan on a transaction.
  // ACTION scenario — two tool calls: run_fraud_scan (Prembly API) then
  // query_fraud_agent (Fraud Intelligence Agent). The sequence is deliberate:
  // the scan produces raw risk signals; the agent interprets them into a named
  // fraud pattern. Sandra cannot skip the scan and go straight to the agent,
  // because the agent needs the scan results as input context.
  run_fraud_scan: () => {
    const fraudResult = executeRunFraudScan()
    const fraudAnalysis = queryFraudAgent("velocity anomaly flagged transaction why")
    const calls: ToolCall[] = [
      {
        tool: "run_fraud_scan",
        inputs: { transaction_id: "TXN-2024-8827361", amount_ngn: 261000, sender_account: "0123456789", receiver_account: "9876543210" },
        output_summary: "Risk score: 84. 5 risk indicators detected. Coordinated transfer pattern confirmed.",
        timing_ms: timing(921, 180),
        category: "Fraud",
      },
      {
        tool: "query_fraud_agent",
        inputs: { query: "TXN-2024-8827361 pattern analysis", entity_ids: "22187463901,33841927560" },
        output_summary: "Ring fraud confirmed — 1 of 47 coordinated transfers. Account takeover post-device-change. Confidence: 84%.",
        timing_ms: timing(1340, 250),
        category: "Agent",
      },
    ]
    return {
      intent: "ACTION",
      tool_calls: calls,
      message: `**Fraud scan complete on TXN-2024-8827361.**\n\nThis transaction has a **risk score of 84** — high. It's not an isolated incident.\n\nI've identified it as **transaction #23 of 47** in a coordinated transfer ring. The Fraud Intelligence Agent classifies this as layering through mule accounts with 84% confidence.\n\nKey signals:\n- Amount (₦261,000) matches 46 other transfers exactly\n- Receiver BVN 33841927560 previously flagged for mule activity (2023-Q3)\n- Sender's device changed 4 hours before the transaction burst\n\n**Recommendation: Block and escalate immediately.** Shall I flag all 47 transactions and open a case?`,
      component: "fraud_scan_result",
      component_data: fraudResult,
      actions: ["Block transaction", "Escalate to fraud team", "Open case", "Block all 47"],
      agent_used: "fraud",
      reasoning_trace: fraudAnalysis.analysis,
    }
  },

  // Scenario 6: Open a case for Greenfield and optionally assign it.
  // ACTION scenario — 1 or 2 tool calls depending on whether the message
  // includes an assignee. The spread operator on the tool_calls array is how
  // Sandra dynamically adjusts its tool plan based on natural language context
  // extracted from the message. If the user says "assign to Tokunbo", Sandra
  // adds the assign_case tool call to the plan. This is a simple example of
  // conditional tool planning — in production, the orchestration model does
  // this dynamically for any combination of conditions.
  //
  // Memory is always used for Greenfield because this is an action on a known
  // entity — the note in the case references the prior NFIU match.
  open_case_greenfield: (msg) => {
    const hasAssignee = msg.toLowerCase().includes("tokunbo") || msg.toLowerCase().includes("assign")
    const assignee = hasAssignee ? "Tokunbo Adeyemi" : undefined
    const newCase = executeCreateCase("Greenfield Commodity Trading Ltd", assignee)
    const calls: ToolCall[] = [
      {
        tool: "create_case",
        inputs: {
          entity_name: "Greenfield Commodity Trading Ltd",
          entity_id: "AML-2024-001923",
          type: "AML",
          priority: "HIGH",
          notes: "NFIU watchlist hit at 91% confidence. EDD required.",
        },
        output_summary: `Case CM-2024-0092 created. Priority: HIGH. ${assignee ? `Assigned to ${assignee}.` : "Unassigned."}`,
        timing_ms: timing(678, 120),
        category: "Case",
      },
      ...(assignee
        ? [
            {
              tool: "assign_case",
              inputs: { case_id: "CM-2024-0092", assignee },
              output_summary: `Case assigned to ${assignee}.`,
              timing_ms: timing(312, 60),
              category: "Case" as const,
            },
          ]
        : []),
    ]
    return {
      intent: "ACTION",
      tool_calls: calls,
      message: `Case **CM-2024-0092** has been opened for **Greenfield Commodity Trading Ltd**.\n\n- **Type:** AML\n- **Priority:** HIGH\n- **Status:** OPEN${assignee ? `\n- **Assigned to:** ${assignee}` : ""}\n\nThe case includes the NFIU watchlist hit details, AML screening result (91% confidence), and the CBN compliance trigger for exceeding the ₦5M cross-border threshold.\n\n${assignee ? `I've notified ${assignee}. ` : ""}The 24-hour STR filing deadline is now being tracked. Would you like me to draft the STR?`,
      component: "case_card",
      component_data: newCase,
      actions: ["Draft STR", "Notify compliance team", "Set 24h reminder", "View all cases"],
      memory_used: true,
      memory_summary: "Memory context: Greenfield Commodity Trading Ltd — existing AML case history and NFIU match data retrieved.",
      agent_used: null,
    }
  },

  // Scenario 7: Get billing summary.
  // RETRIEVAL scenario — one Finance tool call. Finance tools are structurally
  // identical to Verification and Fraud tools in the Tool Mesh. Sandra doesn't
  // have a separate "billing mode" — it's all tools. This is intentional:
  // one interface, one interaction model, regardless of what you're looking at.
  show_billing: () => {
    const billing = executeGetBillingSummary()
    const calls: ToolCall[] = [
      {
        tool: "get_billing_summary",
        inputs: { period: "2024-01" },
        output_summary: `January 2024: 4,891 API calls, ₦1,847,500 spend, 68% of plan quota used. Plan: Enterprise.`,
        timing_ms: timing(287, 60),
        category: "Finance",
      },
    ]
    return {
      intent: "RETRIEVAL",
      tool_calls: calls,
      message: `Here's your **January 2024 billing summary** for Prembly:\n\n- **Total API calls:** 4,891\n- **KYC verifications:** 2,341 — your highest volume product\n- **Fraud scans:** 1,893\n- **AML screenings:** 412\n- **Total spend:** ₦1,847,500 (~$2,387.50 USD)\n- **Plan quota used:** 68%\n\nYou're on track to stay within your Enterprise plan limits. At the current run rate, you'll hit ~85% usage by month end with room to spare.`,
      component: "billing_summary",
      component_data: billing,
      actions: ["Download invoice", "View breakdown", "Upgrade plan", "Set usage alert"],
    }
  },

  // Scenario 8: KYB requirements for Kenya.
  // REASONING scenario — Compliance Agent only, jurisdiction KE.
  // Kenya-specific because it uses POCAMLA and CBK regulations, not CBN.
  // The jurisdiction parameter on the tool call is what tells the Compliance
  // Agent which regulatory corpus to query. In production, the agent's RAG
  // system routes the query to jurisdiction-specific document stores.
  kyb_kenya: () => {
    const complianceAnswer = queryComplianceAgent("kyb documents Kenya business", "KE")
    const calls: ToolCall[] = [
      {
        tool: "query_compliance_agent",
        inputs: { question: "What KYB documents does a Kenyan business need for verification?", jurisdictions: "KE" },
        output_summary: "7 required documents identified under POCAMLA 2009 and CBK Prudential Guidelines. Foreign entities require additional registration certificate.",
        timing_ms: timing(1620, 340),
        category: "Agent",
      },
    ]
    return {
      intent: "REASONING",
      tool_calls: calls,
      message: `For **KYB verification of a Kenyan business**, the following documents are required under Kenya's POCAMLA 2009 and CBK guidelines:\n\n1. **Certificate of Incorporation** (Registrar of Companies Kenya)\n2. **Memorandum and Articles of Association**\n3. **Director ID** — certified copies of national ID or passport for each director\n4. **KRA PIN certificate**\n5. **Proof of registered address**\n6. **Beneficial ownership disclosure** — any shareholder >10% equity\n7. **Audited accounts** (last 12 months, if annual turnover exceeds KES 50M)\n\nForeign entities must additionally provide a **Certificate of Registration in Kenya** under the Companies Act (Cap. 486).\n\nConfidence: **91%**`,
      component: "compliance_answer",
      component_data: complianceAnswer,
      actions: ["Send checklist to entity", "Start KYB verification", "Download template", "Set reminder"],
      agent_used: "compliance",
    }
  },

  // Scenario 9: Assign an existing case.
  // ACTION scenario — one Case tool call. The case ID and assignee name are
  // extracted from the message string. This is a minimal form of NLU: if the
  // user says "assign case CM-2024-0091 to Ngozi", Sandra extracts both the
  // case ID and the assignee without needing a form. In production, entity
  // extraction would be done by the orchestration model with higher accuracy
  // than these includes() checks, but the output — { case_id, assignee } —
  // would be identical.
  assign_case: (msg) => {
    const lower = msg.toLowerCase()
    const caseId = lower.includes("cm-2024-0091") ? "CM-2024-0091" : lower.includes("0092") ? "CM-2024-0092" : "CM-2024-0091"
    const assignee = lower.includes("tokunbo") ? "Tokunbo Adeyemi" : lower.includes("ngozi") ? "Ngozi Okonkwo" : "Tokunbo Adeyemi"
    const updatedCase = executeAssignCase(caseId, assignee)
    const calls: ToolCall[] = [
      {
        tool: "assign_case",
        inputs: { case_id: caseId, assignee },
        output_summary: `Case ${caseId} assigned to ${assignee}. Notification sent.`,
        timing_ms: timing(389, 80),
        category: "Case",
      },
    ]
    return {
      intent: "ACTION",
      tool_calls: calls,
      message: `Done. **Case ${caseId}** has been assigned to **${assignee}**.\n\n${assignee} has been notified and the case will appear in their queue immediately. Current status remains OPEN — they'll need to initiate the investigation and update the status.\n\nIs there anything else I should add to the case notes?`,
      component: "case_card",
      component_data: updatedCase,
      actions: ["Add case notes", "Set deadline", "View case", "Notify manager"],
    }
  },

  // Scenario 10: Why was this transaction flagged?
  // REASONING scenario — two tool calls: get_transaction_history (Prembly API)
  // then query_fraud_agent (Fraud Intelligence Agent).
  //
  // This scenario demonstrates Sandra's "explain" capability. The user wants to
  // understand Sandra's reasoning, not take an action. The Fraud Agent is invoked
  // to produce the explanation — not just the label ("velocity anomaly") but
  // the specific signals that led to the classification. This is what separates
  // Sandra from a rules engine: rules tell you IF something is wrong, Sandra
  // tells you WHY and shows its evidence.
  why_flagged: () => {
    const fraudAnalysis = queryFraudAgent("velocity anomaly flagged transaction why 47 transactions")
    const calls: ToolCall[] = [
      {
        tool: "get_transaction_history",
        inputs: { identifier: "22187463901", from_date: "2024-01-15T04:00:00Z", to_date: "2024-01-15T10:00:00Z" },
        output_summary: "47 transactions in 6 hours. Baseline: 3/day. New device 4h prior. 23 unique recipients.",
        timing_ms: timing(867, 160),
        category: "Fraud",
      },
      {
        tool: "query_fraud_agent",
        inputs: { query: "why was transaction TXN-2024-8827361 flagged", entity_ids: "22187463901" },
        output_summary: "Account takeover pattern — velocity burst post device-change. Confidence: 76%.",
        timing_ms: timing(1190, 220),
        category: "Agent",
      },
    ]
    return {
      intent: "REASONING",
      tool_calls: calls,
      message: `This transaction was flagged because it's part of an **anomalous velocity burst** consistent with an **account takeover**.\n\nHere's what I found:\n\n**The normal pattern:** BVN 22187463901 (Adebayo Olamide Fasanya) averages **3 transactions per day** over the past 90 days.\n\n**What happened today:** Between 04:00–10:00 AM, **47 transactions** were completed to 23 unique recipients — a **1,567% deviation** from baseline.\n\n**The smoking gun:** A new device was registered on this account exactly **4 hours before** the transaction burst began. This is the classic signature of an account takeover.\n\nFraud Agent confidence: **76%**. I recommend placing a soft block and challenging the account holder via OTP verification.`,
      component: "fraud_scan_result",
      component_data: executeRunFraudScan(),
      actions: ["Soft block account", "Send OTP challenge", "Open case", "Contact account holder"],
      agent_used: "fraud",
      reasoning_trace: fraudAnalysis.analysis,
    }
  },

  // Scenario 11: SDK usage for January.
  // RETRIEVAL scenario — Finance tool, SDK-specific.
  // Sandra reads SDK telemetry across platforms (Android, iOS, Web) and formats
  // it as a narrative with the key insights called out. Operators shouldn't have
  // to read a raw number table to understand their API performance.
  sdk_usage_january: () => {
    const sdkReport = executeGetSDKReports()
    const calls: ToolCall[] = [
      {
        tool: "get_sdk_reports",
        inputs: { month: "2024-01", platform: "all" },
        output_summary: "January 2024: 165,567 total SDK calls. Android: 84,234. iOS: 51,892. Web: 29,441. Success rate: 98.7%.",
        timing_ms: timing(445, 90),
        category: "Finance",
      },
    ]
    return {
      intent: "RETRIEVAL",
      tool_calls: calls,
      message: `**January 2024 SDK usage report:**\n\n- **Total calls:** 165,567\n- **Android:** 84,234 (51%) — your dominant platform\n- **iOS:** 51,892 (31%)\n- **Web:** 29,441 (18%)\n- **Success rate:** 98.7% ✓\n- **Average latency:** 214ms\n- **Top endpoint:** \`run_kyc_verification\`\n\nPerformance is strong. The 1.3% failure rate is within normal bounds — mostly network timeout errors on the web SDK. Android performance improved 12% over December.`,
      component: "sdk_report",
      component_data: sdkReport,
      actions: ["View error breakdown", "Compare to December", "Export report", "Set latency alert"],
    }
  },

  // Scenario 12: CBN BVN Tier 2 rules.
  // REASONING scenario — Compliance Agent, Nigerian jurisdiction, high specificity.
  // The 97% confidence in the response reflects that the CBN Tiered KYC framework
  // is a well-documented, stable regulation with exact numeric thresholds — not
  // subject to interpretation. High confidence = Sandra can be definitive in its answer.
  cbn_bvn_tier2: () => {
    const complianceAnswer = queryComplianceAgent("CBN rules BVN verification tier 2 accounts", "NG")
    const calls: ToolCall[] = [
      {
        tool: "query_compliance_agent",
        inputs: { question: "What are the CBN rules on BVN verification for tier 2 accounts?", jurisdictions: "NG" },
        output_summary: "Tier 2 BVN requirements identified. Facial match ≥80% required. Max balance ₦500K. Max daily transaction ₦500K.",
        timing_ms: timing(1780, 360),
        category: "Agent",
      },
    ]
    return {
      intent: "REASONING",
      tool_calls: calls,
      message: `**CBN Tier 2 Account — BVN Verification Requirements:**\n\nUnder CBN's Tiered KYC Framework (Revised 2017) and BVN Regulatory Framework:\n\n1. **BVN linkage** — biometric verification against NIBSS records is mandatory\n2. **Government ID** — one valid document (National ID, Passport, Driver's License, or Voter's Card)\n3. **Facial match** — liveness detection required at **≥80% confidence threshold**\n4. **Proof of address** — utility bill, bank statement, or Voter's Card (within 3 months)\n\n**Account limits:**\n- Maximum daily transactions: **₦500,000**\n- Maximum balance: **₦500,000**\n\n**Important:** BVN middle-name discrepancies must be resolved through an NIBSS BVN update process before account activation — you cannot approve around them.\n\nConfidence: **97%**`,
      component: "compliance_answer",
      component_data: complianceAnswer,
      actions: ["Download CBN circular", "Apply to pending queue", "Set verification threshold", "Flag non-compliant items"],
      agent_used: "compliance",
    }
  },

  // Scenario 13: Customer 360 view
  show_customer_360: () => {
    const mockProfile = {
      customer_id: "CUST-88392",
      name: "Greenfield Corp",
      type: "BUSINESS" as const,
      global_risk_score: 82,
      ai_synthesis: "Greenfield Corp shows a high risk score due to a recent AML watchlist hit (Medium Confidence) and 3 suspicious transactions flagged for velocity anomalies in the last 48 hours. Enhanced Due Diligence (EDD) is strongly recommended.",
      products: {
        identity: { status: "GREEN" as const, last_verified: "2023-10-12" },
        background: { status: "AMBER" as const, last_verified: "2023-10-13" },
        fraud: { status: "RED" as const, last_verified: "2023-10-15" },
        txn_monitoring: { status: "RED" as const, last_verified: "2023-10-15" },
        aml: { status: "AMBER" as const, last_verified: "2023-10-14" },
        vault: { status: "GREEN" as const, last_verified: "2023-10-12" },
      }
    }
    const calls: ToolCall[] = [
      {
        tool: "get_customer_360",
        inputs: { customer_id: "CUST-88392" },
        output_summary: "Customer 360 profile retrieved. Global risk score: 82. Products: Identity (GREEN), Fraud (RED).",
        timing_ms: timing(521, 100),
        category: "Verification",
      },
    ]
    return {
      intent: "RETRIEVAL",
      tool_calls: calls,
      message: `Here is the **Customer 360 profile for Greenfield Corp**.\n\nThey currently have a high global risk score of **82**. My synthesis indicates this is primarily driven by a recent AML watchlist hit and recent velocity anomalies flagged by the Fraud Intelligence Agent.\n\nI recommend reviewing their AML screening results and placing a temporary hold on cross-border transactions pending EDD completion.`,
      component: "customer_360",
      component_data: mockProfile,
      actions: ["View AML Hit", "Initiate EDD", "Freeze Account", "Request Docs"],
    }
  },

  // Default scenario: fallback for unrecognized messages.
  // Sandra doesn't error — it shows recent verification activity and explains
  // what it can do. This is the principle of graceful degradation: an unknown
  // message should never result in an empty screen or error toast. It should
  // result in Sandra doing the most useful thing it can with available data.
  default: () => {
    const calls: ToolCall[] = [
      {
        tool: "list_verification_requests",
        inputs: { limit: 10 },
        output_summary: "10 most recent verification requests returned.",
        timing_ms: timing(312, 60),
        category: "Verification",
      },
    ]
    return {
      intent: "RETRIEVAL",
      tool_calls: calls,
      message: `I've retrieved recent verification activity. I can help you with:\n\n- Reviewing the **KYC queue** — "Show pending KYC"\n- Running **AML screening** — "Run AML on [entity name]"\n- Checking **fraud alerts** — "Show fraud alerts"\n- **Compliance questions** — ask me about any regulation\n- **Case management** — "Open a case for [entity]"\n- **Billing & SDK reports**\n\nWhat would you like to investigate?`,
      component: "verification_list",
      component_data: executeListVerificationRequests().slice(0, 10),
      actions: ["Show pending KYC", "Check fraud alerts", "Run AML screening", "View billing"],
    }
  },

  // Scenario 14: Document Verification (Triggered by attachments)
  document_verification: () => {
    const calls: ToolCall[] = [
      {
        tool: "extract_document_data",
        inputs: { file: "uploaded_document", type: "auto-detect" },
        output_summary: "Document type: National ID (NG). Extracted: Name, DOB, ID Number.",
        timing_ms: timing(800, 150),
        category: "Verification",
      },
      {
        tool: "run_identity_verification",
        inputs: { document_type: "National ID", country: "NG" },
        output_summary: "Verification successful. Confidence: 98%. Facial match: Pending liveness check.",
        timing_ms: timing(1200, 200),
        category: "Verification",
      }
    ]
    return {
      intent: "ACTION",
      tool_calls: calls,
      message: `I've analyzed the uploaded document. It appears to be a **Nigerian National ID**.\n\nI successfully extracted the data and ran a verification check against the national database. The verification was **successful** with a 98% confidence score. All text fields match the registry.\n\nThe next required step is a liveness check to ensure the person presenting the ID is the actual owner. Would you like me to send a liveness check request to the user?`,
      actions: ["Send liveness request", "Approve manually", "Request resubmission"],
    }
  },
}

// ── Main simulate function ────────────────────────────────────────────────────

export async function simulateResponse(message: string, hasAttachments?: boolean): Promise<SandraResponse> {
  const intent = hasAttachments ? "ACTION" : routeIntent(message)
  const scenarioId = hasAttachments ? "document_verification" : matchScenario(message)

  // Realistic delay based on intent type
  const delayMs = intent === "REASONING" ? 2200 : intent === "ACTION" ? 1600 : 800
  await delay(delayMs)

  const scenarioFn = scenarios[scenarioId] ?? scenarios.default
  const response = scenarioFn(message)

  return {
    ...response,
    intent,
  }
}

// ── Streaming token generator ─────────────────────────────────────────────────
// Splits a message into word-tokens and yields them with realistic timing.

export function tokenize(message: string): string[] {
  return message.split(/(?<=\s)|(?=\s)/).filter((t) => t.length > 0)
}

// buildSSEStream() is the output layer of Sandra's architecture.
// It takes a fully-assembled SandraResponse and converts it into a sequence
// of Server-Sent Events that drive the real-time UI in ChatWindow.tsx.
//
// THE EVENT ORDERING IS INTENTIONAL AND IMPORTANT:
//
// 1. tool_start / tool_end  — emitted first so the operator can watch Sandra
//    "work" before it speaks. This is transparency by design: you see what
//    Sandra checked before you read what Sandra concluded.
//
// 2. agent_invoked  — emitted after tools and before tokens because agent
//    invocation is still "work happening" not "answer arriving". The
//    AgentStatusBar component listens for this event to update agent status.
//
// 3. memory_used  — emitted before the message so the MemoryIndicator badge
//    appears above Sandra's response, not below it. The badge should be
//    contextualizing the message as it arrives, not appearing after.
//
// 4. token (x N)  — the actual message, word by word. This is the equivalent
//    of the LLM's streaming token output in production.
//
// 5. component  — emitted AFTER the message because structured data should
//    appear as a follow-up to the narrative, not interrupt it. If you see a
//    table before reading Sandra's summary, you miss the context.
//
// 6. done  — final event. ChatWindow uses this to stop the blinking cursor,
//    show the action chips, and mark the message as fully received.
export function buildSSEStream(response: SandraResponse): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      function send(eventType: string, data: unknown) {
        const payload = `data: ${JSON.stringify({ type: eventType, data })}\n\n`
        controller.enqueue(encoder.encode(payload))
      }

      // Step 1: Emit tool calls sequentially with realistic per-tool timing.
      // Each tool gets a tool_start event (Sandra is calling it) and a tool_end
      // event (Sandra got the result). The delay between them simulates real
      // API latency — slower for agent calls (1.5s+), faster for data reads (300ms).
      for (const call of response.tool_calls) {
        send("tool_start", { tool: call.tool, inputs: call.inputs, category: call.category })
        await delay(call.timing_ms)
        send("tool_end", { tool: call.tool, output: call.output_summary, timing_ms: call.timing_ms })
        await delay(100)  // Small gap between tool_end and next tool_start for visual breathing room
      }

      // Step 2: Emit agent_invoked if a specialist agent was part of the tool plan.
      // This is what causes the AgentStatusBar to show "Compliance Agent ACTIVE".
      // The jurisdictions array tells the UI which flags to show in the status bar.
      if (response.agent_used) {
        send("agent_invoked", { agent: response.agent_used, jurisdictions: ["NG", "EU", "KE"] })
        await delay(200)
      }

      // Step 3: Emit memory context if the message references a known entity.
      // This populates the MemoryIndicator badge that appears above Sandra's message.
      if (response.memory_used) {
        send("memory_used", { summary: response.memory_summary })
        await delay(150)
      }

      // Step 4: Stream message tokens word by word.
      // 18ms per token ≈ 55 tokens/second. This feels natural to read without
      // requiring the user to wait. Longer messages stream longer — which feels
      // appropriate because "I have more to say" should take longer to say.
      const tokens = tokenize(response.message)
      for (const token of tokens) {
        send("token", { token })
        await delay(18)
      }

      // Step 5: Emit the structured component payload.
      // This is the inline data table/card that appears below Sandra's message.
      // component_data is the raw data; component is the component type key
      // (e.g. "verification_list", "aml_result") that StructuredResult.tsx uses
      // to decide which React component to render.
      if (response.component && response.component_data) {
        send("component", {
          component: response.component,
          component_data: response.component_data,
          actions: response.actions,
        })
      }

      // Step 6: Done event — ChatWindow uses this to finalize the message:
      // stop the blinking cursor, show action chips, mark isStreaming=false.
      // The metadata (intent, agent_used, memory_used) is used to update the
      // right panel (AgentStatusBar, MemoryIndicator) after the stream ends.
      send("done", {
        intent: response.intent,
        agent_used: response.agent_used,
        memory_used: response.memory_used,
      })
      controller.close()
    },
  })
}
