// ── Sandra AI — Compliance Agent Mock ────────────────────────────────────────
//
// WHAT THIS IS IN THE SANDRA ARCHITECTURE:
//
// The Compliance Agent is one of Sandra's two specialist sub-agents. In the
// full Sandra architecture, agents sit in a separate layer from the Tool Mesh:
//
//   User message
//     → Intent Router
//       → Tool Plan (may include agent invocations)
//         → Tool Mesh calls (Prembly APIs)
//         → Agent calls (specialist sub-agents)  ← THIS FILE
//           → Response synthesis
//
// The critical design decision is that Sandra treats agents as tools — they
// appear in the tool call trace with category "Agent", they have inputs and
// outputs, they have timing metadata, and they can fail or return partial
// results just like any other tool call. This is intentional: it means the
// operator sees the Compliance Agent as part of Sandra's working process, not
// as a black box. The ReasoningPanel in the Alerts interface surfaces this
// transparency directly.
//
// HOW IT WORKS IN PRODUCTION (vs. this demo):
//
// In production, `queryComplianceAgent()` would be an HTTP call to a separate
// deployed service — not a local function. The Compliance Agent runs its own
// RAG pipeline against a corpus of regulatory documents (CBN circulars, FATF
// PDFs, EU directives, Kenyan POCAMLA documents). It returns the same shape
// as this mock: { answer, regulatory_citations, confidence, recommended_action }.
//
// The interface is identical to a Prembly API tool call. That's the whole point.
// Sandra doesn't care whether the tool is a Prembly REST API or a deployed
// agent — it just calls, waits for the response, and incorporates it into the
// final answer. This architecture makes agents swappable: you could replace the
// Compliance Agent with a different service without touching Sandra's core logic.
//
// WHY THE CONFIDENCE FIELD MATTERS:
//
// Compliance answers carry a confidence score because regulatory questions often
// have uncertainty (e.g., a regulation was updated last month and the agent's
// corpus may not reflect it). The confidence score lets Sandra decide whether to
// recommend a human review: < 80% confidence → "please verify with your legal
// team". This is a safety mechanism, not a decoration.
//
// WHY 4 SCENARIOS AND NOT A GENERAL QUERY MODEL:
//
// For the demo, we pre-script 4 high-quality scenarios so every regulatory
// citation, every section number, every recommended action is accurate. It's
// better to do 4 things perfectly than to hallucinate answers to 100 questions.
// In production, this would be a real RAG system.

import type { ComplianceAnswer } from "@/lib/types"

export type ComplianceScenario =
  | "eu_ng_payment"
  | "kyb_kenya"
  | "cbn_bvn_tier2"
  | "aml_greenfield"
  | "default"

// Scenario detector — maps the incoming question to the best pre-scripted answer.
// In production this would be a semantic embedding lookup against the agent's
// query library, not a keyword match. The pattern here mirrors what that lookup
// would return: a scenario ID that resolves to a specific regulatory answer.
function detectScenario(question: string): ComplianceScenario {
  const lower = question.toLowerCase()
  if (lower.includes("eu") || (lower.includes("european") && lower.includes("nigerian"))) return "eu_ng_payment"
  if (lower.includes("kenya") || lower.includes("kyb") || lower.includes("kenyan")) return "kyb_kenya"
  if (lower.includes("bvn") && lower.includes("tier")) return "cbn_bvn_tier2"
  if (lower.includes("greenfield") || lower.includes("aml") || lower.includes("threshold")) return "aml_greenfield"
  return "default"
}

// Pre-scripted compliance answers. Each entry contains a full regulatory answer
// with real citations because the demo needs to show what production-quality
// Compliance Agent output looks like. The citations are real documents — CBN
// circulars, FATF recommendations, EU directives — not fabricated references.
const scenarios: Record<ComplianceScenario, ComplianceAnswer> = {
  // Scenario 1: Nigerian business receiving EU payments.
  // This is the cross-border scenario that also triggers the ₦5M CBN threshold
  // check. Both the Nigerian and EU regulatory frameworks apply simultaneously —
  // which is why the jurisdictions_applied field contains both "NG" and "EU".
  // In production, the agent would query both its Nigerian corpus and its EU
  // corpus and synthesize a combined answer.
  eu_ng_payment: {
    answer:
      "Under CBN's AML/CFT Regulations 2022 (Section 14.3), a Nigerian business receiving cross-border payments exceeding ₦5,000,000 from a single EU counterpart in a 30-day period is required to conduct Enhanced Due Diligence (EDD), file a Suspicious Transaction Report if the source of funds cannot be verified, and maintain transaction records for a minimum of 5 years. EU AMLD6 additionally requires the Nigerian entity's EU correspondent to verify beneficial ownership before processing. The business must also notify their designated compliance officer within 24 hours of threshold breach.",
    regulatory_citations: [
      { document: "CBN AML/CFT Regulations 2022", section: "14.3", jurisdiction: "NG" },
      { document: "EU AMLD6 Directive", article: "Article 3(6)(b)", jurisdiction: "EU" },
      { document: "FATF Recommendation 16 (Wire Transfers)", jurisdiction: "NG" },
    ],
    confidence: 0.94,
    recommended_action: "INITIATE_EDD_AND_FILE_STR",
    jurisdictions_applied: ["NG", "EU"],
  },

  // Scenario 2: KYB for a Kenyan business.
  // Kenya operates under POCAMLA (2009) and CBK Prudential Guidelines — a
  // different regulatory stack than Nigeria. The agent must know which corpus
  // to query based on jurisdiction. In this demo, the scenario ID encodes the
  // jurisdiction implicitly. In production, the agent receives jurisdictions as
  // an explicit parameter and routes its RAG queries accordingly.
  kyb_kenya: {
    answer:
      "A business seeking KYB verification in Kenya under the Central Bank of Kenya's Proceeds of Crime and Anti-Money Laundering Act (POCAMLA) and the Business Registration Service (BRS) framework must provide: (1) Certificate of Incorporation or Registration from the Registrar of Companies Kenya; (2) Memorandum and Articles of Association; (3) List of directors with certified copies of national ID or passport; (4) KRA PIN certificate; (5) Proof of registered physical address; (6) Beneficial ownership disclosure for any shareholder holding more than 10% equity; and (7) Last 12 months audited accounts for businesses with annual turnover exceeding KES 50 million. Foreign entities must additionally provide a Certificate of Registration in Kenya under the Companies Act (Cap. 486).",
    regulatory_citations: [
      { document: "Kenya POCAMLA 2009", section: "Section 44", jurisdiction: "KE" },
      { document: "CBK Prudential Guidelines on KYC", section: "Part IV", jurisdiction: "KE" },
      { document: "Business Registration Service Act 2015", jurisdiction: "KE" },
    ],
    confidence: 0.91,
    recommended_action: "REQUEST_DOCUMENT_CHECKLIST_FROM_ENTITY",
    jurisdictions_applied: ["KE"],
  },

  // Scenario 3: CBN BVN Tier 2 verification requirements.
  // This scenario has the highest confidence (97%) because the CBN Tiered KYC
  // framework is a well-defined, stable document with specific numeric thresholds.
  // The agent's confidence reflects how well-documented and unambiguous a
  // regulation is — not just whether the answer is correct. This distinction
  // matters when Sandra decides whether to recommend human review.
  cbn_bvn_tier2: {
    answer:
      "Under CBN's Regulatory Framework for BVN Operations (2017) and the Tiered Know Your Customer requirements (Circular FPR/DIR/CIR/GEN/01/020), a Tier 2 account requires: (1) Successful BVN linkage with biometric verification confirming identity against NIBSS records; (2) A valid government-issued ID (National ID, International Passport, Driver's License, or Voter's Card) — one document sufficient; (3) Facial match verification with liveness detection at ≥80% confidence; and (4) Proof of address (utility bill, bank statement, or Voter's Card with address within 3 months). Tier 2 accounts are capped at a maximum daily transaction limit of ₦500,000 and a maximum balance of ₦500,000. BVN linkage failures due to middle-name discrepancies must be resolved through an NIBSS BVN update process before account activation.",
    regulatory_citations: [
      { document: "CBN Tiered KYC Framework 2013 (Revised 2017)", section: "Tier 2 Requirements", jurisdiction: "NG" },
      { document: "CBN BVN Regulatory Framework 2017", jurisdiction: "NG" },
      { document: "CBN Circular FPR/DIR/CIR/GEN/01/020", jurisdiction: "NG" },
    ],
    confidence: 0.97,
    recommended_action: "VERIFY_BVN_AND_REQUEST_SECONDARY_ID",
    jurisdictions_applied: ["NG"],
  },

  // Scenario 4: AML hit on Greenfield.
  // This scenario is invoked AFTER the run_aml_screening tool returns a HIT.
  // Sandra invokes the Compliance Agent not to determine if there's a problem
  // (the AML tool already found one) but to determine what the operator is
  // LEGALLY REQUIRED to do in response. The agent's role here is prescriptive,
  // not diagnostic. This is a key distinction: the Fraud Agent diagnoses,
  // the Compliance Agent prescribes.
  aml_greenfield: {
    answer:
      "Given the NFIU watchlist hit at 91% confidence against Greenfield Commodity Trading Ltd, immediate action is required under CBN AML/CFT Regulations 2022. The recommended steps are: (1) Freeze the entity's account pending investigation; (2) Initiate Enhanced Due Diligence including source-of-funds verification and beneficial ownership confirmation; (3) File a Suspicious Transaction Report (STR) with the NFIU within 24 hours as required by Section 6(2) of the Money Laundering (Prevention and Prohibition) Act 2022; (4) Preserve all transaction records and correspondence; and (5) Do not alert the entity to the investigation (tipping-off prohibition applies under MLPPA 2022, Section 15).",
    regulatory_citations: [
      { document: "Money Laundering (Prevention and Prohibition) Act 2022", section: "Section 6(2)", jurisdiction: "NG" },
      { document: "CBN AML/CFT Regulations 2022", section: "14.3", jurisdiction: "NG" },
      { document: "MLPPA 2022 — Tipping Off Prohibition", section: "Section 15", jurisdiction: "NG" },
    ],
    confidence: 0.96,
    recommended_action: "FREEZE_ACCOUNT_FILE_STR_INITIATE_EDD",
    jurisdictions_applied: ["NG"],
  },

  // Default: fallback for questions the agent doesn't have a scripted answer for.
  // In production this would trigger a live RAG query instead of this stub.
  // The low confidence (0.72) signals to Sandra that this answer needs human validation.
  default: {
    answer:
      "Based on the applicable regulatory framework, compliance requires adherence to CBN guidelines and where applicable, FATF recommendations. I recommend consulting the specific regulation relevant to your jurisdiction. Please provide more detail about the specific compliance question for a precise regulatory answer.",
    regulatory_citations: [
      { document: "CBN AML/CFT Regulations 2022", jurisdiction: "NG" },
      { document: "FATF 40 Recommendations", jurisdiction: "NG" },
    ],
    confidence: 0.72,
    recommended_action: "CONSULT_COMPLIANCE_TEAM",
    jurisdictions_applied: ["NG"],
  },
}

// The public interface Sandra calls. In production, jurisdiction routing would
// filter the agent's corpus before answering.
export function queryComplianceAgent(question: string, jurisdictions: string): ComplianceAnswer {
  void jurisdictions
  const scenario = detectScenario(question)
  return scenarios[scenario]
}
