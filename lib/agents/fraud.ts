// ── Sandra AI — Fraud Intelligence Agent Mock ─────────────────────────────────
//
// WHAT THIS IS IN THE SANDRA ARCHITECTURE:
//
// The Fraud Intelligence Agent is Sandra's second specialist sub-agent.
// Structurally, it is identical to the Compliance Agent from Sandra's
// perspective — it receives a query, returns a structured response,
// and appears in the tool call trace as category "Agent". Sandra does not
// treat it differently. The distinction is purely semantic: what you ask it
// and what it knows.
//
// Compliance Agent → "What does the regulation require?"
// Fraud Intelligence Agent → "What pattern does this data reveal?"
//
// HOW IT WORKS IN PRODUCTION:
//
// In production, the Fraud Intelligence Agent is a deployed service that
// sits on top of Prembly's fraud bank — a continuously updated database of
// flagged BVNs, device fingerprints, phone numbers, and transaction patterns
// collected across all Prembly customers (with consent and anonymization).
//
// The agent's job is to take raw signals (BVN X has 47 transactions in 6 hours,
// device changed 4 hours prior) and classify them into named fraud patterns with
// confidence scores and evidence chains. This is the difference between Sandra
// saying "this looks unusual" and Sandra saying "this is a velocity burst
// post-device-change consistent with account takeover — 76% confidence".
//
// The named pattern is important. It maps directly to a remediation playbook:
//   - Ring Fraud → BLOCK_ALL_ACCOUNTS_FILE_STR_CONTACT_NFIU
//   - Account Takeover → SOFT_BLOCK_AND_TRIGGER_OTP_CHALLENGE
//   - Structuring → ENHANCED_MONITORING_AND_STR
//
// WHY THE FRAUD AGENT IS INVOKED AFTER PREMBLY API TOOLS, NOT BEFORE:
//
// Sandra runs the Prembly fraud scan tool first (run_fraud_scan, query_fraud_bank)
// to get raw signals. The Fraud Agent is invoked second to INTERPRET those signals.
// You don't ask the interpreter to work without data. This sequencing is baked
// into the tool plans in mock-engine.ts — you'll see the Prembly tools always
// precede the Agent tool call in every fraud scenario's tool_calls array.
//
// WHY TWO SCENARIOS (vs. Compliance Agent's 4):
//
// Fraud patterns cluster into a smaller number of high-confidence archetypes
// than regulatory questions do. In the Nigerian fintech context, the two patterns
// that cause the most financial harm at scale are:
//   1. Coordinated ring fraud (mule account layering)
//   2. Account takeover via velocity burst
// Starting with these two covers the majority of demo-relevant scenarios.
// The default handles anything else.

export interface FraudAgentResponse {
  analysis: string
  pattern_type: string
  confidence: number
  evidence: string[]
  recommended_action: string
  related_entities: string[]
}

type FraudScenario = "ring_fraud" | "velocity_anomaly" | "default"

// Scenario detector. In production this would be an embedding-based classifier
// that maps incoming query text + entity signals to a named fraud pattern.
// The keyword approach here is a faithful approximation of that output for the
// purposes of the demo — it routes to the same pre-scripted responses that a
// real classifier would produce for these exact scenarios.
function detectFraudScenario(query: string): FraudScenario {
  const lower = query.toLowerCase()
  if (lower.includes("coordinated") || lower.includes("ring") || lower.includes("bvn prefix") || lower.includes("mule")) {
    return "ring_fraud"
  }
  if (lower.includes("velocity") || lower.includes("47 transaction") || lower.includes("flagged") || lower.includes("why")) {
    return "velocity_anomaly"
  }
  return "default"
}

const scenarios: Record<FraudScenario, FraudAgentResponse> = {
  // Ring fraud: coordinated layering via mule accounts.
  // This is the most severe pattern in this demo — three accounts acting in
  // concert to cycle ₦12.4M. The evidence array is structured to mirror what
  // a real fraud agent would surface: each item is an independently verifiable
  // signal, not an inference. Sandra's role is to surface these signals and
  // let the operator decide — not to take autonomous action. The recommended
  // action is BLOCK, but it's advisory until the operator confirms it.
  ring_fraud: {
    analysis:
      "Analysis of the three accounts (BVN prefix 22187463) reveals a textbook ring fraud pattern. The accounts were created within 72 hours of each other, all share the same mobile device class, and have transacted exclusively with each other and a fourth unverified account. The uniform transfer amount of ₦261,000 is consistent with structuring behavior designed to stay below automated alert thresholds. All three accounts received funds from external sources totaling ₦12.4M before the internal cycling began — classic layering through mule accounts.",
    pattern_type: "Ring Fraud — Layering via Mule Accounts",
    confidence: 0.89,
    evidence: [
      "3 accounts created within 72-hour window",
      "Shared mobile device class across all 3 accounts",
      "47 transfers at uniform ₦261,000 — below ₦300,000 alert threshold",
      "All recipient accounts are first-degree connections of each other",
      "External inflow of ₦12.4M preceded internal cycling",
      "BVN 22187463901 previously flagged in 2023-Q3 for mule activity",
    ],
    recommended_action: "BLOCK_ALL_ACCOUNTS_FILE_STR_CONTACT_NFIU",
    related_entities: ["BVN 22187463901", "BVN 22187463902", "BVN 22187463904"],
  },

  // Velocity anomaly: account takeover via post-device-change burst.
  // Lower confidence (76%) than ring fraud (89%) because velocity anomalies
  // can have legitimate explanations — a business owner sending payroll to
  // many employees at once would look identical. The lower confidence is a
  // signal to Sandra to recommend a soft block and OTP challenge rather than
  // an immediate hard block. If the account holder responds to the OTP, the
  // block is lifted. If not, it escalates. This graduated response is baked
  // into the recommended_action string.
  velocity_anomaly: {
    analysis:
      "Transaction TXN-2024-8827361 was flagged for velocity anomaly. BVN 22187463901 (Adebayo Olamide Fasanya) has a 90-day historical average of 3 transactions per day. Between 04:00 and 10:00 AM today, 47 transactions were completed — a 1,567% deviation from baseline. The transactions do not follow any recognizable commercial pattern: varied recipients, no recurring amounts, and all transfers initiated from a new device registered 4 hours prior to the burst. This is most consistent with an account takeover scenario where a fraudster gained access and is rapidly draining and distributing funds.",
    pattern_type: "Account Takeover — Velocity Burst Post-Device-Change",
    confidence: 0.76,
    evidence: [
      "47 transactions vs. daily average of 3 (1,567% deviation)",
      "New device registered 4 hours before transaction burst",
      "Transfers to 23 unique recipients — no prior relationship",
      "Amounts range ₦5,000–₦48,000 — inconsistent with profile",
      "All transactions between 04:00 and 10:00 AM (off-profile hours)",
    ],
    recommended_action: "SOFT_BLOCK_AND_TRIGGER_OTP_CHALLENGE_TO_ACCOUNT_HOLDER",
    related_entities: ["BVN 22187463901", "KYC-2024-004821"],
  },

  // Default: unclassified anomaly. The Fraud Agent returns a conservative
  // MANUAL_REVIEW recommendation when it cannot confidently classify the
  // pattern. This is intentional — it's safer to under-call fraud than to
  // over-call it, because false positives block legitimate customer accounts.
  // The 61% confidence is below the threshold that would warrant autonomous action.
  default: {
    analysis:
      "Fraud pattern analysis is running. Based on available signals, there are indicators of anomalous activity but the pattern has not been definitively classified. Recommend pulling full transaction history and running a BVN cross-check before taking action.",
    pattern_type: "Unclassified Anomaly",
    confidence: 0.61,
    evidence: ["Anomalous activity signals detected", "Cross-reference with fraud bank recommended"],
    recommended_action: "MANUAL_REVIEW",
    related_entities: [],
  },
}

// The public interface. Sandra always passes the raw operator query string —
// not a pre-processed summary. The agent is responsible for understanding
// what it's being asked. In production, this call would include the entity's
// full transaction history and BVN signals as additional context parameters.
export function queryFraudAgent(query: string): FraudAgentResponse {
  const scenario = detectFraudScenario(query)
  return scenarios[scenario]
}
