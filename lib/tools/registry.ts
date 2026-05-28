// Sandra AI — Tool Registry
//
// THE TOOL MESH:
//
// The Tool Registry is Sandra's "Tool Mesh" — the complete catalog of operations
// Sandra can perform. Every tool has four things: a name (used as a function call
// key), a description (used by the orchestration model to decide when to call it),
// a category (used for UI grouping in the Sidebar), and a parameters schema
// (used by the model to construct valid inputs).
//
// WHY DESCRIPTIONS ARE WRITTEN AS IMPERATIVE SENTENCES:
//
// Tool descriptions are not documentation for humans — they're prompts for the
// orchestration model. When the model reads "Screen an entity against AML watchlists",
// it's learning the condition under which this tool should be invoked. Imperative
// sentences work better than noun phrases because they tell the model WHAT TO DO,
// not just what the tool is. "AML screening tool" is ambiguous; "Screen an entity
// against AML watchlists" is actionable. This is a standard pattern in
// OpenAI function-calling, Anthropic tool-use, and Google Vertex tool definitions.
//
// WHY THE TOOL MESH IS A SEPARATE FILE FROM THE EXECUTORS:
//
// The registry defines the interface (what tools exist and what they look like).
// The executors define the implementation (what actually happens when called).
// Separating them means you can change the implementation (swap from mock to real
// Prembly API) without changing what Sandra knows about the tool. In production,
// you would never need to edit the registry when updating the API client.
//
// THE FIVE TOOL CATEGORIES AND WHAT THEY MAP TO:
//
//   Verification  → Prembly Identity APIs (KYC, KYB, AML, Background Check)
//   Fraud         → Prembly Fraud Intelligence APIs (fraud bank, scan, alerts)
//   Case          → Prembly Case Management APIs (create, assign, update, list)
//   Finance       → Prembly Billing and Analytics APIs (billing, SDK, reports)
//   Agent         → Sandra's specialist sub-agents (Compliance, Fraud Intelligence)
//                   Note: Agent tools appear identical to API tools from Sandra's
//                   perspective. The distinction is only in implementation.

import type { Tool } from "@/lib/types"

export const toolRegistry: Tool[] = [
  // ── Verification tools (6) ─────────────────────────────────────────────────
  //
  // These tools wrap Prembly's Identity APIs. In production:
  //   run_kyc_verification  → POST /v2/nigeria/individual (NIBSS/NIMC verification)
  //   get_kyc_result        → GET  /v2/verification/{request_id}
  //   list_verification_requests → GET /v2/verifications?status=PENDING
  //   run_kyb_verification  → POST /v2/nigeria/cac (CAC business registry lookup)
  //   run_aml_screening     → POST /v2/aml/screen (NFIU, OFAC, UN, EU watchlists)
  //   run_background_check  → POST /v2/background (PEP, criminal, adverse media)
  //
  // All six tools share the same pattern: structured input schema, async result,
  // deterministic risk score. Sandra can call any of these in any sequence.
  // The order is determined by the tool plan, not by this registry.
  {
    // Production API: POST /v2/nigeria/individual
    // Sandra calls this to initiate a new KYC verification. The real Prembly API
    // accepts BVN, NIN, Passport, or Driver's License as id_type and returns a
    // request_id that can be polled via get_kyc_result.
    name: "run_kyc_verification",
    description: "Submit an individual KYC verification request against BVN, NIN, or Passport",
    category: "Verification",
    parameters: [
      { name: "full_name", type: "string", description: "Full legal name", required: true },
      { name: "id_type", type: "string", description: "BVN | NIN | PASSPORT | DRIVERS_LICENSE", required: true },
      { name: "id_number", type: "string", description: "ID number", required: true },
      { name: "jurisdiction", type: "string", description: "NG | KE | US | EU", required: true },
    ],
  },
  {
    // Production API: GET /v2/verification/{request_id}
    // Used when Sandra needs to check the current status of an in-flight KYC
    // request. Important for the alert scenario where PEP review is pending.
    name: "get_kyc_result",
    description: "Retrieve a KYC verification result by request ID",
    category: "Verification",
    parameters: [
      { name: "request_id", type: "string", description: "KYC request ID (e.g. KYC-2024-004821)", required: true },
    ],
  },
  {
    // Production API: GET /v2/verifications (with query params)
    // This is the primary tool Sandra uses in the Operations interface. It powers
    // the KYC queue — sorted by risk score, filtered by status. Sandra calls this
    // before surfacing its assessment for each item in the queue.
    name: "list_verification_requests",
    description: "List verification requests with optional filters for status, date range, and risk score",
    category: "Verification",
    parameters: [
      { name: "status", type: "string", description: "PENDING | APPROVED | REJECTED | MANUAL_REVIEW", required: false },
      { name: "limit", type: "number", description: "Max results (default: 50)", required: false },
      { name: "min_risk_score", type: "number", description: "Filter by minimum risk score", required: false },
    ],
  },
  {
    // Production API: POST /v2/nigeria/cac (Nigeria) or equivalent for KE/EU
    // Business verification against the Corporate Affairs Commission (CAC) registry.
    // Sandra invokes this for KYB scenarios and for cross-checking business entities
    // that appear in AML hits or fraud alerts.
    name: "run_kyb_verification",
    description: "Submit a business (KYB) verification request against CAC or business registry",
    category: "Verification",
    parameters: [
      { name: "business_name", type: "string", description: "Registered business name", required: true },
      { name: "registration_number", type: "string", description: "CAC or company registration number", required: true },
      { name: "jurisdiction", type: "string", description: "NG | KE | US | EU", required: true },
      { name: "director_bvn", type: "string", description: "BVN of primary director", required: false },
    ],
  },
  {
    // Production API: POST /v2/aml/screen
    // AML screening checks entity names against multiple watchlists simultaneously:
    // NFIU (Nigeria Financial Intelligence Unit), OFAC, UN Security Council,
    // EU sanctions, and CBN's restricted entities list. Match scoring is fuzzy
    // (87% match on name variation = hit). Sandra invokes this for any entity
    // where the risk score exceeds a threshold or the operator requests it.
    name: "run_aml_screening",
    description: "Screen an entity against AML watchlists (NFIU, OFAC, UN, EU sanctions)",
    category: "Verification",
    parameters: [
      { name: "entity_name", type: "string", description: "Name of individual or business", required: true },
      { name: "entity_type", type: "string", description: "INDIVIDUAL | BUSINESS", required: true },
      { name: "jurisdiction", type: "string", description: "Primary jurisdiction", required: true },
    ],
  },
  {
    // Production API: POST /v2/background
    // Pulls PEP status, criminal records, and adverse media coverage for individuals.
    // Sandra invokes this when a KYC review flags a PEP connection or when the
    // operator asks for a full background check before case escalation.
    name: "run_background_check",
    description: "Run a background check on an individual including criminal, PEP, and adverse media",
    category: "Verification",
    parameters: [
      { name: "full_name", type: "string", description: "Full legal name", required: true },
      { name: "bvn", type: "string", description: "Bank Verification Number", required: false },
      { name: "jurisdiction", type: "string", description: "NG | KE | US | EU", required: true },
    ],
  },

  // ── Fraud tools (7) ───────────────────────────────────────────────────────
  //
  // These tools wrap Prembly's Fraud Intelligence APIs. In production:
  //   query_fraud_bank     → POST /v2/fraud/check (cross-customer fraud intelligence)
  //   run_fraud_scan       → POST /v2/fraud/scan (real-time ML transaction scoring)
  //   get_flagged_alerts   → GET  /v2/alerts (proactive Sandra-generated alerts)
  //   update_alert_status  → PATCH /v2/alerts/{alert_id}
  //   get_transaction_history → GET /v2/transactions/{identifier}
  //   create_rule          → POST /v2/rules (fraud detection rule engine)
  //   update_rule          → PATCH /v2/rules/{rule_id}
  //   get_escalation_configs → GET /v2/escalation-config
  //
  // The fraud bank is Prembly's proprietary cross-customer intelligence database.
  // It knows about BVNs, phone numbers, and accounts that have been flagged
  // across all Prembly customers (anonymized). Sandra uses this before deciding
  // to escalate, because an entity unknown to YOUR system might be known to
  // Prembly's broader network.
  {
    // Production API: POST /v2/fraud/check
    // The fraud bank is the first check Sandra makes when encountering a new entity
    // in a suspicious context. Before running an expensive ML scan, check if this
    // BVN/phone/account is already known to be problematic across the network.
    name: "query_fraud_bank",
    description: "Check BVN, phone number, or account number against Prembly's fraud intelligence bank",
    category: "Fraud",
    parameters: [
      { name: "identifier_type", type: "string", description: "BVN | PHONE | ACCOUNT", required: true },
      { name: "identifier_value", type: "string", description: "The identifier to check", required: true },
    ],
  },
  {
    // Production API: POST /v2/fraud/scan
    // Real-time ML transaction risk scoring. Sandra calls this after query_fraud_bank
    // if the fraud bank doesn't have a definitive answer. The scan runs the full
    // ML pipeline: device fingerprint, velocity check, graph analysis, amount pattern.
    // More expensive than fraud_bank (takes ~900ms vs ~300ms) but more thorough.
    name: "run_fraud_scan",
    description: "Scan a transaction for fraud indicators using real-time ML models",
    category: "Fraud",
    parameters: [
      { name: "transaction_id", type: "string", description: "Transaction reference ID", required: true },
      { name: "amount_ngn", type: "number", description: "Transaction amount in NGN", required: true },
      { name: "sender_account", type: "string", description: "Sender account number", required: true },
      { name: "receiver_account", type: "string", description: "Receiver account number", required: true },
    ],
  },
  {
    // Production API: GET /v2/alerts
    // Sandra generates alerts proactively — not just in response to operator queries.
    // This tool retrieves those proactive alerts. In the Alerts interface, new alerts
    // are injected every 45 seconds to simulate Sandra's continuous monitoring.
    // In production, alerts would be pushed via webhook or SSE notification.
    name: "get_flagged_alerts",
    description: "List all current fraud alerts filtered by severity and status",
    category: "Fraud",
    parameters: [
      { name: "severity", type: "string", description: "CRITICAL | HIGH | MEDIUM | LOW", required: false },
      { name: "status", type: "string", description: "NEW | ACKNOWLEDGED | ESCALATED | RESOLVED", required: false },
      { name: "limit", type: "number", description: "Max results (default: 20)", required: false },
    ],
  },
  {
    // Production API: PATCH /v2/alerts/{alert_id}
    // Allows operators to acknowledge, escalate, or resolve alerts directly through
    // Sandra without leaving the conversational interface. Sandra can call this
    // autonomously when an operator says "acknowledge all medium alerts".
    name: "update_alert_status",
    description: "Update the status of a fraud alert (resolve, escalate, or acknowledge)",
    category: "Fraud",
    parameters: [
      { name: "alert_id", type: "string", description: "Alert ID", required: true },
      { name: "status", type: "string", description: "ACKNOWLEDGED | ESCALATED | RESOLVED", required: true },
      { name: "notes", type: "string", description: "Operator notes", required: false },
    ],
  },
  {
    // Production API: GET /v2/transactions/{identifier}?from=...&to=...
    // Full transaction history lookup, used by Sandra to establish baselines for
    // velocity anomaly analysis. The Fraud Agent needs this raw data before it can
    // classify a pattern. Sandra always calls this before query_fraud_agent in
    // velocity anomaly scenarios.
    name: "get_transaction_history",
    description: "Pull full transaction history for an account or BVN over a date range",
    category: "Fraud",
    parameters: [
      { name: "identifier", type: "string", description: "BVN or account number", required: true },
      { name: "from_date", type: "string", description: "Start date (ISO 8601)", required: false },
      { name: "to_date", type: "string", description: "End date (ISO 8601)", required: false },
    ],
  },
  {
    // Production API: POST /v2/rules
    // Sandra can create new fraud detection rules directly in the Prembly rule engine.
    // This is one of Sandra's ACTION-class capabilities — it modifies live system
    // behavior, not just records. All rule creation actions are logged to the
    // Decision Log and require operator confirmation before execution.
    name: "create_rule",
    description: "Create a new fraud detection rule",
    category: "Fraud",
    parameters: [
      { name: "rule_name", type: "string", description: "Rule name", required: true },
      { name: "condition", type: "string", description: "Rule condition expression", required: true },
      { name: "action", type: "string", description: "BLOCK | FLAG | ESCALATE | NOTIFY", required: true },
    ],
  },
  {
    // Production API: PATCH /v2/rules/{rule_id}
    // Sandra can also modify or disable existing rules. The RULES_BREACH alert
    // scenario demonstrates why this matters: a misconfigured auto-approval rule
    // was firing inappropriately, and Sandra's recommendation was to disable it.
    name: "update_rule",
    description: "Update an existing fraud detection rule",
    category: "Fraud",
    parameters: [
      { name: "rule_id", type: "string", description: "Rule ID", required: true },
      { name: "condition", type: "string", description: "Updated rule condition", required: false },
      { name: "action", type: "string", description: "Updated action", required: false },
      { name: "enabled", type: "boolean", description: "Enable or disable the rule", required: false },
    ],
  },
  {
    // Production API: GET /v2/escalation-config
    // Reads the current escalation routing rules — which teams or individuals get
    // notified for which alert types. Sandra uses this when diagnosing why a
    // particular alert wasn't escalated (see the RULES_BREACH scenario).
    name: "get_escalation_configs",
    description: "Retrieve the current escalation routing configuration",
    category: "Fraud",
    parameters: [],
  },

  // ── Case tools (5) ────────────────────────────────────────────────────────
  //
  // Case management tools wrap Prembly's Case Management APIs. In production:
  //   create_case      → POST /v2/cases
  //   get_case         → GET  /v2/cases/{case_id}
  //   update_case_status → PATCH /v2/cases/{case_id}/status
  //   assign_case      → PATCH /v2/cases/{case_id}/assignee
  //   list_cases       → GET  /v2/cases (with filters)
  //
  // Cases are the audit trail for Sandra's recommendations. Every AML hit, every
  // escalation, every manual review recommendation should result in an open case.
  // Cases persist beyond the session — unlike chat messages, cases are the durable
  // record of what happened and who did what.
  {
    // Production API: POST /v2/cases
    // Sandra auto-populates the case fields from the entity context it has:
    // entity_name from the conversation, entity_id from the prior verification or
    // screening result, type from the scenario type, priority from risk score.
    // The operator only needs to confirm or modify — not fill in forms.
    name: "create_case",
    description: "Open a new compliance or fraud case for an entity",
    category: "Case",
    parameters: [
      { name: "entity_name", type: "string", description: "Entity name", required: true },
      { name: "entity_id", type: "string", description: "Verification or screening ID", required: true },
      { name: "type", type: "string", description: "KYC | AML | FRAUD | COMPLIANCE", required: true },
      { name: "priority", type: "string", description: "LOW | MEDIUM | HIGH | CRITICAL", required: true },
      { name: "notes", type: "string", description: "Initial case notes", required: false },
    ],
  },
  {
    // Production API: GET /v2/cases/{case_id}
    // Sandra uses this to surface existing case context when an entity is mentioned.
    // If Greenfield has 2 open cases, Sandra retrieves them before responding to
    // any new question about Greenfield — so the response is always context-aware.
    name: "get_case",
    description: "Retrieve full case details by case ID",
    category: "Case",
    parameters: [
      { name: "case_id", type: "string", description: "Case ID (e.g. CM-2024-0091)", required: true },
    ],
  },
  {
    // Production API: PATCH /v2/cases/{case_id}/status
    // Sandra can transition case status (OPEN -> IN_REVIEW -> ESCALATED -> CLOSED)
    // without the operator opening a separate case management UI. The status change
    // is logged to the Decision Log as an ACTION intent.
    name: "update_case_status",
    description: "Change the status of an existing case",
    category: "Case",
    parameters: [
      { name: "case_id", type: "string", description: "Case ID", required: true },
      { name: "status", type: "string", description: "OPEN | IN_REVIEW | ESCALATED | CLOSED", required: true },
      { name: "notes", type: "string", description: "Status change notes", required: false },
    ],
  },
  {
    // Production API: PATCH /v2/cases/{case_id}/assignee
    // Assignment is the most common case action in the demo. Sandra can assign
    // cases by name extraction from natural language: "assign the Greenfield case
    // to Tokunbo" maps directly to this tool call with assignee="Tokunbo Adeyemi".
    name: "assign_case",
    description: "Assign a case to a specific reviewer",
    category: "Case",
    parameters: [
      { name: "case_id", type: "string", description: "Case ID", required: true },
      { name: "assignee", type: "string", description: "Reviewer name or ID", required: true },
    ],
  },
  {
    // Production API: GET /v2/cases (with query params)
    // Allows Sandra to pull the full case queue for a team. In the Operations
    // interface, the queue is pre-populated from KYC requests rather than cases,
    // but this tool would be used to show the operator their open case backlog.
    name: "list_cases",
    description: "List cases with optional filters for status, type, and assignee",
    category: "Case",
    parameters: [
      { name: "status", type: "string", description: "OPEN | IN_REVIEW | ESCALATED | CLOSED", required: false },
      { name: "type", type: "string", description: "KYC | AML | FRAUD | COMPLIANCE", required: false },
      { name: "assignee", type: "string", description: "Filter by assignee", required: false },
    ],
  },

  // ── Finance tools (3) ─────────────────────────────────────────────────────
  //
  // Finance tools wrap Prembly's Billing and Analytics APIs. In production:
  //   get_billing_summary → GET /v2/billing/summary?period=YYYY-MM
  //   get_sdk_reports     → GET /v2/sdk/reports?month=YYYY-MM
  //   get_reports         → GET /v2/reports (general analytics)
  //
  // Finance tools exist in the Tool Mesh for a reason: a compliance team should
  // be able to ask Sandra "how many AML screenings did we run this month?" and
  // get a real answer. Finance data also provides context for compliance questions
  // (e.g., if API call volume spikes suddenly, that might indicate a fraud ring
  // is testing the system). Everything belongs in one intelligence layer.
  {
    // Production API: GET /v2/billing/summary
    // Returns aggregated API call counts and spend for the period. Sandra formats
    // this as a narrative with key insights — not just a number dump.
    name: "get_billing_summary",
    description: "Get the billing overview for the current or specified period",
    category: "Finance",
    parameters: [
      { name: "period", type: "string", description: "Period in YYYY-MM format (default: current month)", required: false },
    ],
  },
  {
    // Production API: GET /v2/sdk/reports
    // SDK telemetry broken down by platform (Android, iOS, Web). Sandra uses this
    // to answer questions about API performance — latency, error rates, call volume.
    // Cross-platform breakdown helps identify if a specific SDK version is failing.
    name: "get_sdk_reports",
    description: "Get SDK usage report broken down by platform and endpoint",
    category: "Finance",
    parameters: [
      { name: "month", type: "string", description: "Month in YYYY-MM format", required: true },
      { name: "platform", type: "string", description: "android | ios | web | all", required: false },
    ],
  },
  {
    // Production API: GET /v2/reports
    // General analytics across all Prembly products. Sandra uses this for trend
    // analysis — "how has our fraud detection rate changed since we enabled AML
    // screening?" These cross-product analytics are only meaningful when Sandra
    // can see all the data together.
    name: "get_reports",
    description: "Generate a general analytics report across verification, fraud, and compliance activity",
    category: "Finance",
    parameters: [
      { name: "from_date", type: "string", description: "Start date (ISO 8601)", required: true },
      { name: "to_date", type: "string", description: "End date (ISO 8601)", required: true },
      { name: "report_type", type: "string", description: "verification | fraud | compliance | all", required: true },
    ],
  },

  // ── Agent tools (2) ───────────────────────────────────────────────────────
  //
  // Agent tools are structurally identical to API tools — they appear in the
  // tool_calls array, they have inputs and outputs, they have timing metadata.
  // From Sandra's orchestration perspective, calling the Compliance Agent is
  // indistinguishable from calling a Prembly REST API.
  //
  // The key difference is implementation:
  //   API tools  → HTTP call to Prembly's REST API surface
  //   Agent tools → HTTP call to a separately deployed AI service (RAG pipeline)
  //
  // In production, both types would be registered in the same tool registry
  // with the same schema. The model selects them using the same mechanism.
  // This uniformity is by design — it means you can add new specialized agents
  // (Tax Agent, Licensing Agent) without changing Sandra's core architecture.
  {
    // Production implementation: deployed Compliance Agent service with
    // jurisdiction-aware RAG pipeline over CBN, FATF, EU AMLD, POCAMLA, and
    // other regulatory documents. Returns structured ComplianceAnswer objects.
    // See lib/agents/compliance.ts for the mock implementation and full context.
    name: "query_compliance_agent",
    description: "Invoke the Compliance Agent for multi-jurisdiction regulatory reasoning and guidance",
    category: "Agent",
    parameters: [
      { name: "question", type: "string", description: "The compliance question", required: true },
      { name: "jurisdictions", type: "string", description: "Comma-separated jurisdictions (e.g. NG,EU,KE)", required: true },
      { name: "entity_context", type: "string", description: "Optional entity name for context", required: false },
    ],
  },
  {
    // Production implementation: deployed Fraud Intelligence Agent service with
    // access to Prembly's cross-customer fraud bank. Classifies patterns, produces
    // confidence scores, surfaces evidence chains. Returns FraudAgentResponse objects.
    // See lib/agents/fraud.ts for the mock implementation and full context.
    name: "query_fraud_agent",
    description: "Invoke the Fraud Intelligence Agent for pattern analysis and fraud intelligence",
    category: "Agent",
    parameters: [
      { name: "query", type: "string", description: "The fraud intelligence question", required: true },
      { name: "entity_ids", type: "string", description: "Comma-separated entity IDs or BVNs to analyze", required: false },
    ],
  },
]

// toolsByCategory groups tools by their category string. Used by the Sidebar
// component to render the collapsible Tool Mesh sections. The reduce pattern
// here ensures any new tool category added to the registry automatically appears
// in the Sidebar without any UI code changes — the grouping is entirely data-driven.
export const toolsByCategory = toolRegistry.reduce<Record<string, Tool[]>>((acc, tool) => {
  if (!acc[tool.category]) acc[tool.category] = []
  acc[tool.category].push(tool)
  return acc
}, {})

// getToolByName() is used by the ToolCallTrace component to look up full tool
// metadata when rendering a tool call event from the SSE stream. The trace
// shows the tool's category color based on this lookup.
export function getToolByName(name: string): Tool | undefined {
  return toolRegistry.find((t) => t.name === name)
}

export const totalToolCount = toolRegistry.length
