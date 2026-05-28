// Sandra AI — StructuredResult [CONVERSATIONAL / OPERATIONAL]
//
// Component classification: CONVERSATIONAL (appears in chat bubbles) + OPERATIONAL (used in Operations page)
// This is Sandra's "component dispatcher" — the switch statement that maps
// component type strings from the SSE stream to actual React components.
//
// HOW IT WORKS IN THE ARCHITECTURE:
// When the SSE stream emits a "component" event, it includes:
//   { component: "verification_list", component_data: KYCRequest[], actions: [...] }
// MessageBubble receives this and renders <StructuredResult component="verification_list" ... />
// StructuredResult then dispatches to the appropriate sub-component (VerificationTable, etc.)
//
// WHY A DISPATCHER INSTEAD OF INDIVIDUAL IMPORTS:
// Sandra can return any of 8 component types. If each scenario imported its own component
// directly, every component would be in the bundle regardless of which scenarios were used.
// The dispatcher pattern means new component types can be added by adding one case to the
// switch statement — the rest of the system is unchanged.
//
// WHY COMPONENT DATA IS TYPED AS UNKNOWN AT THE BOUNDARY:
// The SSE stream arrives as JSON strings. TypeScript can't know the shape at the network
// boundary. StructuredResult receives unknown and narrows it to the correct type in each
// case arm (e.g., `component_data as KYCRequest[]`). This is intentional — the type cast
// is safe because the component string and data shape are always consistent in mock-engine.ts.
// In production, this would be validated with a Zod schema at the SSE consumer boundary.

"use client"

import type {
  ComponentType,
  KYCRequest,
  AMLResult,
  ComplianceAnswer,
  FraudScanResult,
  Case,
  BillingData,
  SDKReport,
  FraudAlert,
  Recommendation,
  AlertSeverity,
  Customer360Profile,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { CheckCircle, AlertTriangle, XCircle, Clock, TrendingUp, BarChart3, DollarSign } from "lucide-react"
import { Customer360Card } from "@/components/customers/Customer360Card"

// ── Risk Score helpers ────────────────────────────────────────────────────────

function riskColor(score: number) {
  if (score < 40) return "text-emerald-400 border border-emerald-500/20 bg-emerald-500/10"
  if (score <= 70) return "text-amber-400 border border-amber-500/20 bg-amber-500/10"
  return "text-red-400 border border-red-500/20 bg-red-500/10"
}

function recColor(rec: Recommendation) {
  const map: Record<Recommendation, string> = {
    APPROVE: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    MANUAL_REVIEW: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    ESCALATE: "text-red-400 border-red-500/20 bg-red-500/10",
    REJECT: "text-red-400 border-red-500/20 bg-red-500/20",
  }
  return map[rec]
}

function severityColor(s: AlertSeverity) {
  const map: Record<AlertSeverity, string> = {
    CRITICAL: "text-red-400 border-red-500/20 bg-red-500/10",
    HIGH: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    MEDIUM: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    LOW: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  }
  return map[s]
}

// ── Verification Table ────────────────────────────────────────────────────────

function VerificationTable({ data }: { data: KYCRequest[] }) {
  return (
    <div className="mt-3 rounded-xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto max-h-72 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="bg-[#1C1C1E] sticky top-0 z-10">
            <tr>
              {["Name", "ID", "Status", "Risk", "Recommendation", "AI Summary"].map((col) => (
                <th key={col} className="text-left px-3 py-2.5 text-[#888888] font-semibold text-[11px] uppercase tracking-wide whitespace-nowrap border-b border-white/5">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.request_id} className={cn("border-b border-white/5 hover:bg-white/5 transition-all-150", i % 2 === 1 ? "bg-[#121212]" : "bg-[#0A0A0A]")}>
                <td className="px-3 py-2.5 font-medium text-[#EAEAEA] whitespace-nowrap">{row.full_name}</td>
                <td className="px-3 py-2.5 font-mono text-[#555555] text-[11px] whitespace-nowrap">{row.request_id}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium border",
                    row.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    row.status === "REJECTED" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    row.status === "MANUAL_REVIEW" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-white/5 text-[#888888] border-white/10"
                  )}>
                    {row.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className={cn("font-bold px-2 py-0.5 rounded-md text-[11px]", riskColor(row.risk_score))}>
                    {row.risk_score}
                  </span>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className={cn("px-2 py-0.5 rounded-md text-[11px] font-semibold border", recColor(row.ai_recommendation))}>
                    {row.ai_recommendation.replace("_", " ")}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-[#888888] max-w-[200px] truncate" title={row.ai_summary}>
                  {row.ai_summary}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 bg-[#1C1C1E] border-t border-white/5 text-[11px] text-[#555555]">
        {data.length} items · Sorted by risk score descending
      </div>
    </div>
  )
}

// ── AML Result Card ───────────────────────────────────────────────────────────

function AMLResultCard({ data }: { data: AMLResult }) {
  return (
    <div className="mt-3 rounded-xl border border-red-500/20 overflow-hidden">
      <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2">
        <AlertTriangle size={15} className="text-red-400" />
        <span className="font-semibold text-red-400 text-sm">AML Screening: HIT</span>
        <span className="ml-auto font-mono text-xs text-red-500/80">{data.screening_id}</span>
      </div>
      <div className="p-4 bg-[#121212]">
        <div className="font-semibold text-[#EAEAEA] mb-1">{data.entity_name}</div>
        <div className="text-xs text-[#555555] mb-3">Jurisdiction: {data.jurisdiction} · Screened: {new Date(data.screened_at).toLocaleString()}</div>
        <div className="flex flex-col gap-2">
          {data.matches.map((match, i) => (
            <div key={i} className="rounded-lg bg-red-500/5 border border-red-500/20 px-3 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-red-400">{match.list}</div>
                  <div className="text-xs text-[#888888] mt-0.5">Matched: <span className="font-medium text-[#EAEAEA]">{match.matched_name}</span></div>
                  <div className="text-xs text-[#555555] mt-0.5">{match.reason}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-red-400">{Math.round(match.match_score * 100)}%</div>
                  <div className="text-[10px] text-[#555555]">confidence</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
          <span className="text-[11px] font-semibold text-[#555555] uppercase tracking-wide">Recommended Action: </span>
          <span className="text-sm font-bold text-red-400">{data.recommended_action.replace(/_/g, " ")}</span>
        </div>
      </div>
    </div>
  )
}

// ── Compliance Answer Card ────────────────────────────────────────────────────

function ComplianceAnswerCard({ data }: { data: ComplianceAnswer }) {
  return (
    <div className="mt-3 rounded-xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 bg-[#1C1C1E] border-b border-white/5 flex items-center gap-2">
        <CheckCircle size={15} className="text-[#37b7ab]" />
        <span className="font-semibold text-[#EAEAEA] text-sm">Compliance Analysis</span>
        <div className="ml-auto flex gap-1">
          {data.jurisdictions_applied.map((j) => (
            <span key={j} className="text-[11px] px-1.5 py-0.5 rounded bg-white/5 text-[#888888] font-mono border border-white/10">
              {j}
            </span>
          ))}
        </div>
      </div>
      <div className="p-4 bg-[#121212]">
        <p className="text-sm text-[#EAEAEA] leading-relaxed mb-4">{data.answer}</p>

        {/* Confidence bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-[#888888] mb-1">
            <span>Confidence</span>
            <span className="font-semibold text-[#37b7ab]">{Math.round(data.confidence * 100)}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#37b7ab] rounded-full transition-all duration-500"
              style={{ width: `${data.confidence * 100}%` }}
            />
          </div>
        </div>

        {/* Citations */}
        <div className="mb-3">
          <div className="text-[11px] font-semibold text-[#555555] uppercase tracking-wide mb-2">Regulatory Citations</div>
          <div className="flex flex-wrap gap-1.5">
            {data.regulatory_citations.map((cite, i) => (
              <span
                key={i}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#1C1C1E] text-[#888888] border border-white/10 font-medium"
              >
                {cite.document}
                {(cite.section ?? cite.article) && ` · ${cite.section ?? cite.article}`}
              </span>
            ))}
          </div>
        </div>

        <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/5 mt-4">
          <span className="text-[11px] font-semibold text-[#555555] uppercase tracking-wide">Action: </span>
          <span className="text-sm font-bold text-[#EAEAEA]">{data.recommended_action.replace(/_/g, " ")}</span>
        </div>
      </div>
    </div>
  )
}

// ── Case Card ─────────────────────────────────────────────────────────────────

function CaseCard({ data }: { data: Case }) {
  const statusColors: Record<string, string> = {
    OPEN: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    IN_REVIEW: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    ESCALATED: "bg-red-500/10 text-red-400 border-red-500/20",
    CLOSED: "bg-white/5 text-[#888888] border-white/10",
  }
  return (
    <div className="mt-3 rounded-xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 bg-[#1C1C1E] border-b border-white/5 flex items-center gap-2">
        <Clock size={15} className="text-[#888888]" />
        <span className="font-semibold text-[#EAEAEA] text-sm">Case {data.case_id}</span>
        <span className={cn("ml-auto text-xs font-semibold px-2.5 py-1 rounded-lg border", statusColors[data.status])}>
          {data.status.replace("_", " ")}
        </span>
      </div>
      <div className="p-4 bg-[#121212] grid grid-cols-2 gap-3">
        {[
          { label: "Entity", value: data.entity_name },
          { label: "Type", value: data.type },
          { label: "Priority", value: data.priority },
          { label: "Assigned to", value: data.assigned_to ?? "Unassigned" },
          { label: "Created", value: new Date(data.created_at).toLocaleDateString() },
          { label: "Related", value: data.related_request_id ?? "—" },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="text-[10px] font-semibold text-[#555555] uppercase tracking-wide">{label}</div>
            <div className="text-sm text-[#EAEAEA] font-medium mt-0.5">{value}</div>
          </div>
        ))}
        {data.notes && (
          <div className="col-span-2 mt-2">
            <div className="text-[10px] font-semibold text-[#555555] uppercase tracking-wide mb-1">Notes</div>
            <div className="text-sm text-[#888888] bg-white/5 border border-white/5 rounded-lg p-2.5">{data.notes}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Fraud Scan Result ─────────────────────────────────────────────────────────

function FraudScanResultCard({ data }: { data: FraudScanResult }) {
  return (
    <div className="mt-3 rounded-xl border border-amber-500/20 overflow-hidden">
      <div className="px-4 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2">
        <AlertTriangle size={15} className="text-amber-400" />
        <span className="font-semibold text-amber-400 text-sm">Fraud Scan: {data.transaction_id}</span>
        <span className={cn("ml-auto text-base font-bold px-3 py-1 rounded-lg border", riskColor(data.risk_score))}>
          {data.risk_score} <span className="text-xs font-medium opacity-80">risk</span>
        </span>
      </div>
      <div className="p-4 bg-[#121212]">
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          {[
            { label: "Sender", value: data.sender },
            { label: "Receiver", value: data.receiver },
            { label: "Amount", value: `₦${data.amount_ngn.toLocaleString()}` },
            { label: "Channel", value: data.channel },
            { label: "Timestamp", value: new Date(data.timestamp).toLocaleString() },
            { label: "Agent Confidence", value: `${Math.round(data.fraud_agent_confidence * 100)}%` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-[10px] font-semibold text-[#555555] uppercase tracking-wide">{label}</div>
              <div className="text-[#EAEAEA] font-medium mt-0.5">{value}</div>
            </div>
          ))}
        </div>

        <div className="mb-3">
          <div className="text-[11px] font-semibold text-[#555555] uppercase tracking-wide mb-2">Risk Indicators</div>
          <div className="flex flex-col gap-1.5">
            {data.risk_indicators.map((indicator, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[#888888]">
                <XCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
                {indicator}
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 mt-4 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/80 leading-relaxed">
          <span className="font-semibold text-amber-400 block mb-1">Fraud Agent Reasoning:</span>
          {data.fraud_agent_reasoning}
        </div>
      </div>
    </div>
  )
}

// ── Billing Summary ───────────────────────────────────────────────────────────

function BillingSummaryCard({ data }: { data: BillingData }) {
  return (
    <div className="mt-3 rounded-xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 bg-[#1C1C1E] border-b border-white/5 flex items-center gap-2">
        <DollarSign size={15} className="text-emerald-400" />
        <span className="font-semibold text-[#EAEAEA] text-sm">{data.period} Billing Summary</span>
        <span className="ml-auto text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">{data.plan}</span>
      </div>
      <div className="p-4 bg-[#121212]">
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Total API Calls", value: data.total_api_calls.toLocaleString() },
            { label: "Spend (NGN)", value: `₦${data.spend_ngn.toLocaleString()}` },
            { label: "Spend (USD)", value: `$${data.spend_usd.toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/5 border border-white/5 rounded-lg p-3">
              <div className="text-[10px] font-semibold text-[#555555] uppercase tracking-wide">{label}</div>
              <div className="text-lg font-bold text-[#EAEAEA] mt-1">{value}</div>
            </div>
          ))}
        </div>

        {/* Usage bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-[#888888] mb-1.5">
            <span>Plan quota used</span>
            <span className="font-semibold">{data.usage_percent}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full", data.usage_percent > 80 ? "bg-amber-400" : "bg-emerald-400")}
              style={{ width: `${data.usage_percent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-xs">
          {[
            { label: "KYC", value: data.kyc_verifications },
            { label: "KYB", value: data.kyb_verifications },
            { label: "AML", value: data.aml_screenings },
            { label: "Fraud Scans", value: data.fraud_scans },
            { label: "Background Checks", value: data.background_checks },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="font-bold text-[#EAEAEA]">{value.toLocaleString()}</div>
              <div className="text-[#555555] mt-0.5 text-[10px] uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── SDK Report ────────────────────────────────────────────────────────────────

function SDKReportCard({ data }: { data: SDKReport }) {
  return (
    <div className="mt-3 rounded-xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 bg-[#1C1C1E] border-b border-white/5 flex items-center gap-2">
        <BarChart3 size={15} className="text-blue-400" />
        <span className="font-semibold text-[#EAEAEA] text-sm">SDK Report · {data.month}</span>
      </div>
      <div className="p-4 bg-[#121212]">
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Android", value: data.android_calls.toLocaleString(), pct: Math.round(data.android_calls / data.total_calls * 100) },
            { label: "iOS", value: data.ios_calls.toLocaleString(), pct: Math.round(data.ios_calls / data.total_calls * 100) },
            { label: "Web", value: data.web_calls.toLocaleString(), pct: Math.round(data.web_calls / data.total_calls * 100) },
          ].map(({ label, value, pct }) => (
            <div key={label} className="bg-white/5 border border-white/5 rounded-lg p-3">
              <div className="text-[10px] font-semibold text-[#555555] uppercase tracking-wide">{label}</div>
              <div className="text-base font-bold text-[#EAEAEA] mt-1">{value}</div>
              <div className="text-xs text-[#888888] mt-1">{pct}%</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-[10px] font-semibold text-[#555555] uppercase tracking-wide">Total Calls</div>
            <div className="font-bold text-[#EAEAEA] mt-0.5">{data.total_calls.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-[#555555] uppercase tracking-wide">Success Rate</div>
            <div className="font-bold text-emerald-400 mt-0.5">{data.success_rate}%</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-[#555555] uppercase tracking-wide">Avg Latency</div>
            <div className="font-bold text-[#EAEAEA] mt-0.5 flex items-center gap-1">
              {data.avg_latency_ms}ms
              <TrendingUp size={13} className="text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Fraud Alerts List ─────────────────────────────────────────────────────────

function FraudAlertsInline({ data }: { data: FraudAlert[] }) {
  return (
    <div className="mt-3 flex flex-col gap-2">
      {data.map((alert) => (
        <div key={alert.alert_id} className="rounded-xl border border-white/5 bg-[#121212] px-4 py-3">
          <div className="flex items-start gap-3">
            <div>
              <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-md border", severityColor(alert.severity))}>
                {alert.severity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#EAEAEA] truncate">{alert.entity_name}</div>
              <div className="text-xs text-[#888888] mt-0.5 leading-relaxed">{alert.description}</div>
            </div>
            <span className="text-[10px] text-[#555555] font-mono shrink-0">
              {alert.type.replace("_", " ")}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main StructuredResult dispatcher ─────────────────────────────────────────

interface StructuredResultProps {
  component: ComponentType
  component_data: unknown
}

export function StructuredResult({ component, component_data }: StructuredResultProps) {
  switch (component) {
    case "verification_list":
      return <VerificationTable data={component_data as KYCRequest[]} />
    case "aml_result":
      return <AMLResultCard data={component_data as AMLResult} />
    case "compliance_answer":
      return <ComplianceAnswerCard data={component_data as ComplianceAnswer} />
    case "case_card":
    case "case_list":
      return <CaseCard data={component_data as Case} />
    case "fraud_scan_result":
      return <FraudScanResultCard data={component_data as FraudScanResult} />
    case "billing_summary":
      return <BillingSummaryCard data={component_data as BillingData} />
    case "sdk_report":
      return <SDKReportCard data={component_data as SDKReport} />
    case "fraud_alerts":
      return <FraudAlertsInline data={component_data as FraudAlert[]} />
    case "customer_360":
      return <Customer360Card data={component_data as Customer360Profile} />
    default:
      return null
  }
}
