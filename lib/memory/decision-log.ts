// ── Sandra AI — Decision Log ──────────────────────────────────────────────────
// In-memory append-only log of decisions made during the session.

import type { DecisionLogEntry } from "@/lib/types"

const log: DecisionLogEntry[] = []

export function appendDecision(
  action: string,
  entity: string,
  actor: "SANDRA" | "OPERATOR",
  result: string
): void {
  log.push({
    timestamp: new Date().toISOString(),
    action,
    entity,
    actor,
    result,
  })
}

export function getLog(): DecisionLogEntry[] {
  return [...log]
}

export function getLogForEntity(entity: string): DecisionLogEntry[] {
  return log.filter((entry) => entry.entity.toLowerCase().includes(entity.toLowerCase()))
}

export function clearLog(): void {
  log.length = 0
}

export function getRecentDecisions(limit = 10): DecisionLogEntry[] {
  return log.slice(-limit).reverse()
}

// Pre-seed some session decisions to make the "full picture" demo step meaningful
export function seedDemoLog(): void {
  log.length = 0
  log.push(
    {
      timestamp: "2024-01-15T09:00:00Z",
      action: "KYC_APPROVED",
      entity: "Chiamaka Ngozi Okafor",
      actor: "SANDRA",
      result: "Auto-approved — risk score 14, all fields verified",
    },
    {
      timestamp: "2024-01-15T09:15:00Z",
      action: "ALERT_RAISED",
      entity: "Multiple Linked Accounts (BVN prefix 22187463)",
      actor: "SANDRA",
      result: "Ring fraud pattern detected — confidence 89%",
    },
    {
      timestamp: "2024-01-15T09:30:00Z",
      action: "CASE_ESCALATED",
      entity: "Emeka Chukwuemeka Nwosu",
      actor: "SANDRA",
      result: "Escalated to fraud team — BVN linked to mule ring",
    }
  )
}
