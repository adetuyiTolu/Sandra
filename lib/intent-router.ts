// ── Sandra AI — Intent Router ─────────────────────────────────────────────────
//
// WHY THIS FILE EXISTS BEFORE TOOL SELECTION:
//
// In a production AI system, every token you feed to a model costs money and
// adds latency. If Sandra received "show pending KYC" and passed that raw string
// directly to a model to decide which tool to call, you'd spend ~300ms and
// ~0.01 USD per message just on tool selection — before any real work happens.
//
// Intent classification is a cheap O(1) string-match gate that runs first and
// tells Sandra *how to think* before it decides *what to do*. The three intents
// (REASONING, ACTION, RETRIEVAL) map directly to different cognitive modes:
//
//   REASONING  → Sandra will call an Agent (Compliance or Fraud), synthesize
//                multi-source information, and return a structured answer with
//                regulatory citations. Expensive. Warrants 2.2s delay to simulate
//                the model actually thinking.
//
//   ACTION     → Sandra will modify state: create a case, assign a reviewer,
//                block an account. These calls have side effects and need to be
//                logged to the Decision Log. Warrants 1.6s delay.
//
//   RETRIEVAL  → Sandra is fetching and displaying existing data. Read-only.
//                Fastest. Warrants 0.8s delay.
//
// Skipping intent classification would mean:
//   1. Every message goes to the model for tool selection → 3x more LLM calls.
//   2. You lose the ability to route REASONING queries exclusively to specialist
//      agents — the model might try to answer a compliance question from its
//      training data instead of the Compliance Agent (hallucination risk).
//   3. You can't differentiate audit logging for ACTION vs. RETRIEVAL — which
//      matters for regulatory record-keeping.
//
// The order of checks below is intentional: REASONING first (most specific,
// most expensive to get wrong), then ACTION (has side effects), then RETRIEVAL
// (safe default). This mirrors the OODA loop: Observe → Orient → Decide → Act.

import type { Intent } from "@/lib/types"

export function routeIntent(message: string): Intent {
  const lower = message.toLowerCase()

  // REASONING keywords (checked first — these are the most specific and the
  // most expensive to misclassify, because REASONING triggers agent invocation).
  // If a user asks "is it legal for a Nigerian business to receive EU payments"
  // and we classify it as RETRIEVAL, Sandra would just return a list of KYC
  // requests instead of invoking the Compliance Agent. That's a complete failure.
  if (
    lower.includes("compliant") ||
    lower.includes("is it legal") ||
    lower.includes("regulation") ||
    lower.includes("allowed") ||
    lower.includes("why was") ||
    lower.includes("why is") ||
    lower.includes("pattern") ||
    lower.includes("should") ||
    lower.includes("what are the") ||
    lower.includes("explain") ||
    lower.includes("kyb documents") ||
    lower.includes("cbn rules") ||
    lower.includes("eu customer") ||
    lower.includes("eu payment")
  ) {
    return "REASONING"
  }

  // ACTION keywords (checked second — these trigger state changes and must be
  // distinguished from reads). "Run AML on Greenfield" is an ACTION because
  // it invokes the AML tool which logs to the Decision Log and may trigger
  // downstream compliance obligations. If misclassified as RETRIEVAL, Sandra
  // would just show a list — not run the screening.
  if (
    lower.includes("run ") ||
    lower.includes("submit") ||
    lower.includes("create") ||
    lower.includes("approve") ||
    lower.includes("escalate") ||
    lower.includes("assign") ||
    lower.includes("open a case") ||
    lower.includes("flag") ||
    lower.includes("resolve") ||
    lower.includes("dismiss")
  ) {
    return "ACTION"
  }

  // RETRIEVAL keywords (safe default — read-only operations). In production,
  // RETRIEVAL is the only intent type that could be safely cached. REASONING
  // and ACTION are always fresh because they may depend on entity state that
  // changed since the last request.
  if (
    lower.includes("show") ||
    lower.includes("list") ||
    lower.includes("get") ||
    lower.includes("how many") ||
    lower.includes("find") ||
    lower.includes("view") ||
    lower.includes("billing") ||
    lower.includes("sdk") ||
    lower.includes("alerts") ||
    lower.includes("pending") ||
    lower.includes("360") ||
    lower.includes("profile")
  ) {
    return "RETRIEVAL"
  }

  // Default to RETRIEVAL — the safest fallback because it has no side effects.
  // In production, unknown-intent messages would go to the model with the full
  // tool list and let it decide. Here we gracefully degrade to a helpful default.
  return "RETRIEVAL"
}

// ── Scenario matcher ──────────────────────────────────────────────────────────
//
// WHY A SEPARATE MATCHER FROM routeIntent():
//
// routeIntent() answers "HOW should Sandra think?" (cognitive mode).
// matchScenario() answers "WHAT specific workflow should Sandra run?" (tool plan).
//
// These are deliberately separate because in production they'd be implemented
// differently: routeIntent() would be a fast classifier model (or regex), while
// matchScenario() would be a retrieval step where Sandra selects from its tool
// plan library. Keeping them separate means you can swap either implementation
// without touching the other.
//
// The 12 scenario IDs below are the fixed demo scenarios. In production, Sandra
// wouldn't have a fixed list — it would dynamically construct a tool plan from
// the intent + the tool registry + entity context. But the *structure* of the
// output (a named scenario that maps to a specific tool sequence) would be identical.

export type ScenarioId =
  | "show_pending_kyc"
  | "run_aml_greenfield"
  | "eu_ng_payment_legality"
  | "show_fraud_alerts"
  | "run_fraud_scan"
  | "open_case_greenfield"
  | "show_billing"
  | "kyb_kenya"
  | "assign_case"
  | "why_flagged"
  | "sdk_usage_january"
  | "cbn_bvn_tier2"
  | "show_customer_360"
  | "default"

export function matchScenario(message: string): ScenarioId {
  const lower = message.toLowerCase()

  if ((lower.includes("pending") && lower.includes("kyc")) || lower.includes("show pending")) {
    return "show_pending_kyc"
  }
  if (lower.includes("aml") && (lower.includes("greenfield") || lower.includes("green field"))) {
    return "run_aml_greenfield"
  }
  if (lower.includes("legal") && (lower.includes("eu") || lower.includes("european")) && lower.includes("nigerian")) {
    return "eu_ng_payment_legality"
  }
  if (lower.includes("eu") && lower.includes("payment") && (lower.includes("legal") || lower.includes("nigerian"))) {
    return "eu_ng_payment_legality"
  }
  if ((lower.includes("fraud") && lower.includes("alert")) || lower.includes("show fraud")) {
    return "show_fraud_alerts"
  }
  if (lower.includes("fraud scan") || (lower.includes("run") && lower.includes("fraud"))) {
    return "run_fraud_scan"
  }
  if ((lower.includes("open") || lower.includes("create")) && lower.includes("case") && lower.includes("greenfield")) {
    return "open_case_greenfield"
  }
  if (lower.includes("billing") || lower.includes("invoice") || lower.includes("spend")) {
    return "show_billing"
  }
  if (lower.includes("kyb") && lower.includes("kenya")) {
    return "kyb_kenya"
  }
  if (lower.includes("assign") && lower.includes("case")) {
    return "assign_case"
  }
  if (lower.includes("why") && (lower.includes("flagged") || lower.includes("transaction"))) {
    return "why_flagged"
  }
  if (lower.includes("sdk") && (lower.includes("january") || lower.includes("jan") || lower.includes("usage"))) {
    return "sdk_usage_january"
  }
  if (lower.includes("cbn") || (lower.includes("bvn") && lower.includes("tier"))) {
    return "cbn_bvn_tier2"
  }
  if (lower.includes("360") && (lower.includes("profile") || lower.includes("customer") || lower.includes("greenfield"))) {
    return "show_customer_360"
  }

  // Default: Sandra falls back to a helpful retrieval response that shows the
  // most recent verification activity. This is the equivalent of a model saying
  // "I'm not sure what you want — here's what I can see" rather than erroring.
  return "default"
}

