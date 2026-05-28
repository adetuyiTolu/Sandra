# Sandra AI Sidebar Navigation — Restructure Prompt

## Context

You are updating the sidebar navigation of an existing Next.js dashboard
application. The current sidebar is already built with icons, active states,
badge indicators, collapsible sections, and a Connected Agents panel at the
bottom. You are NOT rebuilding the sidebar from scratch. You are restructuring
the navigation items, adding new sections, and making specific items
collapsible while preserving every existing UI pattern, icon style, spacing
unit, color token, and component behavior already in the codebase.

Do not change:
- Icon library or icon style
- Color tokens or theme variables
- Font sizes or font weights
- Spacing units or padding values
- Active state highlight behavior
- Badge/notification pill component
- Transition or animation timing
- The overall sidebar width

---

## New Navigation Structure

Implement the following structure exactly as specified. Section headers are
labels only, not clickable nav items. Items marked [COLLAPSIBLE] expand and
collapse on click. Items marked [BADGE] carry a notification count indicator
using the existing badge component. Items marked [FLAT] are direct nav links
with no children.

### Top Level

```
PREMBLY                           — existing logo + wordmark, no change
Sandra AI workspace               — existing subtitle, no change

[FLAT] Home                       — top level, outside all sections
```

### SANDRA Section

```
── SANDRA ──────────────────────  — section label, not clickable

[FLAT]         Chat
[FLAT]         Operations
[FLAT + BADGE] Alerts             — badge shows unread agent alert count
[FLAT]         Customer 360

[COLLAPSIBLE]  ● Connected Agents  {count}
                 ● Compliance Agent
                   NG · KE · US · EU
                 ● Fraud Intelligence
                   Pattern analysis · bank graph
```

### CONFIGURE Section

```
── CONFIGURE ───────────────────  — section label, not clickable

[FLAT]         Workflows
[FLAT]         SDK Flow

[COLLAPSIBLE]  Fraud Rules
                 Rules
                 Escalation Configs

[COLLAPSIBLE]  AML Configuration
                 Rules
                 Rule Groups
                 Scoring Threshold
                 Upload Records
```

### TOOLS Section

```
── TOOLS ───────────────────────  — section label, not clickable

[COLLAPSIBLE]  Verification
                 Verifications
                 Background Check

[COLLAPSIBLE]  Fraud Detection
                 Fraud Bank
                 Fraud Scan
                 [COLLAPSIBLE] Transaction Monitoring
                                 Overview
                                 History
                                 Data

[COLLAPSIBLE]  Case Management
                 Overview
                 Cases

[COLLAPSIBLE]  Reports & Finance
                 Verification Reports
                 SDK Reports
                 Billing
```

### PLATFORM Section

```
── PLATFORM ────────────────────  — section label, not clickable

[FLAT]         API Integrations
[FLAT]         API Status
```

### Bottom Anchors

```
────────────────────────────────

[FLAT]         Settings           — bottom anchor, existing icon
[FLAT]         Logout             — bottom anchor, text only or icon
```

---

## Collapsible Behavior Rules

**Connected Agents** — collapsed by default. Shows a single row with a
colored status dot, the label "Connected Agents", and the active agent count.
The status dot color reflects the health of all connected agents: green if all
nominal, yellow if any agent is degraded, red if any agent is disconnected.
When expanded, shows each agent on its own row with its own green dot, agent
name, and capability tags below in smaller muted text. Use the existing
collapsible pattern already in the codebase. Chevron rotates on expand.

**Fraud Rules** — collapsed by default. No count indicator needed.

**AML Configuration** — collapsed by default. No count indicator needed.

**Verification** — collapsed by default. No count indicator needed.

**Fraud Detection** — collapsed by default. Transaction Monitoring is a nested
collapsible inside Fraud Detection. It follows the same collapsible pattern at
one indent level deeper. Collapsed by default.

**Case Management** — collapsed by default. No count indicator needed.

**Reports & Finance** — collapsed by default. No count indicator needed.

All other items are flat nav links, not collapsible.

---

## Space Management Rules

The sidebar must remain scrollable when content exceeds viewport height. The
following elements are always visible regardless of scroll position:

- PREMBLY logo and Sandra AI workspace subtitle at the top
- Settings and Logout anchored at the bottom

Everything between those two anchors scrolls. Use the existing scroll
container pattern already in the codebase. Do not introduce a new scroll
implementation.

Section labels (SANDRA, CONFIGURE, TOOLS, PLATFORM) use the existing muted
uppercase small text style already used for section headers in the current
sidebar. Add top margin above each section label consistent with existing
section spacing.

Connected Agents when expanded should not push Settings and Logout off screen
on a standard 900px height viewport with all other sections collapsed. If it
does, reduce the line height of the agent capability tags, not the agent name
row.

---

## Items Removed From Current Structure

The following items exist in the current sidebar and must be removed:

- "Tool Mesh" label and its children as currently structured. The tools it
  contained are reorganized into the new TOOLS section above.
- The existing Connected Agents panel in its current position. It moves into
  the SANDRA section as a collapsible item as specified above.
- Any standalone "Agent" nav item currently in the Tool Mesh list.
- Any standalone "Finance" nav item currently in the Tool Mesh list.

Do not delete the components for these items. Only remove them from the
navigation render. The components may be reused in their new positions.

---

## Items Added That Do Not Currently Exist

The following nav items are new and need to be created using the existing nav
item component pattern:

- Home (flat nav link, top level)
- Customer 360 (flat nav link, SANDRA section)
- Workflows (flat nav link, CONFIGURE section)
- SDK Flow (flat nav link, CONFIGURE section)
- Fraud Rules collapsible with children: Rules, Escalation Configs
- AML Configuration collapsible with children: Rules, Rule Groups,
  Scoring Threshold, Upload Records
- Transaction Monitoring nested collapsible with children: Overview,
  History, Data
- Verification Reports (child of Reports & Finance)
- SDK Reports (child of Reports & Finance)
- API Integrations (flat nav link, PLATFORM section)
- API Status (flat nav link, PLATFORM section)
- Logout (bottom anchor)

For each new item, use the closest existing nav item as the pattern. Match
icon style, padding, font size, and active state exactly. If an appropriate
icon does not exist in the current icon set for a new item, use the most
semantically appropriate available icon rather than importing a new one.

---

## Active State and Routing

Active state highlight behavior does not change. Whichever nav item matches
the current route receives the existing active highlight.

When a user navigates to a child route inside a collapsed section, that
section auto-expands to reveal the active child item. This is existing
behavior for the current collapsible items. Apply the same behavior to all
new collapsible sections.

---

## What Not To Touch

Do not modify any of the following:
- Page components or route files
- Any component outside the sidebar
- Global styles or theme configuration
- Icon imports already in use
- The sidebar width or its responsive behavior
- Any existing prop interfaces on shared components

Scope of this task is strictly the sidebar navigation structure, collapsible
behavior, and section organization as specified above.
