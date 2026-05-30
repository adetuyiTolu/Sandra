// Mock data for the Sandra Home Dashboard

export const sandraBriefing = {
  text: "Since your last session, 14 new verification requests have entered the Operations queue, 3 of which carry risk scores above 70 and require manual review before end of day. The Fraud Intelligence Agent flagged a coordinated transaction pattern across 3 linked accounts — this alert is unacknowledged and marked critical. Your AML Configuration has 2 active rules that triggered hits overnight against the NFIU watchlist. Compliance Agent notes that CBN's updated KYC circular takes effect in 18 days — 4 of your active workflows may require adjustment.",
  agents: ["Compliance Agent", "Fraud Intelligence"]
}

export const attentionRequired = [
  {
    severity: "critical" as const,
    icon: "bell",
    label: "Review Required",
    value: "1 Action Item",
    description: "Suspicious activity detected across multiple accounts",
    action: { label: "View Alert", href: "/alerts" }
  },
  {
    severity: "high" as const,
    icon: "clock",
    label: "Operations Queue",
    value: "14 Pending",
    description: "3 high-risk items require your review",
    action: { label: "Open Queue", href: "/operations" }
  },
  {
    severity: "medium" as const,
    icon: "shield",
    label: "Compliance Update",
    value: "Upcoming Changes",
    description: "Regulatory updates may affect your active workflows",
    action: { label: "Ask Sandra", href: "/chat?prefill=" + encodeURIComponent("Show me which workflows need to be updated") }
  }
]

export const activityFeed = [
  { id: 1, type: "verification", description: "KYC verification completed", entity: "Adebayo Olamide Fasanya", timestamp: "4 min ago", source: "API" },
  { id: 2, type: "alert", description: "Critical alert raised", entity: "Multiple Linked Accounts (ALT-2024-00091)", timestamp: "12 min ago", source: "Sandra" },
  { id: 3, type: "case", description: "Case opened", entity: "Greenfield Commodity Trading Ltd", timestamp: "34 min ago", source: "Sandra" },
  { id: 4, type: "fraud", description: "AML hit", entity: "Greenfield Commodity Trading Ltd", timestamp: "34 min ago", source: "Dashboard" },
  { id: 5, type: "verification", description: "Background check completed", entity: "Chidinma Okonkwo", timestamp: "1 hr ago", source: "SDK" },
  { id: 6, type: "fraud", description: "Fraud rule triggered", entity: "Velocity threshold breach", timestamp: "2 hrs ago", source: "Sandra" },
  { id: 7, type: "verification", description: "KYB verification completed", entity: "Novacrust Technologies Ltd", timestamp: "3 hrs ago", source: "API" },
  { id: 8, type: "case", description: "Case resolved", entity: "Adeyemi Bakare (CM-2024-0087)", timestamp: "5 hrs ago", source: "Dashboard" },
]

export const agentStatus = [
  {
    name: "Compliance Agent",
    status: "Operational",
    lastQuery: "4 min ago",
    jurisdictions: ["NG", "KE", "US", "EU"],
    stat: "47 queries today",
    state: "nominal" as const
  },
  {
    name: "Fraud Intelligence",
    status: "Operational",
    lastQuery: "12 min ago",
    capabilities: ["Pattern analysis", "Bank graph"],
    stat: "3 alerts raised today",
    state: "nominal" as const
  }
]

export const operationsQueueStatus = [
  { name: "KYC Queue", count: 14, dot: "amber" as const, highRiskRatio: 3/14 },
  { name: "AML Queue", count: 3, dot: "red" as const, highRiskRatio: 1 },
  { name: "Case Queue", count: 7, dot: "amber" as const, highRiskRatio: 2/7 },
  { name: "Fraud Alerts", count: 5, dot: "red" as const, highRiskRatio: 1 },
]

export const customer360Snapshot = {
  totalEnrolled: 2847,
  avgRiskScore: 34,
  newThisWeek: 127,
  recentProfiles: [
    { id: "greenfield-001", name: "Greenfield Commodity Trading Ltd", type: "Business", risk: 72, time: "34 min ago" },
    { id: "fasanya-002", name: "Adebayo Olamide Fasanya", type: "Individual", risk: 68, time: "1 hr ago" },
    { id: "okonkwo-003", name: "Chidinma Okonkwo", type: "Individual", risk: 21, time: "2 hrs ago" },
    { id: "novacrust-004", name: "Novacrust Technologies Ltd", type: "Business", risk: 15, time: "3 hrs ago" },
    { id: "chukwuemeka-005", name: "Emeka Chukwuemeka", type: "Individual", risk: 45, time: "5 hrs ago" },
  ]
}

export const billingSnapshot = {
  period: "May 1 — May 31, 2026",
  amountUsed: 847200,
  creditRemaining: 152800,
  walletBalance: 1250000,
  usagePercent: 85,
  nextBillingDate: "June 1, 2026",
  breakdown: [
    { label: "Verification API calls", value: "12,847 calls", amount: 641000 },
    { label: "SDK Flow completions", value: "3,214 completions", amount: 160700 },
    { label: "AML Screenings", value: "423 screenings", amount: 45500 }
  ],
  subscriptions: [
    { name: "AML Compliance (Basic)", usage: "66 / 100", nextBilling: "06/06/2026" },
    { name: "Fraud Scan (Starter)", usage: "18 / 1,000", nextBilling: "03/06/2026" }
  ]
}

export const workflowHealth = [
  { name: "Tier 1 Individual Onboarding", steps: 5, status: "Active" as const, completions: 1847 },
  { name: "Business KYB Standard", steps: 4, status: "Active" as const, completions: 203 },
  { name: "High Risk EDD Flow", steps: 7, status: "Needs Review" as const, completions: 12 },
  { name: "SDK Lite Verification", steps: 3, status: "Active" as const, completions: 3214 },
]

export const platformActivityData = {
  "Today": [
    { label: "Verifications Run", value: "247", trend: "+4% vs last period", trendType: "positive", subtext: "Across KYC, KYB, Background Check" },
    { label: "AML Screenings", value: "58", trend: "+1% vs last period", trendType: "positive", subtext: "2 hits · 0 escalated" },
    { label: "Fraud Scans", value: "94", trend: "-1% vs last period", trendType: "neutral", subtext: "Fraud Bank: 5 new entries" },
    { label: "Cases Opened", value: "4", trend: "+1 vs yesterday", trendType: "warning", subtext: "2 open · 2 resolved" },
    { label: "SDK Flow Completions", value: "431", trend: "+22% vs last period", trendType: "positive", subtext: "Across 6 active SDK flows" },
    { label: "API Call Volume", value: "3,847", trend: "+3% vs last period", trendType: "positive", subtext: "99.9% uptime today" },
  ],
  "Last 7 days": [
    { label: "Verifications Run", value: "1,847", trend: "+12% vs last period", trendType: "positive", subtext: "Across KYC, KYB, Background Check" },
    { label: "AML Screenings", value: "423", trend: "+3% vs last period", trendType: "positive", subtext: "14 hits · 2 escalated" },
    { label: "Fraud Scans", value: "692", trend: "-2% vs last period", trendType: "neutral", subtext: "Fraud Bank: 38 new entries" },
    { label: "Cases Opened", value: "31", trend: "+8 vs last period", trendType: "warning", subtext: "9 open · 22 resolved" },
    { label: "SDK Flow Completions", value: "3,214", trend: "+18% vs last period", trendType: "positive", subtext: "Across 6 active SDK flows" },
    { label: "API Call Volume", value: "28,491", trend: "+5% vs last period", trendType: "positive", subtext: "99.7% uptime this period" },
  ],
  "Last 30 days": [
    { label: "Verifications Run", value: "7,291", trend: "+9% vs last period", trendType: "positive", subtext: "Across KYC, KYB, Background Check" },
    { label: "AML Screenings", value: "1,847", trend: "+6% vs last period", trendType: "positive", subtext: "61 hits · 8 escalated" },
    { label: "Fraud Scans", value: "2,913", trend: "+11% vs last period", trendType: "positive", subtext: "Fraud Bank: 147 new entries" },
    { label: "Cases Opened", value: "124", trend: "+14 vs prior period", trendType: "warning", subtext: "38 open · 86 resolved" },
    { label: "SDK Flow Completions", value: "13,847", trend: "+24% vs last period", trendType: "positive", subtext: "Across 6 active SDK flows" },
    { label: "API Call Volume", value: "118,492", trend: "+8% vs last period", trendType: "positive", subtext: "99.6% uptime this period" },
  ],
  "This month": [
    { label: "Verifications Run", value: "7,291", trend: "+9% vs last period", trendType: "positive", subtext: "Across KYC, KYB, Background Check" },
    { label: "AML Screenings", value: "1,847", trend: "+6% vs last period", trendType: "positive", subtext: "61 hits · 8 escalated" },
    { label: "Fraud Scans", value: "2,913", trend: "+11% vs last period", trendType: "positive", subtext: "Fraud Bank: 147 new entries" },
    { label: "Cases Opened", value: "124", trend: "+14 vs prior period", trendType: "warning", subtext: "38 open · 86 resolved" },
    { label: "SDK Flow Completions", value: "13,847", trend: "+24% vs last period", trendType: "positive", subtext: "Across 6 active SDK flows" },
    { label: "API Call Volume", value: "118,492", trend: "+8% vs last period", trendType: "positive", subtext: "99.6% uptime this period" },
  ]
}
