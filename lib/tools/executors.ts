// Sandra AI — Mock Tool Executors
//
// THE ORCHESTRATION BOUNDARY:
//
// This file represents the boundary between Sandra's orchestration layer and
// Prembly's existing API surface. Each executor function is a mock implementation
// of a Prembly API call. In production, every function in this file would be
// replaced by an authenticated HTTP request to the real Prembly API.
//
// The function signatures are identical in both cases:
//   mock:       executeRunAMLScreening(entityName: string): AMLResult
//   production: executeRunAMLScreening(entityName: string): Promise<AMLResult>
//                 which internally does: fetch("https://api.prembly.com/v2/aml/screen", { ... })
//
// The return types are also identical — the mock data is shaped exactly as the
// real Prembly API returns it. This means swapping from mock to production is
// purely a matter of replacing the function body, not the interface.
//
// WHY ALL DATA IS STATIC AND DETERMINISTIC:
//
// Every piece of data in this file — every BVN, every name, every risk score,
// every timestamp — is hard-coded. No Math.random(). No Date.now() for static
// fields. This is deliberate:
//
//   1. Reproducibility: Investors watching the demo on different days see the same
//      data. There are no "it looked different last time" moments.
//   2. Consistency: If Emeka's risk score is 88 in the KYC queue, it's 88 in the
//      fraud alert, 88 in the case, and 88 in the chat response. Everything coheres.
//   3. No hydration mismatches: Next.js SSR would catch any client/server data
//      divergence immediately if we used random values.
//
// The only dynamic values are `created_at` and `updated_at` fields in functions
// like executeCreateCase() — these intentionally use new Date() because they
// represent real-time actions taken during the demo session.

import type {
  KYCRequest,
  AMLResult,
  FraudAlert,
  FraudScanResult,
  Case,
  BillingData,
  SDKReport,
} from "@/lib/types"

// ── KYC Requests (14 entries) ────────────────────────────────────────────────

export const kycRequests: KYCRequest[] = [
  {
    request_id: "KYC-2024-004821",
    full_name: "Adebayo Olamide Fasanya",
    id_type: "BVN",
    id_number: "22187463901",
    status: "PENDING",
    risk_score: 72,
    risk_flags: ["ID mismatch on middle name", "Address unverifiable"],
    submitted_at: "2024-01-15T09:23:00Z",
    ai_recommendation: "MANUAL_REVIEW",
    ai_summary: "Middle name on BVN record differs from submitted name. Residential address could not be confirmed against NIBSS data. Manual review required before approval.",
    jurisdiction: "NG",
  },
  {
    request_id: "KYC-2024-004822",
    full_name: "Chiamaka Ngozi Okafor",
    id_type: "NIN",
    id_number: "57291837462",
    status: "APPROVED",
    risk_score: 14,
    risk_flags: [],
    submitted_at: "2024-01-15T08:11:00Z",
    ai_recommendation: "APPROVE",
    ai_summary: "All identity fields verified against NIMC database. No fraud signals or watchlist matches detected. Low risk profile.",
    jurisdiction: "NG",
  },
  {
    request_id: "KYC-2024-004823",
    full_name: "Emeka Chukwuemeka Nwosu",
    id_type: "BVN",
    id_number: "33841927560",
    status: "PENDING",
    risk_score: 88,
    risk_flags: ["BVN linked to 3 flagged accounts", "Recent device change", "New SIM card registered 4 days ago"],
    submitted_at: "2024-01-15T10:44:00Z",
    ai_recommendation: "ESCALATE",
    ai_summary: "BVN 33841927560 is associated with 3 accounts previously flagged for mule activity. Recent SIM swap and device fingerprint change are consistent with account takeover pattern. Immediate escalation to fraud team recommended.",
    jurisdiction: "NG",
  },
  {
    request_id: "KYC-2024-004824",
    full_name: "Aisha Bello Musa",
    id_type: "NIN",
    id_number: "81726354901",
    status: "PENDING",
    risk_score: 41,
    risk_flags: ["PEP relative match — uncle is listed official"],
    submitted_at: "2024-01-15T07:58:00Z",
    ai_recommendation: "MANUAL_REVIEW",
    ai_summary: "Applicant's uncle, Mallam Suleiman Bello, is a listed Tier-2 PEP (state official). Enhanced Due Diligence recommended before account activation.",
    jurisdiction: "NG",
  },
  {
    request_id: "KYC-2024-004825",
    full_name: "Oluwafemi Adeyemi Rasheed",
    id_type: "BVN",
    id_number: "11934820571",
    status: "APPROVED",
    risk_score: 8,
    risk_flags: [],
    submitted_at: "2024-01-15T06:30:00Z",
    ai_recommendation: "APPROVE",
    ai_summary: "Clean identity verification. NIBSS and NIMC records consistent with submitted data. No adverse signals.",
    jurisdiction: "NG",
  },
  {
    request_id: "KYC-2024-004826",
    full_name: "Fatimah Yusuf Abdullahi",
    id_type: "PASSPORT",
    id_number: "A98721340",
    status: "PENDING",
    risk_score: 56,
    risk_flags: ["Passport expiry in 3 months", "Address in high-risk LGA"],
    submitted_at: "2024-01-15T11:02:00Z",
    ai_recommendation: "MANUAL_REVIEW",
    ai_summary: "Passport expires in 3 months — may require renewal for Tier 3 account. Residential address falls within a flagged LGA. Review and confirm address through secondary verification.",
    jurisdiction: "NG",
  },
  {
    request_id: "KYC-2024-004827",
    full_name: "Obinna Ike Ezechukwu",
    id_type: "BVN",
    id_number: "44723198065",
    status: "REJECTED",
    risk_score: 95,
    risk_flags: ["Synthetic identity indicators", "Name appears on NFIU list", "4 BVNs submitted under same phone number"],
    submitted_at: "2024-01-14T17:35:00Z",
    ai_recommendation: "REJECT",
    ai_summary: "Multiple synthetic identity signals detected. The submitted BVN has been associated with 4 different names across active verification attempts. NFIU watchlist match confirmed. Reject and file STR.",
    jurisdiction: "NG",
  },
  {
    request_id: "KYC-2024-004828",
    full_name: "Taiwo Olabisi Adeniyi",
    id_type: "BVN",
    id_number: "66512840392",
    status: "APPROVED",
    risk_score: 22,
    risk_flags: [],
    submitted_at: "2024-01-15T09:50:00Z",
    ai_recommendation: "APPROVE",
    ai_summary: "Biometric match confirmed. All NIBSS fields align with submitted data. Transaction history shows consistent salary credit pattern. Approve for Tier 2.",
    jurisdiction: "NG",
  },
  {
    request_id: "KYC-2024-004829",
    full_name: "Brian Otieno Achieng",
    id_type: "NIN",
    id_number: "29837465012",
    status: "PENDING",
    risk_score: 35,
    risk_flags: ["Name partially matched on Kenyan assets registry"],
    submitted_at: "2024-01-15T08:40:00Z",
    ai_recommendation: "MANUAL_REVIEW",
    ai_summary: "Applicant name partially matches an entry in Kenya's public assets registry. Confirm beneficial ownership and source of funds before approving.",
    jurisdiction: "KE",
  },
  {
    request_id: "KYC-2024-004830",
    full_name: "Kemi Olusanya Adeyemo",
    id_type: "DRIVERS_LICENSE",
    id_number: "FCT-9841023-00",
    status: "PENDING",
    risk_score: 49,
    risk_flags: ["Document authenticity scan inconclusive", "Liveness check retried twice"],
    submitted_at: "2024-01-15T10:15:00Z",
    ai_recommendation: "MANUAL_REVIEW",
    ai_summary: "Driver's license OCR flagged low document confidence score (68%). Liveness check passed on third attempt. Manual document review recommended.",
    jurisdiction: "NG",
  },
  {
    request_id: "KYC-2024-004831",
    full_name: "Ngozi Adaeze Obiechina",
    id_type: "BVN",
    id_number: "55291840723",
    status: "APPROVED",
    risk_score: 12,
    risk_flags: [],
    submitted_at: "2024-01-15T07:20:00Z",
    ai_recommendation: "APPROVE",
    ai_summary: "Strong identity match across all data sources. Clean fraud profile. Approve.",
    jurisdiction: "NG",
  },
  {
    request_id: "KYC-2024-004832",
    full_name: "Yusuf Garba Tanko",
    id_type: "NIN",
    id_number: "73918264053",
    status: "PENDING",
    risk_score: 63,
    risk_flags: ["Facial match confidence below threshold (74%)", "Multiple failed attempts on other platforms"],
    submitted_at: "2024-01-15T12:10:00Z",
    ai_recommendation: "MANUAL_REVIEW",
    ai_summary: "Facial recognition confidence at 74% (threshold: 80%). Three failed KYC attempts on other Prembly customers detected in the past 30 days. Recommend human liveness check.",
    jurisdiction: "NG",
  },
  {
    request_id: "KYC-2024-004833",
    full_name: "Adunola Folake Babatunde",
    id_type: "BVN",
    id_number: "99012837465",
    status: "IN_PROGRESS",
    risk_score: 31,
    risk_flags: [],
    submitted_at: "2024-01-15T12:55:00Z",
    ai_recommendation: "APPROVE",
    ai_summary: "Verification in progress. Initial signals clean. Expected to auto-approve on completion.",
    jurisdiction: "NG",
  },
  {
    request_id: "KYC-2024-004834",
    full_name: "Mohammed Abdullahi Suleiman",
    id_type: "BVN",
    id_number: "77384920164",
    status: "PENDING",
    risk_score: 79,
    risk_flags: ["Cross-border transaction velocity anomaly", "IP address from sanctioned region", "New device — no prior login history"],
    submitted_at: "2024-01-15T13:20:00Z",
    ai_recommendation: "ESCALATE",
    ai_summary: "Applicant has initiated 18 cross-border transactions in the past 10 days from an IP address associated with a sanctioned jurisdiction. Device is unrecognized. Escalate to compliance immediately.",
    jurisdiction: "NG",
  },
]

// ── AML Result (Greenfield) ────────────────────────────────────────────────────

export const greenfieldAMLResult: AMLResult = {
  entity_name: "Greenfield Commodity Trading Ltd",
  jurisdiction: "NG",
  screening_id: "AML-2024-001923",
  status: "HIT",
  matches: [
    {
      list: "NFIU Watchlist",
      match_score: 0.91,
      matched_name: "Greenfield Commodities Trading Limited",
      reason: "Name variation match — potential alias",
    },
    {
      list: "CBN Restricted Entities",
      match_score: 0.73,
      matched_name: "Greenfield Commodity Traders NG",
      reason: "Partial name match — same registration address",
    },
  ],
  recommended_action: "ESCALATE_TO_COMPLIANCE",
  compliance_agent_invoked: true,
  screened_at: "2024-01-15T14:02:00Z",
}

// Fraud Alerts (8 pre-existing + 5 additional for auto-inject)
//
// The 8 pre-existing alerts represent Sandra's proactive monitoring output —
// what it has already found before any operator asks. Each alert has:
//   - what_detected: the narrative explanation of what Sandra found
//   - what_checked: the tool calls Sandra made to investigate (mirrors the ToolCallTrace format)
//   - regulatory_context: the specific regulation that makes this alert actionable
//   - recommendation: the specific action the operator should take
//
// This is the key difference between Sandra and a rules engine. A rules engine
// says: "Transaction > ₦5M from EU: FLAG". Sandra says: "Greenfield received
// ₦6.2M from Hollander Trade GmbH, here's what I checked, here's what CBN
// Section 14.3 requires, here's exactly what you need to do."
//
// The injectableAlerts array (at the bottom of this file) contains 5 additional
// alerts designed to be injected one at a time into the Alerts page to simulate
// Sandra discovering new issues in real time.

export const fraudAlerts: FraudAlert[] = [
  {
    alert_id: "ALT-2024-00091",
    type: "FRAUD_PATTERN",
    entity_name: "Multiple Linked Accounts",
    entity_id: "BVN-GROUP-221",
    description: "3 accounts sharing BVN prefix and transacting in coordinated pattern. Fraud Agent confidence: 89%.",
    severity: "CRITICAL",
    source_agent: "Fraud Intelligence Agent",
    status: "NEW",
    created_at: "2024-01-15T13:47:00Z",
    fraud_agent_confidence: 0.89,
    related_entities: ["BVN 22187463901", "BVN 22187463902", "BVN 22187463904"],
    what_detected: "Three accounts sharing the same BVN prefix (22187463) completed 47 coordinated transfers totaling ₦12,400,000 within a 90-minute window. Transfer amounts are suspiciously consistent (₦261,000 each) and recipients are first-generation connections of each other.",
    what_checked: [
      { tool: "query_fraud_bank", inputs: { identifier_type: "BVN", identifier_value: "22187463901" }, output_summary: "BVN previously flagged — mule activity 2023-Q3", timing_ms: 312, category: "Fraud" },
      { tool: "get_transaction_history", inputs: { identifier: "22187463901", from_date: "2024-01-15T12:00:00Z" }, output_summary: "47 transactions, avg ₦261,000, uniform timing pattern", timing_ms: 891, category: "Fraud" },
      { tool: "query_fraud_agent", inputs: { query: "coordinated BVN transfer pattern analysis" }, output_summary: "Ring fraud pattern detected. Confidence: 89%", timing_ms: 1240, category: "Agent" },
    ],
    regulatory_context: "Under CBN's Circulars on AML/CFT (2022), coordinated layering activity of this type must be reported to NFIU within 24 hours via a Suspicious Transaction Report.",
    recommendation: "BLOCK_ALL_THREE_ACCOUNTS_AND_FILE_STR",
  },
  {
    alert_id: "ALT-2024-00092",
    type: "COMPLIANCE_TRIGGER",
    entity_name: "Greenfield Commodity Trading Ltd",
    entity_id: "KYB-2024-001101",
    description: "Greenfield Commodity Trading Ltd has exceeded CBN cross-border threshold. EDD required within 48 hours.",
    severity: "HIGH",
    source_agent: "Compliance Agent",
    status: "NEW",
    created_at: "2024-01-15T12:30:00Z",
    related_entities: ["Greenfield Commodities Trading Limited", "AML-2024-001923"],
    what_detected: "Greenfield Commodity Trading Ltd received ₦6,200,000 from a single EU counterpart (Hollander Trade GmbH, Germany) within a 30-day window, exceeding the CBN AML/CFT Regulation 2022 Section 14.3 threshold of ₦5,000,000.",
    what_checked: [
      { tool: "get_transaction_history", inputs: { identifier: "KYB-2024-001101" }, output_summary: "₦6.2M received from EU counterpart in 30 days", timing_ms: 756, category: "Fraud" },
      { tool: "run_aml_screening", inputs: { entity_name: "Greenfield Commodity Trading Ltd", entity_type: "BUSINESS", jurisdiction: "NG" }, output_summary: "NFIU watchlist hit — score 0.91", timing_ms: 1102, category: "Verification" },
      { tool: "query_compliance_agent", inputs: { question: "CBN cross-border threshold exceeded", jurisdictions: "NG,EU" }, output_summary: "EDD required, STR filing mandatory", timing_ms: 1580, category: "Agent" },
    ],
    regulatory_context: "CBN AML/CFT Regulations 2022, Section 14.3 requires Enhanced Due Diligence and potential STR filing when a single EU counterpart exceeds ₦5,000,000 in a 30-day period.",
    recommendation: "INITIATE_EDD_AND_FILE_STR_WITHIN_48H",
  },
  {
    alert_id: "ALT-2024-00093",
    type: "AML_HIT",
    entity_name: "Database — 2 Matched Entities",
    entity_id: "NFIU-UPDATE-20240115",
    description: "New NFIU watchlist update matched 2 existing verified entities in your database.",
    severity: "HIGH",
    source_agent: "Compliance Agent",
    status: "NEW",
    created_at: "2024-01-15T11:00:00Z",
    related_entities: ["Emeka Chukwuemeka Nwosu", "Obinna Ike Ezechukwu"],
    what_detected: "NFIU published a watchlist update at 10:47 AM containing 847 new entries. Sandra ran a retrospective match against the verified entity database and found 2 previously-approved entities now present on the updated list.",
    what_checked: [
      { tool: "list_verification_requests", inputs: { status: "APPROVED" }, output_summary: "2,341 approved entities returned", timing_ms: 432, category: "Verification" },
      { tool: "run_aml_screening", inputs: { entity_name: "database_batch_scan", entity_type: "INDIVIDUAL", jurisdiction: "NG" }, output_summary: "2 hits on NFIU update — Nwosu and Ezechukwu", timing_ms: 2100, category: "Verification" },
    ],
    regulatory_context: "CBN AML/CFT Regulations require immediate account restriction and STR filing within 24 hours of a watchlist match on a previously-approved entity.",
    recommendation: "RESTRICT_ACCOUNTS_AND_OPEN_REVIEW_CASES",
  },
  {
    alert_id: "ALT-2024-00094",
    type: "VELOCITY_ANOMALY",
    entity_name: "Adebayo Olamide Fasanya",
    entity_id: "BVN-22187463901",
    description: "Account BVN 22187463901 completed 47 transactions in 6 hours. Baseline is 3/day.",
    severity: "MEDIUM",
    source_agent: "Fraud Intelligence Agent",
    status: "ACKNOWLEDGED",
    created_at: "2024-01-15T10:20:00Z",
    fraud_agent_confidence: 0.76,
    related_entities: ["KYC-2024-004821"],
    what_detected: "BVN 22187463901 (Adebayo Olamide Fasanya) executed 47 transactions between 04:00 and 10:00 AM, compared to a historical daily average of 3 transactions. Transaction amounts range from ₦5,000 to ₦48,000 with no consistent recipient pattern.",
    what_checked: [
      { tool: "get_transaction_history", inputs: { identifier: "22187463901", from_date: "2024-01-15T04:00:00Z" }, output_summary: "47 transactions in 6 hours — anomalous", timing_ms: 867, category: "Fraud" },
      { tool: "query_fraud_agent", inputs: { query: "velocity anomaly pattern for BVN 22187463901" }, output_summary: "Pattern inconsistent with historical profile. Confidence: 76%", timing_ms: 1190, category: "Agent" },
    ],
    recommendation: "PLACE_SOFT_BLOCK_AND_CONTACT_ACCOUNT_HOLDER",
  },
  {
    alert_id: "ALT-2024-00095",
    type: "RULES_BREACH",
    entity_name: "Obinna Ike Ezechukwu",
    entity_id: "KYC-2024-004827",
    description: "Automated approval rule triggered for entity with unresolved director mismatch. Rule logic conflict detected.",
    severity: "HIGH",
    source_agent: "Compliance Agent",
    status: "NEW",
    created_at: "2024-01-15T09:15:00Z",
    related_entities: ["KYC-2024-004827", "RULE-AUTO-APPROVE-TIER1"],
    what_detected: "The AUTO_APPROVE_TIER1 rule fired for Obinna Ike Ezechukwu despite an unresolved NFIU watchlist flag on the account. The rule was triggered because the risk score temporarily dropped below the threshold during a recalculation cycle.",
    what_checked: [
      { tool: "get_escalation_configs", inputs: {}, output_summary: "AUTO_APPROVE_TIER1 rule has no watchlist exception gate", timing_ms: 221, category: "Fraud" },
      { tool: "get_case", inputs: { case_id: "CM-2024-0078" }, output_summary: "Open NFIU case for this entity — not resolved", timing_ms: 445, category: "Case" },
    ],
    regulatory_context: "CBN Regulation requires that no automated approval system override a manual compliance hold triggered by a watchlist match.",
    recommendation: "DISABLE_AUTO_APPROVE_RULE_AND_ESCALATE_ENTITY",
  },
  {
    alert_id: "ALT-2024-00096",
    type: "FRAUD_PATTERN",
    entity_name: "Hollander Trade GmbH",
    entity_id: "KYB-EU-004421",
    description: "EU counterpart Hollander Trade GmbH flagged in cross-border transaction review. Pattern suggests potential layering.",
    severity: "HIGH",
    source_agent: "Fraud Intelligence Agent",
    status: "NEW",
    created_at: "2024-01-15T08:50:00Z",
    fraud_agent_confidence: 0.81,
    related_entities: ["Greenfield Commodity Trading Ltd", "AML-2024-001923"],
    what_detected: "Hollander Trade GmbH has transferred funds to 7 Nigerian entities in the past 60 days with no documented commercial relationship. All transfers were just below the reporting threshold.",
    what_checked: [
      { tool: "run_aml_screening", inputs: { entity_name: "Hollander Trade GmbH", entity_type: "BUSINESS", jurisdiction: "EU" }, output_summary: "No direct watchlist hits but structuring pattern detected", timing_ms: 1340, category: "Verification" },
    ],
    recommendation: "ENHANCED_DUE_DILIGENCE_ON_EU_COUNTERPART",
  },
  {
    alert_id: "ALT-2024-00097",
    type: "COMPLIANCE_TRIGGER",
    entity_name: "Fatimah Yusuf Abdullahi",
    entity_id: "KYC-2024-004826",
    description: "PEP relative flag on pending KYC — EDD protocol not yet initiated.",
    severity: "MEDIUM",
    source_agent: "Compliance Agent",
    status: "NEW",
    created_at: "2024-01-15T07:40:00Z",
    related_entities: ["KYC-2024-004826", "Mallam Suleiman Bello (PEP)"],
    what_detected: "KYC application from Fatimah Yusuf Abdullahi has been in PENDING status for 6 hours without EDD initiation, despite a PEP relative flag being raised at submission.",
    what_checked: [
      { tool: "get_kyc_result", inputs: { request_id: "KYC-2024-004826" }, output_summary: "Status: PENDING for 6h — EDD not initiated", timing_ms: 312, category: "Verification" },
    ],
    regulatory_context: "FATF Recommendations (R.12) require EDD to be initiated within 24 hours of PEP identification. The 6-hour delay requires immediate attention.",
    recommendation: "INITIATE_EDD_IMMEDIATELY",
  },
  {
    alert_id: "ALT-2024-00098",
    type: "VELOCITY_ANOMALY",
    entity_name: "Mohammed Abdullahi Suleiman",
    entity_id: "KYC-2024-004834",
    description: "Applicant IP geo-fenced to sanctioned region. 18 cross-border transactions in 10 days before account activation.",
    severity: "CRITICAL",
    source_agent: "Fraud Intelligence Agent",
    status: "NEW",
    created_at: "2024-01-15T13:25:00Z",
    fraud_agent_confidence: 0.94,
    related_entities: ["KYC-2024-004834"],
    what_detected: "Applicant's KYC submission originated from IP address geo-fenced to a sanctioned jurisdiction. Prior to submitting KYC, the associated phone number was used to initiate 18 cross-border transactions, suggesting pre-existing illicit account activity.",
    what_checked: [
      { tool: "query_fraud_bank", inputs: { identifier_type: "PHONE", identifier_value: "+2348012345678" }, output_summary: "Phone linked to pre-KYC transaction activity — 18 cross-border transfers", timing_ms: 445, category: "Fraud" },
    ],
    regulatory_context: "CBN Know Your Customer regulations prohibit account activation for individuals with unresolved sanctioned-region IP flags.",
    recommendation: "REJECT_APPLICATION_AND_FREEZE_ASSOCIATED_ACTIVITY",
  },
]

// ── Fraud Scan Result ─────────────────────────────────────────────────────────

export const fraudScanResult: FraudScanResult = {
  transaction_id: "TXN-2024-8827361",
  amount_ngn: 261000,
  sender: "Adebayo Olamide Fasanya (BVN: 22187463901)",
  receiver: "Emeka Chukwuemeka Nwosu (BVN: 33841927560)",
  channel: "NIP (Interbank Transfer)",
  timestamp: "2024-01-15T06:47:22Z",
  risk_score: 84,
  risk_indicators: [
    "Amount matches pattern across 46 other transfers in same window",
    "Receiver BVN previously flagged for mule activity",
    "Transfer occurred at 06:47 AM — off-hours for account profile",
    "No prior relationship between sender and receiver",
    "Device fingerprint changed 4 hours before transfer",
  ],
  fraud_agent_reasoning: "This transaction is one of 47 near-identical transfers executed in a coordinated 90-minute window across a ring of 3 linked accounts. The consistent transfer amount of ₦261,000, combined with the receiver's prior mule activity flag and the off-hours timing, strongly indicates a layering operation. The Fraud Intelligence Agent classifies this as a ring fraud pattern with 84% confidence.",
  fraud_agent_confidence: 0.84,
  recommended_action: "BLOCK_AND_ESCALATE",
}

// ── Cases ─────────────────────────────────────────────────────────────────────

export const cases: Case[] = [
  {
    case_id: "CM-2024-0091",
    entity_name: "Greenfield Commodity Trading Ltd",
    entity_id: "KYB-2024-001101",
    type: "AML",
    status: "OPEN",
    assigned_to: null,
    created_at: "2024-01-15T14:05:00Z",
    updated_at: "2024-01-15T14:05:00Z",
    priority: "HIGH",
    notes: "NFIU watchlist hit at 91% confidence. EDD required. Compliance team to review cross-border transaction history.",
    related_request_id: "AML-2024-001923",
  },
  {
    case_id: "CM-2024-0090",
    entity_name: "Emeka Chukwuemeka Nwosu",
    entity_id: "KYC-2024-004823",
    type: "FRAUD",
    status: "ESCALATED",
    assigned_to: "Tokunbo Adeyemi",
    created_at: "2024-01-14T11:20:00Z",
    updated_at: "2024-01-15T09:00:00Z",
    priority: "CRITICAL",
    notes: "Ring fraud pattern. BVN linked to 3 mule accounts. STR filed. Account frozen.",
  },
  {
    case_id: "CM-2024-0089",
    entity_name: "Obinna Ike Ezechukwu",
    entity_id: "KYC-2024-004827",
    type: "COMPLIANCE",
    status: "IN_REVIEW",
    assigned_to: "Ngozi Okonkwo",
    created_at: "2024-01-14T08:30:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    priority: "HIGH",
    notes: "NFIU match confirmed. Awaiting STR completion. Application rejected.",
    related_request_id: "KYC-2024-004827",
  },
  {
    case_id: "CM-2024-0078",
    entity_name: "Mohammed Abdullahi Suleiman",
    entity_id: "KYC-2024-004834",
    type: "COMPLIANCE",
    status: "OPEN",
    assigned_to: null,
    created_at: "2024-01-15T13:30:00Z",
    updated_at: "2024-01-15T13:30:00Z",
    priority: "CRITICAL",
    notes: "Sanctioned region IP. Pre-KYC illicit transaction activity. Application to be rejected.",
    related_request_id: "KYC-2024-004834",
  },
  {
    case_id: "CM-2024-0077",
    entity_name: "Fatimah Yusuf Abdullahi",
    entity_id: "KYC-2024-004826",
    type: "KYC",
    status: "OPEN",
    assigned_to: "Chidinma Ezurike",
    created_at: "2024-01-15T08:00:00Z",
    updated_at: "2024-01-15T08:00:00Z",
    priority: "MEDIUM",
    notes: "PEP relative — uncle is Tier-2 PEP. EDD required before approval.",
    related_request_id: "KYC-2024-004826",
  },
  {
    case_id: "CM-2024-0076",
    entity_name: "Brian Otieno Achieng",
    entity_id: "KYC-2024-004829",
    type: "KYC",
    status: "IN_REVIEW",
    assigned_to: "Tokunbo Adeyemi",
    created_at: "2024-01-14T15:00:00Z",
    updated_at: "2024-01-15T07:00:00Z",
    priority: "LOW",
    notes: "Kenya assets registry partial match. Source of funds clarification pending.",
    related_request_id: "KYC-2024-004829",
  },
  {
    case_id: "CM-2024-0075",
    entity_name: "Aisha Bello Musa",
    entity_id: "KYC-2024-004824",
    type: "KYC",
    status: "IN_REVIEW",
    assigned_to: "Ngozi Okonkwo",
    created_at: "2024-01-14T14:00:00Z",
    updated_at: "2024-01-14T16:00:00Z",
    priority: "MEDIUM",
    notes: "PEP relative assessment in progress. Awaiting EDD documentation from applicant.",
    related_request_id: "KYC-2024-004824",
  },
]

// ── Billing Data ──────────────────────────────────────────────────────────────

export const billingData: BillingData = {
  period: "January 2024",
  kyc_verifications: 2341,
  kyb_verifications: 89,
  aml_screenings: 412,
  fraud_scans: 1893,
  background_checks: 156,
  total_api_calls: 4891,
  spend_ngn: 1847500,
  spend_usd: 2387.50,
  plan: "Enterprise",
  usage_percent: 68,
}

// ── SDK Report ────────────────────────────────────────────────────────────────

export const sdkReportJanuary: SDKReport = {
  month: "January 2024",
  android_calls: 84234,
  ios_calls: 51892,
  web_calls: 29441,
  total_calls: 165567,
  success_rate: 98.7,
  avg_latency_ms: 214,
  top_endpoint: "run_kyc_verification",
}

// ── Executor functions ──────────────────────────────────────────────────────────
//
// Each function below is the "executor" for a tool in the registry.
// This is the ORCHESTRATION BOUNDARY: the point where Sandra's tool selection
// ends and the actual API call (in production) or data retrieval (in demo) begins.
//
// In production, these functions would look like:
//
//   async function executeListVerificationRequests() {
//     const response = await fetch("https://api.prembly.com/v2/verifications?status=PENDING", {
//       headers: { "x-api-key": process.env.PREMBLY_API_KEY }
//     })
//     return response.json() as KYCRequest[]
//   }
//
// The function name, parameters, and return type would be identical.
// Only the function body changes from mock to production.

// Production: GET /v2/verifications — returns all KYC requests in the queue.
export function executeListVerificationRequests(): KYCRequest[] {
  return kycRequests
}

// Production: POST /v2/aml/screen — screens the entity against all watchlists.
// In production, the entity name would be passed to the API as the subject of screening.
export function executeRunAMLScreening(entityName: string): AMLResult {
  void entityName
  return greenfieldAMLResult
}

// Production: GET /v2/alerts — returns active alerts from Sandra's monitoring engine.
// In the Alerts page, the first 8 are shown on load. New alerts are injected
// from injectableAlerts every 45 seconds to simulate Sandra's continuous monitoring.
export function executeGetFlaggedAlerts(): FraudAlert[] {
  return fraudAlerts.slice(0, 8)
}

// Production: POST /v2/fraud/scan — runs real-time ML transaction risk scoring.
// Always returns the fraudScanResult for TXN-2024-8827361 in the demo.
// The result demonstrates a ring fraud pattern with risk score 84.
export function executeRunFraudScan(): FraudScanResult {
  return fraudScanResult
}

// Production: POST /v2/cases + PATCH /v2/cases/{case_id}/assignee
// createCase() is one of Sandra's state-modifying operations — an ACTION intent.
// It uses new Date().toISOString() for timestamps because case creation is always
// a real-time action during the demo (the user just said "open a case").
// The returned case is prepended to the cases array so it appears at the top of
// any subsequent case list queries within the same session.
export function executeCreateCase(entityName: string, assignee?: string): Case {
  const newCase: Case = {
    case_id: "CM-2024-0092",
    entity_name: entityName,
    entity_id: "AML-2024-001923",
    type: "AML",
    status: "OPEN",
    assigned_to: assignee ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    priority: "HIGH",
    notes: `Case opened by Sandra AI. AML screening hit on NFIU watchlist. ${assignee ? `Assigned to ${assignee}.` : "Awaiting assignment."}`,
    related_request_id: "AML-2024-001923",
  }
  cases.unshift(newCase)
  return newCase
}

// Production: PATCH /v2/cases/{case_id}/assignee
// Sandra mutates the in-memory cases array directly, simulating what would be
// a PATCH request in production. The updated_at timestamp changes to now,
// because assignment is a real-time action. The assigned_to field change
// is immediately visible if the operator queries the case again.
export function executeAssignCase(caseId: string, assignee: string): Case {
  const found = cases.find((c) => c.case_id === caseId)
  if (found) {
    found.assigned_to = assignee
    found.updated_at = new Date().toISOString()
    return found
  }
  // Graceful fallback: if the case ID doesn't exist in the in-memory store
  // (e.g., if the operator references a case ID not in the seeded data),
  // return a stub case rather than throwing. This prevents a 500 error
  // from breaking the demo flow.
  return {
    case_id: caseId,
    entity_name: "Unknown Entity",
    entity_id: "",
    type: "KYC",
    status: "OPEN",
    assigned_to: assignee,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    priority: "MEDIUM",
    notes: `Assigned to ${assignee} by Sandra AI.`,
  }
}

// Production: GET /v2/billing/summary?period=2024-01
// Returns aggregate API call counts and spend data for the period.
// Sandra formats this into a narrative response (see mock-engine show_billing scenario).
export function executeGetBillingSummary(): BillingData {
  return billingData
}

// Production: GET /v2/sdk/reports?month=2024-01&platform=all
// Returns SDK call counts broken down by platform (Android, iOS, Web).
// Sandra identifies the dominant platform and calls out any anomalies in success rate.
export function executeGetSDKReports(): SDKReport {
  return sdkReportJanuary
}

// Injectable alerts — 5 additional alerts auto-injected into the Alerts page
// every 45 seconds to simulate Sandra's continuous real-time monitoring.
// These are designed to demonstrate two specific behaviors:
//   1. Sandra catches things proactively (not just when the operator asks)
//   2. New alerts arrive with urgency — the NEW badge appears briefly,
//      then fades to indicate the operator has been notified
//
// Each injectable alert uses new Date().toISOString() for created_at because
// they simulate alerts being generated at the moment they're injected — unlike
// the 8 pre-existing alerts which have fixed timestamps from earlier today.
export const injectableAlerts: FraudAlert[] = [
  {
    alert_id: "ALT-2024-00099",
    type: "VELOCITY_ANOMALY",
    entity_name: "Taiwo Olabisi Adeniyi",
    entity_id: "BVN-66512840392",
    description: "Just approved account attempted ₦800,000 transfer within 2 minutes of activation.",
    severity: "HIGH",
    source_agent: "Fraud Intelligence Agent",
    status: "NEW",
    created_at: new Date().toISOString(),
    fraud_agent_confidence: 0.79,
    related_entities: ["KYC-2024-004828"],
    what_detected: "Account activated 2 minutes ago and immediately attempted a ₦800,000 transfer — 40x the Tier 1 daily limit.",
    what_checked: [
      { tool: "query_fraud_bank", inputs: { identifier_type: "BVN", identifier_value: "66512840392" }, output_summary: "Immediate post-activation high-value transfer attempt", timing_ms: 290, category: "Fraud" },
    ],
    recommendation: "BLOCK_TRANSFER_AND_ESCALATE",
  },
  {
    alert_id: "ALT-2024-00100",
    type: "COMPLIANCE_TRIGGER",
    entity_name: "Kemi Olusanya Adeyemo",
    entity_id: "KYC-2024-004830",
    description: "Manual review item approaching 12-hour SLA breach.",
    severity: "MEDIUM",
    source_agent: "Compliance Agent",
    status: "NEW",
    created_at: new Date().toISOString(),
    related_entities: ["KYC-2024-004830"],
    what_detected: "KYC item KYC-2024-004830 has been in MANUAL_REVIEW status for 11.5 hours against a 12-hour SLA target.",
    what_checked: [
      { tool: "get_kyc_result", inputs: { request_id: "KYC-2024-004830" }, output_summary: "In MANUAL_REVIEW for 11.5h — SLA at risk", timing_ms: 188, category: "Verification" },
    ],
    recommendation: "ASSIGN_TO_AVAILABLE_REVIEWER_IMMEDIATELY",
  },
]
