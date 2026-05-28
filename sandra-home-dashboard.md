# Sandra AI — Home Dashboard Implementation Prompt

## Context

You are building the Home page for Prembly's Sandra AI workspace. This is
the first screen every operator sees when they log in. It serves two
simultaneous purposes: it is a Sandra AI briefing surface that reflects the
agentic layer, and it is a platform health dashboard that reflects the manual
tool layer your customers use daily.

The page must feel like a command center, not a metrics dump. Every element
earns its place by either requiring attention or communicating platform health
at a glance. Nothing decorative. Nothing that does not inform a decision.

Stack: Next.js 14 App Router, TypeScript strict mode, Tailwind CSS, shadcn/ui.
All data is mocked. No external API calls. Match the existing dark theme,
color tokens, spacing units, and component patterns already used in the
sidebar and Operations page.

---

## Page Layout

The page uses a two-column layout at 1440px viewport width.

Left column is 65% width. Right column is 35% width.
Both columns are independently scrollable if content exceeds viewport height.
The page has no horizontal scroll.

Page header sits above both columns, full width.

---

## Page Header

A full-width header bar directly below the top navigation.

Left side shows:
- Page title: "Home"
- Subtitle: Sandra's briefing timestamp — "Last updated 2 minutes ago"
  in muted small text

Right side shows:
- Date and time: current date, updated every minute
- A "Refresh Briefing" button using the existing secondary button style

The header has a subtle bottom border using the existing divider color token.
No background fill on the header. It inherits the page background.

---

## Left Column — Primary Content

### Block 1: Sandra's Briefing

This is the most important element on the entire page. It sits at the very
top of the left column and must command attention without being loud.

It is a card with a distinct left border accent in the brand teal color.
Inside the card:

Top row shows:
- A small animated pulse dot in teal (same style as Connected Agents dot
  in the sidebar)
- Label: "Sandra's Briefing" in small uppercase muted text
- Agent tags on the right: "Compliance Agent" and "Fraud Intelligence"
  as small chips with green dots, indicating which agents contributed
  to this briefing

Below that, the briefing text renders as a single paragraph of 3 to 5
sentences. Use this mock content:

"Since your last session, 14 new verification requests have entered the
Operations queue, 3 of which carry risk scores above 70 and require manual
review before end of day. The Fraud Intelligence Agent flagged a coordinated
transaction pattern across 3 linked accounts — this alert is unacknowledged
and marked critical. Your AML Configuration has 2 active rules that triggered
hits overnight against the NFIU watchlist. Compliance Agent notes that CBN's
updated KYC circular takes effect in 18 days — 4 of your active workflows
may require adjustment."

The briefing text uses a slightly larger font size than body text. Line height
is generous. It should feel like reading a morning briefing note, not scanning
a dashboard widget.

Below the briefing text, show three contextual action chips:
- "Review Operations Queue" — links to /operations
- "View Critical Alert" — links to /alerts
- "Check Compliance Impact" — links to /chat with pre-filled message

These chips use a ghost button style with a right arrow icon.

---

### Block 2: Attention Required

A section header "Attention Required" in the existing section label style.

Below it, a horizontal row of three priority cards. Each card represents
something that needs the operator's action today. Cards use the existing
card component with a colored top border indicating severity.

Card 1 — Critical (red top border):
- Icon: bell
- Label: "Unacknowledged Alert"
- Value: "1 Critical"
- Description: "Coordinated fraud pattern flagged by Fraud Intelligence Agent"
- Action button: "View Alert" links to /alerts

Card 2 — High (amber top border):
- Icon: clock
- Label: "Operations Queue"
- Value: "14 Pending"
- Description: "3 items above risk score 70 require review today"
- Action button: "Open Queue" links to /operations

Card 3 — Medium (yellow top border):
- Icon: shield
- Label: "Compliance Deadline"
- Value: "18 Days"
- Description: "CBN KYC circular update affects 4 active workflows"
- Action button: "Ask Sandra" links to /chat

If there is nothing requiring attention, this block shows a single card
with a green border:
- Label: "All Clear"
- Description: "No critical items require your attention right now"
- Sandra attribution line: "Sandra checked all queues and agents 2 minutes ago"

---

### Block 3: Platform Activity

A section header "Platform Activity" with a date range selector on the right
showing "Last 7 days" as default. The selector uses the existing dropdown
component. Options: Today, Last 7 days, Last 30 days, This month.

Below the header, a grid of metric cards in two rows of three.

Row 1 — Verification activity:

Metric 1:
- Label: "Verifications Run"
- Value: "1,847"
- Trend: "+12% vs last period" in green
- Subtext: "Across KYC, KYB, Background Check"

Metric 2:
- Label: "AML Screenings"
- Value: "423"
- Trend: "+3% vs last period" in green
- Subtext: "14 hits · 2 escalated"

Metric 3:
- Label: "Fraud Scans"
- Value: "692"
- Trend: "-2% vs last period" in muted (neutral, not red)
- Subtext: "Fraud Bank: 38 new entries"

Row 2 — Operations activity:

Metric 4:
- Label: "Cases Opened"
- Value: "31"
- Trend: "+8 vs last period" in amber
- Subtext: "9 open · 22 resolved"

Metric 5:
- Label: "SDK Flow Completions"
- Value: "3,214"
- Trend: "+18% vs last period" in green
- Subtext: "Across 6 active SDK flows"

Metric 6:
- Label: "API Call Volume"
- Value: "28,491"
- Trend: "+5% vs last period" in green
- Subtext: "99.7% uptime this period"

Each metric card uses the existing card component. Values are in large bold
text. Trend indicators use the existing badge component. Subtext uses muted
small text. No charts inside these cards. Numbers only.

---

### Block 4: Recent Activity Feed

A section header "Recent Activity" with a "View All" link on the right
that links to /reports/verification-reports.

A vertical feed of the 8 most recent platform events. Each feed item shows:
- A small icon indicating event type (verification, alert, case, fraud)
- Event description in normal text
- Entity name in slightly bolder text
- Timestamp in muted small text on the right
- A source tag: "Dashboard", "API", "SDK", or "Sandra" indicating
  what triggered the event

Mock feed data:
1. KYC verification completed · Adebayo Olamide Fasanya · 4 min ago · API
2. Critical alert raised · Multiple Linked Accounts (ALT-2024-00091) · 12 min ago · Sandra
3. Case opened · Greenfield Commodity Trading Ltd · 34 min ago · Sandra
4. AML hit · Greenfield Commodity Trading Ltd · 34 min ago · Dashboard
5. Background check completed · Chidinma Okonkwo · 1 hr ago · SDK
6. Fraud rule triggered · Velocity threshold breach · 2 hrs ago · Sandra
7. KYB verification completed · Novacrust Technologies Ltd · 3 hrs ago · API
8. Case resolved · Adeyemi Bakare (CM-2024-0087) · 5 hrs ago · Dashboard

Feed items tagged "Sandra" use the teal brand color on the source tag.
All other source tags use the existing muted badge style.

The feed shows 8 items only. No pagination on the home page. "View All"
links to full history.

---

## Right Column — Secondary Content

### Block 5: Agent Status

A section header "Connected Agents".

Two agent status cards stacked vertically. Each card shows:

Compliance Agent card:
- Green pulse dot on the left
- Agent name: "Compliance Agent" in normal weight
- Status line: "Operational · Last query 4 min ago"
- Jurisdiction tags: NG · KE · US · EU as small chips
- A single stat: "47 queries today"
- A "Query Agent" button linking to /chat

Fraud Intelligence Agent card:
- Green pulse dot on the left
- Agent name: "Fraud Intelligence" in normal weight
- Status line: "Operational · Last scan 12 min ago"
- Capability tags: "Pattern analysis · Bank graph" in muted small text
- A single stat: "3 alerts raised today"
- A "View Alerts" button linking to /alerts

Agent health states:
- Nominal: green dot · "Operational"
- Degraded: yellow dot · "Degraded · Responding slowly"
- Disconnected: red dot · "Disconnected · Sandra operating without this agent"
  Hide the action button. Show a "Check Status" link to /api-status instead.

---

### Block 6: Operations Snapshot

A section header "Operations Queue" with a "Go to Operations" link on
the right linking to /operations.

A compact vertical list showing queue status across all four queues.
Each queue row shows:
- Queue name
- Item count as a bold number
- A colored dot: red if any item is critical, amber if items are pending
  more than 24 hours, green if all items are recent
- A mini progress bar showing the ratio of high-risk to normal items

Queue rows:
- KYC Queue · 14 items · amber dot
- AML Queue · 3 items · red dot
- Case Queue · 7 items · amber dot
- Fraud Alerts · 5 items · red dot

Below the list, a single summary line in muted small text:
"Sandra has pre-assessed all 29 items. 4 require urgent attention."

---

### Block 7: Customer 360 Snapshot

A section header "Customer 360" with a "View All Customers" link on
the right linking to /customer-360.

Three summary stats in a row:
- Total Enrolled: 2,847
- Avg Risk Score: 34 (shown with a small color-coded indicator)
- New This Week: +127

Below the stats, a compact list of the 5 most recently active customer
profiles. Each row shows:
- Customer name
- Customer type tag: Individual or Business
- Risk score badge (green below 40, amber 40-70, red above 70)
- Last activity timestamp

Mock data:
1. Greenfield Commodity Trading Ltd · Business · Risk: 72 · 34 min ago
2. Adebayo Olamide Fasanya · Individual · Risk: 68 · 1 hr ago
3. Chidinma Okonkwo · Individual · Risk: 21 · 2 hrs ago
4. Novacrust Technologies Ltd · Business · Risk: 15 · 3 hrs ago
5. Emeka Chukwuemeka · Individual · Risk: 45 · 5 hrs ago

Clicking any row navigates to /customer-360/[id].
Mock IDs: greenfield-001, fasanya-002, okonkwo-003, novacrust-004,
chukwuemeka-005.

---

### Block 8: Billing Snapshot

A section header "Billing" with a "View Details" link on the right
linking to /reports/billing.

A compact card showing:
- Current billing period: "May 1 — May 31, 2026"
- Amount used: "₦847,200" in large bold text
- Credit remaining: "₦152,800 remaining" in muted text
- A linear progress bar showing 85% usage. Color shifts to amber above
  80% and red above 95%.

Below the progress bar, a three-row breakdown:
- Verification API calls · 12,847 calls · ₦641,000
- SDK Flow completions · 3,214 completions · ₦160,700
- AML Screenings · 423 screenings · ₦45,500

Each row uses small text. Values are right-aligned.

A note below in muted extra-small text:
"Next billing date: June 1, 2026"

---

### Block 9: Workflow Health

A section header "Active Workflows" with a "Manage" link on the right
linking to /workflows.

A compact list of active workflows. Each row shows:
- Workflow name
- Step count in muted small text
- Status badge: Active, Paused, or Needs Review
- Completion count for the current period

Mock data:
1. Tier 1 Individual Onboarding · 5 steps · Active · 1,847 completions
2. Business KYB Standard · 4 steps · Active · 203 completions
3. High Risk EDD Flow · 7 steps · Needs Review · 12 completions
4. SDK Lite Verification · 3 steps · Active · 3,214 completions

"Needs Review" status uses amber color. Clicking a row navigates to
that workflow in /workflows.

If any workflow has "Needs Review" status, show a note at the bottom
in muted small text:
"1 workflow may be affected by upcoming CBN regulatory changes.
Ask Sandra for details."
The words "Ask Sandra" link to /chat with the compliance question
pre-filled as a query parameter.

---

## Interaction Rules

### Sandra-attributed Actions

Every "Ask Sandra" link or chip across the entire page pre-fills the
Chat input using a query parameter: /chat?prefill=your+message+here.
The Chat page reads this parameter on mount and populates the input.
Use encodeURIComponent on the prefill string.

Pre-fill values by location:
- Briefing "Check Compliance Impact" chip:
  "What workflows are affected by the CBN KYC circular update?"
- Attention Required Card 3 "Ask Sandra":
  "Show me which workflows need to be updated for the CBN circular"
- Workflow Health "Ask Sandra" note:
  "Which of my active workflows are affected by upcoming CBN changes?"

### Refresh Briefing

The "Refresh Briefing" button in the page header triggers a re-render
of Block 1 only. Show a 1.5 second skeleton loading state on the
briefing card then reveal the mock content. Do not reload the page.
Do not refetch any other block.

### Date Range Selector

Changing the date range in Block 3 updates all six metric values and
trend indicators in that block only. Use these mock value sets:

Today:
- Verifications: 247, +4%, "Across KYC, KYB, Background Check"
- AML Screenings: 58, +1%, "2 hits · 0 escalated"
- Fraud Scans: 94, -1%, "Fraud Bank: 5 new entries"
- Cases Opened: 4, "+1 vs yesterday", "2 open · 2 resolved"
- SDK Flow Completions: 431, +22%, "Across 6 active SDK flows"
- API Call Volume: 3,847, +3%, "99.9% uptime today"

Last 30 days:
- Verifications: 7,291, +9%, "Across KYC, KYB, Background Check"
- AML Screenings: 1,847, +6%, "61 hits · 8 escalated"
- Fraud Scans: 2,913, +11%, "Fraud Bank: 147 new entries"
- Cases Opened: 124, "+14 vs prior period", "38 open · 86 resolved"
- SDK Flow Completions: 13,847, +24%, "Across 6 active SDK flows"
- API Call Volume: 118,492, +8%, "99.6% uptime this period"

This month: use the same values as Last 30 days.

---

## Loading and Empty States

### Loading State

On page load, all blocks render skeleton loaders simultaneously.
Use the existing skeleton component throughout.
Do not stagger block loading. Everything loads and reveals together.

Skeleton specifications per block:
- Block 1 (Briefing): 4 lines of text-width skeletons, 1 short row
  for the action chips
- Block 2 (Attention): 3 card skeletons side by side, each with a
  large value skeleton and two smaller line skeletons
- Block 3 (Activity): 6 metric card skeletons in a 2x3 grid
- Block 4 (Feed): 8 single-line skeletons with a small circle on
  the left and a short rectangle on the right
- Block 5 (Agents): 2 card skeletons stacked
- Block 6 (Operations): 4 single-row skeletons
- Block 7 (Customer 360): 3 stat skeletons then 5 row skeletons
- Block 8 (Billing): 1 large value skeleton, 1 bar skeleton,
  3 row skeletons
- Block 9 (Workflows): 4 row skeletons

### Empty States

Operations queues all empty:
Block 6 shows: "All queues are clear. Sandra is monitoring for
new items."

No agents connected:
Block 5 shows: "No agents connected. Sandra is operating in manual
mode. Some features are unavailable." with a link to /settings.

No customers enrolled:
Block 7 shows: "No customers enrolled yet. Customers appear here
once they complete a verification flow."

No recent activity:
Block 4 shows: "No activity yet. Platform events will appear here
as your team and customers use Prembly."

No active workflows:
Block 9 shows: "No active workflows. Create your first workflow in
Configure." with a link to /workflows.

---

## Responsive Behavior

At viewport widths below 1280px, the two-column layout collapses
to a single column. Right column blocks stack below left column
blocks in this order:
1. Sandra's Briefing
2. Attention Required
3. Agent Status
4. Operations Snapshot
5. Platform Activity
6. Customer 360 Snapshot
7. Recent Activity Feed
8. Billing Snapshot
9. Workflow Health

At viewport widths below 768px, metric cards in Block 3 go from
a 2x3 grid to a 1x6 stack.

---

## Visual Language for Sandra-attributed Elements

Use the existing teal brand accent color consistently for every
element on the page that was produced by Sandra or her agents.
This applies to:
- The briefing card left border accent
- The pulse dot in the briefing header
- The "Sandra" source tag in the activity feed
- All "Ask Sandra" chips, links, and buttons
- Agent status dots when operational
- Any stat or summary line attributed to Sandra

This is a deliberate visual system. It trains operators to associate
that color with Sandra's intelligence layer across the entire product,
not just this page.

---

## File Structure

Page component:
app/home/page.tsx

Child components (create all in components/home/):
- SandraBriefing.tsx
- AttentionRequired.tsx
- PlatformActivity.tsx
- RecentActivityFeed.tsx
- AgentStatusPanel.tsx
- OperationsSnapshot.tsx
- Customer360Snapshot.tsx
- BillingSnapshot.tsx
- WorkflowHealth.tsx

Mock data (create in lib/mock/):
- home.ts — exports all mock data used across home page components

The page component at app/home/page.tsx imports and composes all
child components. Each component manages its own loading state and
empty state internally using the existing skeleton and empty state
patterns in the codebase.

---

## What Not To Touch

Do not modify:
- The sidebar component or its navigation structure
- Any existing page components outside of home
- Global styles or theme configuration
- Any existing shared components not referenced above
- The top navigation bar
- Any routing configuration outside of the home route

Scope is strictly the Home page at app/home/page.tsx and its child
components under components/home/.
