# Sandra AI — Architecture

## Overview
Sandra AI is an intelligent orchestration layer built on top of Prembly's verification, fraud, and compliance APIs. It solves the fragmentation problem in modern compliance operations: instead of operators switching between five different dashboards to verify an identity, check an AML watchlist, review a fraud scan, cross-reference a regulation, and open a case, Sandra unifies all these capabilities into a single conversational surface.

The core architectural decision is that Sandra is an orchestration layer, not just a chatbot with dashboard access. Sandra does not merely execute commands; it reasons about intent, constructs tool plans, delegates complex regulatory questions to specialized sub-agents, retrieves context from entity memory, and synthesizes the results. Every response Sandra provides is grounded in real API data, and the system is designed to "show its work" by exposing the tool call trace to the operator.

## System Layers

1. **Intent Router**
   - **Location:** `/lib/intent-router.ts`
   - **How it works:** Uses O(1) string matching (keywords) to classify the cognitive mode of a user's message before any LLM tool selection happens.
   - **Why it exists before the model:** It serves as a cheap, fast gate to route the model effectively and prevent unnecessary token costs. It prevents the model from hallucinating regulatory answers from its base training data by ensuring REASONING intents always trigger specialized agents.
   - **Intent Types:**
     - `REASONING`: Complex synthesis requiring regulatory context. Invokes specialist agents.
     - `ACTION`: Modifies state (e.g., creating a case, approving KYC). Must be logged for audit purposes.
     - `RETRIEVAL`: Read-only data fetching. Safe and fast.
     - `ALERT`: Used when Sandra proactively pushes an insight.

2. **Tool Mesh**
   - **Locations:** `/lib/tools/registry.ts` (definitions) and `/lib/tools/executors.ts` (implementations)
   - **Definition vs Executor:** The registry defines the interface (name, description, parameters) for the orchestration model, while executors define the actual implementation (what happens when the tool is called).
   - **Registry Pattern:** The tools are decoupled from their implementation. In production, updating the Prembly API endpoints requires changing the executors, not the registry the model uses to reason.
   - **Description Quality:** Tool descriptions use imperative sentences (e.g., "Screen an entity against AML watchlists") instead of nouns because they act as prompts instructing the model *when* to use the tool, not just describing what it is.
   - **Categories:** Verification (Identity/AML), Fraud (Intelligence/Scans), Case (Management/Ticketing), Finance (Billing/Telemetry), Agent (Specialist Sub-agents).

3. **Agent Connections**
   - **How they are registered:** The Compliance Agent and Fraud Intelligence Agent are registered as tools within the Tool Mesh. From the orchestration model's perspective, they look exactly like REST API endpoints.
   - **Input/Output Contract:** Inputs are questions and contexts (e.g., `{ question, jurisdictions }`). Outputs are structured answers with confidence scores and citations.
   - **Why Sandra doesn't rebuild them:** Sandra is an orchestrator. Building deep RAG pipelines for regulatory texts is complex. By treating agents as external tools, Sandra delegates deep specialist tasks to external services built specifically for that domain, making the architecture modular and swappable.

4. **Memory Architecture**
   - **Session Memory:** Stores the context of the current conversation. Located in UI state (`ChatWindow.tsx`). Never persisted; lost on refresh. Used for conversational coherence.
   - **Entity Memory:** Stores what Sandra knows about entities (BVNs, names, businesses). Located in `/lib/memory/entity-store.ts`. Retrieved *before* a response is formed to ensure Sandra has historical context. In production, this would be a Supabase query against the Prembly graph database.
   - **Decision Memory:** An append-only audit log of actions taken. Located in `/lib/memory/decision-log.ts`. Written when `ACTION` intents are executed. In production, this maps to an immutable compliance audit table (e.g., Supabase Postgres with row-level security).

5. **Interface Layer**
   - **Conversational (Chat):** `/components/chat/*`. Free-form interaction with Sandra.
   - **Operational (Operations):** `/components/operations/*`. High-volume queue management where Sandra's pre-computed recommendations are displayed inline.
   - **Alert-focused (Alerts):** `/components/alerts/*`. Proactive monitoring where Sandra surfaces critical findings and exposes its entire reasoning chain.
   - **Shared API:** All three interfaces rely on the same underlying Sandra API (`/app/api/sandra/route.ts`), displaying the same data through different operational lenses.

## Request Lifecycle

Example: User sends "Is it legal for a Nigerian business to receive EU payments?" (REASONING intent)

1. **Request Received:** `ChatWindow` sends a POST request to `/app/api/sandra/route.ts` with the message.
2. **Intent Classification:** `simulateResponse` (in `/lib/mock-engine.ts`) calls `routeIntent(message)` (in `/lib/intent-router.ts`). It detects "legal" and "EU" and returns `"REASONING"`.
3. **Scenario Matching:** `matchScenario(message)` selects the `eu_ng_payment_legality` workflow.
4. **Entity Memory Retrieval:** No specific memory entity is identified (`isMemoryEntity` returns false).
5. **Agent Invocation:** The scenario function calls `queryComplianceAgent("legal for Nigerian business to receive EU payments", "NG,EU")` (in `/lib/agents/compliance.ts`).
6. **Response Synthesis:** The scenario builds a `SandraResponse` containing the agent's answer, regulatory citations, confidence score, and the `query_compliance_agent` tool call trace.
7. **SSE Streaming:** `buildSSEStream` (in `/lib/mock-engine.ts`) streams the events to the client:
   - `tool_start` (query_compliance_agent)
   - `tool_end` (simulated delay of ~1.8s)
   - `agent_invoked`
   - `token` (streams the markdown answer word-by-word)
   - `component` (sends the `compliance_answer` structured data)
   - `done`

## Tool Registry Reference

| Tool Name | Category | Prembly API Equivalent | Which Interface Uses It |
| :--- | :--- | :--- | :--- |
| `run_kyc_verification` | Verification | `POST /v2/nigeria/individual` | Chat, Operations |
| `get_kyc_result` | Verification | `GET /v2/verification/{id}` | Chat, Operations |
| `list_verification_requests` | Verification | `GET /v2/verifications?status=PENDING` | Chat, Operations |
| `run_kyb_verification` | Verification | `POST /v2/nigeria/cac` | Chat |
| `run_aml_screening` | Verification | `POST /v2/aml/screen` | Chat, Alerts |
| `run_background_check` | Verification | `POST /v2/background` | Chat |
| `query_fraud_bank` | Fraud | `POST /v2/fraud/check` | Chat |
| `run_fraud_scan` | Fraud | `POST /v2/fraud/scan` | Chat |
| `get_flagged_alerts` | Fraud | `GET /v2/alerts` | Chat, Alerts |
| `update_alert_status` | Fraud | `PATCH /v2/alerts/{id}` | Chat, Alerts |
| `get_transaction_history` | Fraud | `GET /v2/transactions/{identifier}` | Chat |
| `create_rule` | Fraud | `POST /v2/rules` | Chat |
| `update_rule` | Fraud | `PATCH /v2/rules/{id}` | Chat |
| `get_escalation_configs` | Fraud | `GET /v2/escalation-config` | Chat |
| `create_case` | Case | `POST /v2/cases` | Chat, Alerts |
| `get_case` | Case | `GET /v2/cases/{id}` | Chat, Alerts |
| `update_case_status` | Case | `PATCH /v2/cases/{id}/status` | Chat, Alerts |
| `assign_case` | Case | `PATCH /v2/cases/{id}/assignee` | Chat, Alerts |
| `list_cases` | Case | `GET /v2/cases` | Chat, Alerts |
| `get_billing_summary` | Finance | `GET /v2/billing/summary` | Chat |
| `get_sdk_reports` | Finance | `GET /v2/sdk/reports` | Chat |
| `get_reports` | Finance | `GET /v2/reports` | Chat |
| `query_compliance_agent` | Agent | Deployed RAG Service | Chat, Alerts |
| `query_fraud_agent` | Agent | Deployed Fraud ML Service | Chat, Alerts |

## Data Flow Diagram

```text
[ User Input ] (Message String)
       |
       v
[ Intent Router ] --- (Intent Type: REASONING | ACTION | RETRIEVAL)
       |
       v
[ Scenario/Tool Planner ] ---> (Memory Query) ---> [ Entity Memory ]
       |                                                |
       | (Tool Execution Plan)                          | (Entity Context)
       v                                                v
[ Tool Mesh ] <-----------------------------------------+
   |      |
   |      +---> [ Agent Layer (Compliance / Fraud) ]
   |            (Structured Answers + Citations)
   v
(Raw JSON Responses)
   |
   v
[ Response Synthesis ]
   |
   +---> [ Decision Log ] (If Intent == ACTION)
   |
   v
(SSE Stream: Tool Traces, Tokens, Components)
   |
   v
[ UI Component Layer ] (ChatBubble / ReasoningPanel / StructuredResult)
```

## File Reference

### /app
- `layout.tsx`: Root layout providing global context providers like DemoMode.
- `page.tsx`: Main landing redirect to the chat interface.
- `/chat/page.tsx`: Conversational interface view.
- `/operations/page.tsx`: Queue management operational view.
- `/alerts/page.tsx`: Proactive monitoring feed view.
- `/api/sandra/route.ts`: Core API endpoint managing the full Sandra request lifecycle and SSE streaming.

### /components/alerts
- `AlertCard.tsx`: [ALERT-FOCUSED] Interactive feed item for proactive fraud/compliance alerts.
- `ReasoningPanel.tsx`: [ALERT-FOCUSED] Surface showing Sandra's 5-step reasoning chain for a specific alert.

### /components/chat
- `ChatWindow.tsx`: [CONVERSATIONAL] Core SSE consumer maintaining session memory and streaming message state.
- `MessageBubble.tsx`: [CONVERSATIONAL] Renders Sandra's streaming text, tool traces, and structured components.
- `StructuredResult.tsx`: [CONVERSATIONAL/OPERATIONAL] Component dispatcher converting SSE JSON payloads into rich React cards.
- `ToolCallTrace.tsx`: [CONVERSATIONAL/OPERATIONAL] Transparency layer displaying the exact tools Sandra invoked.

### /components/layout
- `SandraHeader.tsx`: [LAYOUT] Global page header containing the Demo Mode gateway.
- `Sidebar.tsx`: [LAYOUT] Global navigation spine generating dynamic Tool Mesh categories from the registry.

### /components/operations
- `AISummaryBadge.tsx`: [OPERATIONAL] Reusable badge for Sandra's AI recommendations (Approve/Reject).
- `ItemCard.tsx`: [OPERATIONAL] Individual KYC/KYB queue item displaying Sandra's inline pre-assessment.
- `QueuePanel.tsx`: [OPERATIONAL] Work queue navigator showing static queue counts and urgencies.

### /components/shared
- `AgentStatusBar.tsx`: [SHARED] Persistent footer showing live system state and indexed entity counts.
- `DemoMode.tsx`: [SHARED] Floating widget guiding presenters through the 8 demo steps.
- `MemoryIndicator.tsx`: [SHARED] Badge signaling that Sandra utilized prior entity context.

### /lib
- `intent-router.ts`: First-pass intent classifier mapping user input to cognitive modes.
- `mock-engine.ts`: The simulated orchestration engine driving tool execution and SSE streaming.
- `types.ts`: Global TypeScript definitions for system data structures and API contracts.
- `demo-context.tsx`: React Context managing the guided demo tour state.

### /lib/agents
- `compliance.ts`: Mock implementation of the Compliance Agent RAG pipeline.
- `fraud.ts`: Mock implementation of the Fraud Intelligence Agent.

### /lib/memory
- `decision-log.ts`: Append-only session storage tracking automated actions and operator decisions.
- `entity-store.ts`: In-memory datastore containing 847 deterministically seeded entities for pre-response context.

### /lib/tools
- `executors.ts`: Implementation functions serving as the boundary between Sandra and Prembly's APIs.
- `registry.ts`: The Tool Mesh metadata definitions used by the orchestration layer.

## Production Delta

To transition this demo to a production environment, the following architectural shifts would occur:

1. **Executors Become Network Calls:** The synchronous, hardcoded functions in `executors.ts` would become authenticated `fetch` or SDK calls to Prembly's live REST API endpoints.
2. **In-Memory Stores Become Supabase:** `entity-store.ts` and `decision-log.ts` would be replaced by Supabase Postgres queries. Entity memory would utilize `pgvector` for semantic entity matching, and the decision log would write to a persistent audit table with row-level security.
3. **Simulated Streaming Becomes Real Streaming:** The `simulateResponse` function in `mock-engine.ts` would be replaced by the Vercel AI SDK or direct calls to Anthropic's Claude 3 API, translating real LLM tool-calling tokens into our SSE format.
4. **Agent Mocks Become Deployed Services:** The local mock agent functions would be replaced by HTTP requests to separate Python/LangChain microservices managing real RAG document retrieval and embedding search.
5. **Intent Routing Becomes a Fast Model:** The string-matching keyword logic in `intent-router.ts` would likely be upgraded to a fast, cheap classification model (e.g., Claude Haiku or an edge-deployed classifier) to handle nuances in language.
