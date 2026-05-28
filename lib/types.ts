// ── Sandra AI — Shared Types ──────────────────────────────────────────────────

export type Intent = "RETRIEVAL" | "ACTION" | "REASONING" | "ALERT"

export type AgentName = "compliance" | "fraud"

export type ComponentType =
  | "verification_list"
  | "case_list"
  | "aml_result"
  | "fraud_scan_result"
  | "compliance_answer"
  | "billing_summary"
  | "sdk_report"
  | "fraud_alerts"
  | "case_card"
  | "customer_360"

export type KYCStatus = "PENDING" | "APPROVED" | "REJECTED" | "MANUAL_REVIEW" | "IN_PROGRESS"

export type Recommendation = "APPROVE" | "MANUAL_REVIEW" | "ESCALATE" | "REJECT"

export type CaseStatus = "OPEN" | "IN_REVIEW" | "ESCALATED" | "CLOSED"

export type AlertType =
  | "FRAUD_PATTERN"
  | "COMPLIANCE_TRIGGER"
  | "AML_HIT"
  | "VELOCITY_ANOMALY"
  | "RULES_BREACH"

export type AlertSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"

export type AlertStatus = "NEW" | "ACKNOWLEDGED" | "ESCALATED" | "RESOLVED"

export type SourceAgent = "Fraud Intelligence Agent" | "Compliance Agent"

// ── Tool types ────────────────────────────────────────────────────────────────

export type ToolCategory =
  | "Verification"
  | "Fraud"
  | "Case"
  | "Finance"
  | "Agent"

export interface ToolParameter {
  name: string
  type: string
  description: string
  required: boolean
}

export interface Tool {
  name: string
  description: string
  category: ToolCategory
  parameters: ToolParameter[]
}

export interface ToolCall {
  tool: string
  inputs: Record<string, string | number | boolean>
  output_summary: string
  timing_ms: number
  category: ToolCategory
}

// ── Regulatory citation ───────────────────────────────────────────────────────

export interface Regulatorycitation {
  document: string
  section?: string
  article?: string
  jurisdiction: string
}

// ── Core data entities ────────────────────────────────────────────────────────

export interface KYCRequest {
  request_id: string
  full_name: string
  id_type: "BVN" | "NIN" | "CAC" | "PASSPORT" | "DRIVERS_LICENSE"
  id_number: string
  status: KYCStatus
  risk_score: number
  risk_flags: string[]
  submitted_at: string
  ai_recommendation: Recommendation
  ai_summary: string
  jurisdiction: "NG" | "KE" | "US" | "EU"
}

export interface AMLMatch {
  list: string
  match_score: number
  matched_name: string
  reason: string
}

export interface AMLResult {
  entity_name: string
  jurisdiction: string
  screening_id: string
  status: "CLEAR" | "HIT" | "PENDING"
  matches: AMLMatch[]
  recommended_action: string
  compliance_agent_invoked: boolean
  screened_at: string
}

export interface ComplianceAnswer {
  answer: string
  regulatory_citations: Regulatorycitation[]
  confidence: number
  recommended_action: string
  jurisdictions_applied: string[]
}

export interface FraudAlert {
  alert_id: string
  type: AlertType
  entity_name: string
  entity_id: string
  description: string
  severity: AlertSeverity
  source_agent: SourceAgent
  status: AlertStatus
  created_at: string
  fraud_agent_confidence?: number
  related_entities: string[]
  what_detected: string
  what_checked: ToolCall[]
  regulatory_context?: string
  recommendation: string
}

export interface FraudScanResult {
  transaction_id: string
  amount_ngn: number
  sender: string
  receiver: string
  channel: string
  timestamp: string
  risk_score: number
  risk_indicators: string[]
  fraud_agent_reasoning: string
  fraud_agent_confidence: number
  recommended_action: string
}

export interface Case {
  case_id: string
  entity_name: string
  entity_id: string
  type: "KYC" | "AML" | "FRAUD" | "COMPLIANCE"
  status: CaseStatus
  assigned_to: string | null
  created_at: string
  updated_at: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  notes: string
  related_request_id?: string
}

export interface BillingData {
  period: string
  kyc_verifications: number
  kyb_verifications: number
  aml_screenings: number
  fraud_scans: number
  background_checks: number
  total_api_calls: number
  spend_ngn: number
  spend_usd: number
  plan: string
  usage_percent: number
}

export interface SDKReport {
  month: string
  android_calls: number
  ios_calls: number
  web_calls: number
  total_calls: number
  success_rate: number
  avg_latency_ms: number
  top_endpoint: string
}

export interface Customer360Profile {
  customer_id: string
  name: string
  type: "INDIVIDUAL" | "BUSINESS"
  global_risk_score: number
  ai_synthesis: string
  products: {
    identity: { status: "GREEN" | "AMBER" | "RED"; last_verified: string }
    background: { status: "GREEN" | "AMBER" | "RED"; last_verified: string }
    fraud: { status: "GREEN" | "AMBER" | "RED"; last_verified: string }
    txn_monitoring: { status: "GREEN" | "AMBER" | "RED"; last_verified: string }
    aml: { status: "GREEN" | "AMBER" | "RED"; last_verified: string }
    vault: { status: "GREEN" | "AMBER" | "RED"; last_verified: string }
  }
}

// ── Sandra response ───────────────────────────────────────────────────────────

export interface SandraResponse {
  message: string
  tool_calls: ToolCall[]
  component?: ComponentType
  component_data?: KYCRequest[] | AMLResult | ComplianceAnswer | FraudScanResult | Case | BillingData | SDKReport | FraudAlert[] | Customer360Profile
  actions?: string[]
  memory_used?: boolean
  memory_summary?: string
  agent_used?: AgentName | null
  intent: Intent
  reasoning_trace?: string
}

// ── Memory entity ─────────────────────────────────────────────────────────────

export interface EntityMemory {
  id: string
  name: string
  type: "INDIVIDUAL" | "BUSINESS"
  jurisdiction: string
  last_seen: string
  risk_score: number
  open_cases: number
}

// ── Decision log entry ────────────────────────────────────────────────────────

export interface DecisionLogEntry {
  timestamp: string
  action: string
  entity: string
  actor: "SANDRA" | "OPERATOR"
  result: string
}

// ── Demo mode ─────────────────────────────────────────────────────────────────

export interface DemoStep {
  id: number
  title: string
  description: string
  page: "chat" | "operations" | "alerts"
  chatMessage?: string
  highlightElement?: string
  autoSelectQueue?: string
  autoSelectAlert?: number
  autoSelectItem?: number
}

// ── SSE streaming events ──────────────────────────────────────────────────────

export type SSEEventType =
  | "tool_start"
  | "tool_end"
  | "agent_invoked"
  | "token"
  | "component"
  | "done"
  | "error"

export interface SSEEvent {
  type: SSEEventType
  data: Record<string, unknown>
}
