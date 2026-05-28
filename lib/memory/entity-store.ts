// ── Sandra AI — Entity Memory Store ──────────────────────────────────────────
//
// SANDRA'S MEMORY LAYER — THREE TYPES:
//
// Sandra operates with three conceptually distinct memory types. Understanding
// them is essential to understanding why this file exists where it does in the
// call chain.
//
// 1. SESSION MEMORY
//    What was said in this conversation. Stored as the message history array
//    in ChatWindow.tsx. Never persisted. Scoped to a single browser session.
//    Sandra uses this to maintain conversational coherence ("the Greenfield
//    case we just discussed").
//
// 2. ENTITY MEMORY  ← THIS FILE
//    What Sandra knows about specific entities (businesses, individuals) from
//    prior verifications, fraud scans, and case history. This is the "context
//    before context" — retrieved BEFORE Sandra forms a response, so the response
//    can be grounded in entity history.
//
//    Why retrieve before forming a response?
//    Because if you ask Sandra "run AML on Greenfield" and Sandra doesn't know
//    Greenfield already has 2 open cases and a risk score of 91, Sandra might
//    respond as if this were a new entity. Entity memory allows Sandra to say
//    "this is not a new entity — I've seen this before, and here's the history."
//    That changes the tone, the recommendation, and the urgency of the response.
//
//    In production, entity memory would be a real database query against the
//    Prembly customer entity graph. Here it's an in-memory Map keyed by both
//    entity ID and lowercase entity name for O(1) lookups in either direction.
//
// 3. DECISION MEMORY (see /lib/memory/decision-log.ts)
//    An append-only log of actions Sandra has taken or recommended during the
//    session. Used for the "full picture" demo step and for audit trail display.
//    In production, this would be persisted to a compliance audit database.
//    Every ACTION intent write is logged here.
//
// WHY 847 ENTITIES?
//
// 847 is a credible-sounding number for a mid-size fintech's active entity
// database. The first 20 are hand-crafted with full detail because they're
// the ones that appear in chat scenarios, the KYC queue, and the alerts feed.
// The remaining 827 are generated deterministically (not randomly) from a fixed
// formula — same seed every time, no Math.random(). This ensures the AgentStatusBar
// always shows "847 entities indexed" and never flickers between refreshes.
//
// isMemoryEntity() is called by the mock engine BEFORE building a response to
// check if the user's message references an entity with history. If yes, the
// MemoryIndicator badge appears in the UI and the memory_summary is included
// in the SSE stream. This is how Sandra communicates to the operator that it's
// not reasoning from scratch — it's using prior knowledge.

import type { EntityMemory } from "@/lib/types"

// The first 20 entities are fully hand-crafted because they appear in real
// scenario flows (chat, operations, alerts). Their names, risk scores, and
// jurisdiction assignments are all consistent with the KYC queue and fraud alert data.
const seedEntities: EntityMemory[] = [
  { id: "ENT-0001", name: "Adebayo Olamide Fasanya", type: "INDIVIDUAL", jurisdiction: "NG", last_seen: "2024-01-15T09:23:00Z", risk_score: 72, open_cases: 1 },
  { id: "ENT-0002", name: "Chiamaka Ngozi Okafor", type: "INDIVIDUAL", jurisdiction: "NG", last_seen: "2024-01-15T08:11:00Z", risk_score: 14, open_cases: 0 },
  { id: "ENT-0003", name: "Emeka Chukwuemeka Nwosu", type: "INDIVIDUAL", jurisdiction: "NG", last_seen: "2024-01-15T10:44:00Z", risk_score: 88, open_cases: 2 },
  { id: "ENT-0004", name: "Aisha Bello Musa", type: "INDIVIDUAL", jurisdiction: "NG", last_seen: "2024-01-15T07:58:00Z", risk_score: 41, open_cases: 1 },
  { id: "ENT-0005", name: "Oluwafemi Adeyemi Rasheed", type: "INDIVIDUAL", jurisdiction: "NG", last_seen: "2024-01-15T06:30:00Z", risk_score: 8, open_cases: 0 },
  { id: "ENT-0006", name: "Fatimah Yusuf Abdullahi", type: "INDIVIDUAL", jurisdiction: "NG", last_seen: "2024-01-15T11:02:00Z", risk_score: 56, open_cases: 1 },
  { id: "ENT-0007", name: "Obinna Ike Ezechukwu", type: "INDIVIDUAL", jurisdiction: "NG", last_seen: "2024-01-14T17:35:00Z", risk_score: 95, open_cases: 2 },
  { id: "ENT-0008", name: "Taiwo Olabisi Adeniyi", type: "INDIVIDUAL", jurisdiction: "NG", last_seen: "2024-01-15T09:50:00Z", risk_score: 22, open_cases: 0 },
  { id: "ENT-0009", name: "Brian Otieno Achieng", type: "INDIVIDUAL", jurisdiction: "KE", last_seen: "2024-01-15T08:40:00Z", risk_score: 35, open_cases: 1 },
  { id: "ENT-0010", name: "Kemi Olusanya Adeyemo", type: "INDIVIDUAL", jurisdiction: "NG", last_seen: "2024-01-15T10:15:00Z", risk_score: 49, open_cases: 0 },
  { id: "ENT-0011", name: "Ngozi Adaeze Obiechina", type: "INDIVIDUAL", jurisdiction: "NG", last_seen: "2024-01-15T07:20:00Z", risk_score: 12, open_cases: 0 },
  { id: "ENT-0012", name: "Yusuf Garba Tanko", type: "INDIVIDUAL", jurisdiction: "NG", last_seen: "2024-01-15T12:10:00Z", risk_score: 63, open_cases: 0 },
  { id: "ENT-0013", name: "Adunola Folake Babatunde", type: "INDIVIDUAL", jurisdiction: "NG", last_seen: "2024-01-15T12:55:00Z", risk_score: 31, open_cases: 0 },
  { id: "ENT-0014", name: "Mohammed Abdullahi Suleiman", type: "INDIVIDUAL", jurisdiction: "NG", last_seen: "2024-01-15T13:20:00Z", risk_score: 79, open_cases: 1 },
  { id: "ENT-0015", name: "Greenfield Commodity Trading Ltd", type: "BUSINESS", jurisdiction: "NG", last_seen: "2024-01-15T14:02:00Z", risk_score: 91, open_cases: 2 },
  { id: "ENT-0016", name: "Hollander Trade GmbH", type: "BUSINESS", jurisdiction: "EU", last_seen: "2024-01-15T08:50:00Z", risk_score: 74, open_cases: 1 },
  { id: "ENT-0017", name: "Prembly Solutions Ltd", type: "BUSINESS", jurisdiction: "NG", last_seen: "2024-01-15T06:00:00Z", risk_score: 5, open_cases: 0 },
  { id: "ENT-0018", name: "AfriCommerce Holdings", type: "BUSINESS", jurisdiction: "NG", last_seen: "2024-01-14T20:00:00Z", risk_score: 28, open_cases: 0 },
  { id: "ENT-0019", name: "SavingsLink Microfinance", type: "BUSINESS", jurisdiction: "KE", last_seen: "2024-01-14T18:30:00Z", risk_score: 17, open_cases: 0 },
  { id: "ENT-0020", name: "Atlas Fintech Nigeria Ltd", type: "BUSINESS", jurisdiction: "NG", last_seen: "2024-01-13T12:00:00Z", risk_score: 44, open_cases: 1 },
]

// The remaining 827 entities are generated deterministically using a fixed
// modulo formula. Using (i * 37) % 96 + 3 for risk scores ensures the distribution
// is spread across the full 3–98 range without clustering at round numbers, which
// is what real risk score distributions look like. The formula is deterministic —
// entity ENT-0042 will always have the same name, jurisdiction, and risk score
// regardless of when the file is evaluated. This is important for the AgentStatusBar
// which reads totalEntities at render time.
const firstNames = ["Oluwaseun", "Adaobi", "Chukwudi", "Rukayat", "Segun", "Amina", "Babatunde", "Chioma", "Ifeanyi", "Zainab", "Funke", "Celestine", "Hauwa", "Emeka", "Blessing"]
const lastNames = ["Adeyemi", "Okafor", "Nwosu", "Bello", "Rasheed", "Abdullahi", "Ezechukwu", "Adeniyi", "Achieng", "Adeyemo", "Obiechina", "Tanko", "Babatunde", "Suleiman", "Fasanya"]

for (let i = 21; i <= 847; i++) {
  const fn = firstNames[(i - 1) % firstNames.length]
  const ln = lastNames[(i - 1) % lastNames.length]
  const riskScore = ((i * 37) % 96) + 3 // deterministic, 3–98
  seedEntities.push({
    id: `ENT-${String(i).padStart(4, "0")}`,
    name: `${fn} ${ln}`,
    type: i % 5 === 0 ? "BUSINESS" : "INDIVIDUAL",
    jurisdiction: i % 7 === 0 ? "KE" : i % 11 === 0 ? "EU" : "NG",
    last_seen: "2024-01-10T08:00:00Z",
    risk_score: riskScore,
    open_cases: riskScore > 70 ? 1 : 0,
  })
}

// Build a dual-key map for O(1) entity lookup by either ID or name.
// Sandra uses name-based lookup most often (from message text), but ID-based
// lookup is needed for follow-up operations after a case or alert surfaces an ID.
const entityMap = new Map<string, EntityMemory>()
for (const entity of seedEntities) {
  entityMap.set(entity.id, entity)
  entityMap.set(entity.name.toLowerCase(), entity)  // lowercase for case-insensitive matching
}

// getEntity() is the internal lookup used by other memory functions.
// In production this would be an async DB query. Keeping it sync here
// simplifies the mock engine which calls it in a synchronous context.
export function getEntity(idOrName: string): EntityMemory | undefined {
  return entityMap.get(idOrName) ?? entityMap.get(idOrName.toLowerCase())
}

// isMemoryEntity() is called by the mock engine BEFORE selecting a scenario response.
// If it returns true, the SSE stream will emit a "memory_used" event and the
// MemoryIndicator badge will appear in the chat UI above Sandra's response.
//
// The five identifiers below correspond to entities that appear in multiple
// demo scenarios (Greenfield in AML + alerts + operations, Fasanya in fraud
// + velocity anomaly, Nwosu/Ezechukwu in the AML retrospective match alert).
// Only entities that span multiple scenarios are worth flagging with memory
// retrieval — otherwise every message would show the badge and it would lose
// its meaning.
export function isMemoryEntity(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes("greenfield") ||
    lower.includes("22187463901") ||
    lower.includes("fasanya") ||
    lower.includes("nwosu") ||
    lower.includes("ezechukwu")
  )
}

// getMemorySummary() returns a one-line entity context string that gets embedded
// in the SSE "memory_used" event and rendered in the MemoryIndicator badge.
// The summary is intentionally brief — it's shown in the UI above Sandra's message
// to signal "I'm not reasoning from scratch" without dominating the interface.
// Full entity detail is available in the Operations detail panel and alert reasoning.
export function getMemorySummary(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes("greenfield")) {
    return "Memory context: Greenfield Commodity Trading Ltd — 2 open cases, risk score 91, NFIU watchlist hit, last seen 2024-01-15."
  }
  if (lower.includes("22187463901") || lower.includes("fasanya")) {
    return "Memory context: Adebayo Olamide Fasanya (BVN: 22187463901) — 1 open case, risk score 72, pending KYC with middle name flag."
  }
  if (lower.includes("nwosu") || lower.includes("emeka")) {
    return "Memory context: Emeka Chukwuemeka Nwosu — 2 open cases, risk score 88, BVN linked to mule ring, escalated."
  }
  return "Memory context: Entity retrieved from Sandra's entity index (847 entities tracked)."
}

export const totalEntities = 847
