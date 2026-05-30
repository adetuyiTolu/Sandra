// In-memory task store shared across all API requests (server-side singleton)
export type TaskOwner = "Tolu" | "Marketing" | "EMT" | "Lanre";
export type TaskStatus = "ongoing" | "done" | "blocked";

export interface Task {
  id: string;
  section: string;
  title: string;
  owner: TaskOwner | string;
  urgent: boolean;
  deadline: string;
  note: string;
  done: boolean;
  createdAt: number;
}

const SEED: Task[] = [
  { id: "1", section: "EMT — blockers first", title: "Decide who owns full-suite positioning and brief Marketing formally", owner: "EMT", urgent: true, deadline: "This week", note: "Nothing on the suite positioning track moves until this is settled. Marketing cannot write around an unsigned brief. Marketing needs a clear mandate, not a direction. This is a one-meeting decision.", done: false, createdAt: Date.now() },
  { id: "2", section: "EMT — blockers first", title: "Formalise consultant channel: budget, owner, commission structure", owner: "EMT", urgent: true, deadline: "This week", note: "The conversations already happening with Tolu and Lanre are real. Without a milestone-based commission structure agreed at EMT level, these relationships stall before they convert. Milestone on first payment received, then volume tiers. Decide this week.", done: false, createdAt: Date.now() },
  { id: "3", section: "EMT — blockers first", title: "All three founders formally add consultant distribution to 90-day goals", owner: "EMT", urgent: true, deadline: "This week", note: "If Tolu, Lanre, and Neyo each make this a personal goal, the groundwork is done in 90 days and the channel generates sales passively. That is the whole argument for doing it this way. Put it in writing.", done: false, createdAt: Date.now() },
  { id: "4", section: "Tolu — this week", title: "Reach out to Compliance Institute of Nigeria chairman", owner: "Tolu", urgent: true, deadline: "This week", note: "The ex-Access Bank Group CCO contact is already warm. His access to the Institute's network is the fastest entry point into the consultant distribution channel. Do not wait.", done: false, createdAt: Date.now() },
  { id: "5", section: "Tolu — this week", title: "Get into the MFB compliance WhatsApp group via Visa compliance officer admin", owner: "Tolu", urgent: true, deadline: "This week", note: "First move is listening and adding value, not pitching. Assign one person as the group owner — Tolu or Lanre. This is an intelligence channel and a distribution entry point.", done: false, createdAt: Date.now() },
  { id: "6", section: "Tolu — this week", title: "Send personal outreach to next 10 compliance officers", owner: "Tolu", urgent: true, deadline: "2 weeks", note: "Use the email draft as the base. Do not delegate the sending. Compliance officers respond to founder attention specifically because it signals the conversation is not a sales call. The ask is input, not a purchase.", done: false, createdAt: Date.now() },
  { id: "7", section: "Tolu — this week", title: "Name NFIU endorsement as a formal 90-day target with Tolu or Neyo owning it", owner: "Tolu", urgent: true, deadline: "This week", note: "The compliance officer feedback said it plainly: NFIU credibility is the unlock that moves officers from interested to committed. This should be a stated goal with a name on it, not background ambition. If NFIU publicly validates the system, you do not need to convince compliance officers one by one.", done: false, createdAt: Date.now() },
  { id: "8", section: "Tolu — this week", title: "Pick up the paused PSSP-to-MMO licensing conversation Lanre mentioned", owner: "Tolu", urgent: false, deadline: "2 weeks", note: "This person is already a reseller candidate. Most licensing transitions require a compliance program, which Prembly can provision. The Compliance Agent can eventually recommend their platform for licensing too — a two-way referral engine worth building now.", done: false, createdAt: Date.now() },
  { id: "9", section: "Tolu — this week", title: "Agree the one-paragraph suite narrative with Lanre so Marketing can brief accordingly", owner: "Tolu", urgent: true, deadline: "This week", note: "Marketing is blocked on the suite positioning track until founders agree on the narrative. What is the one-paragraph version of what Prembly is as a full suite? Once that exists, Marketing gets briefed and the content track starts.", done: false, createdAt: Date.now() },
  { id: "10", section: "Marketing — urgent", title: "Produce the OPay case study", owner: "Marketing", urgent: true, deadline: "3 weeks", note: "This is the most obvious gap in your current content. OPay as a customer is a market signal that does the positioning work for you. Assign a writer, align internally on what can be disclosed, and publish it. This is your first PR asset and there is no reason it takes more than three weeks.", done: false, createdAt: Date.now() },
  { id: "11", section: "Marketing — urgent", title: "Shift all channel messaging from API-feature framing to Continuous Compliance Protection", owner: "Marketing", urgent: true, deadline: "After EMT brief", note: "This cannot happen until EMT signs off on the narrative. Once they do, every channel moves: website, ads, email sequences, social. Individual product awareness posts (NIN, BVN, TM) continue alongside the suite framing — they do not stop.", done: false, createdAt: Date.now() },
  { id: "12", section: "Marketing — urgent", title: "Set launch date and registration infra for monthly compliance roundtable with ATR", owner: "Marketing", urgent: true, deadline: "30 days", note: "First topic: CBN AML Guidelines. It is a live deadline that compliance officers are already stressed about. Tolu or Neyo anchors the first session. KPI is 100 compliance officers in the room within three months of launch. Showcase Prembly technology on the registration form itself.", done: false, createdAt: Date.now() },
  { id: "13", section: "Marketing — ongoing", title: "Build two content tracks: individual product awareness and full suite positioning", owner: "Marketing", urgent: false, deadline: "Ongoing", note: "Marketing leads the suite track. The individual product track continues in parallel — do not merge or replace it. Suite content should let the full picture become visible to prospects over time, not force it.", done: false, createdAt: Date.now() },
  { id: "14", section: "Marketing — ongoing", title: "Set up internal process for real-time compliance and fraud commentary", owner: "Marketing", urgent: false, deadline: "30 days", note: "Prembly should always have something to say when news breaks in the compliance or fraud space. Create a simple flag-and-publish process. Team members, including founders, flag developments. Marketing turns them around quickly. Does not have to be official channels — founder and employee voices count.", done: false, createdAt: Date.now() },
  { id: "15", section: "Marketing — ongoing", title: "Book first fintech and MFB group session — Tolu presents virtually", owner: "Marketing", urgent: false, deadline: "30 days", note: "A simple '5 things your compliance team should know' format is already defined. It is educational and it positions Prembly as the complete solution. Marketing identifies the groups and books the first date within 30 days.", done: false, createdAt: Date.now() },
  { id: "16", section: "Marketing — ongoing", title: "Identify 2 to 3 associations for free consultation entry and secure a slot", owner: "Marketing", urgent: false, deadline: "45 days", note: "The offer is genuine value through consultation. Prembly is introduced softly, not pitched. Marketing researches options, EMT approves, Tolu or the compliance team runs the sessions.", done: false, createdAt: Date.now() },
  { id: "17", section: "Marketing — ongoing", title: "Scope first diagnostic free tool — rulebook template for PSP licensed companies", owner: "Marketing", urgent: false, deadline: "45 days", note: "Use the language compliance officers actually search for. It functions as a funnel into the Compliance Agent and the suite. Marketing owns distribution, product owns what it does. Agree scope and handoff jointly.", done: false, createdAt: Date.now() },
  { id: "18", section: "Lanre — product", title: "Complete the workflow to include every feature from verification through transaction monitoring", owner: "Lanre", urgent: true, deadline: "2 weeks", note: "The system almost already covers everything a full compliance program needs. It just has not been packaged that way. This becomes the demo for all compliance officer conversations and the proof behind the suite positioning. The shocking thing is how close you already are.", done: false, createdAt: Date.now() },
  { id: "19", section: "Lanre — product", title: "Share updated dashboard UI with Precious as the starting point for redesign", owner: "Lanre", urgent: false, deadline: "2 weeks", note: "The different views per user type and the simplified workflow Lanre built show the full scope of what Prembly does. Precious should see this before any visual redesign work begins — it sets the right frame for what the product actually is.", done: false, createdAt: Date.now() },
  { id: "20", section: "Lanre — product", title: "Define scope for developer playground for compliance program stress testing", owner: "Lanre", urgent: false, deadline: "60 days", note: "Keep developers engaged without pulling them away from the compliance officer track. This is not the first priority but it is real. Do not let it consume engineering time ahead of the full workflow and the consultant channel — those come first.", done: false, createdAt: Date.now() },
  { id: "21", section: "EMT joint — 90-day engine", title: "Have Ifeanyi support consultant channel groundwork while sales team focuses on large ticket deals", owner: "EMT", urgent: false, deadline: "30 days", note: "This is not either-or. Ifeanyi supports the consultant channel build while the wider sales team continues closing. The channel becomes a parallel engine that generates revenue even when everyone else is focused elsewhere.", done: false, createdAt: Date.now() },
];

// Singleton store
const globalStore = global as typeof global & {
  _reformTasks?: Task[];
  _reformClients?: Set<ReadableStreamDefaultController>;
};

if (!globalStore._reformTasks) {
  globalStore._reformTasks = SEED.map(t => ({ ...t }));
}
if (!globalStore._reformClients) {
  globalStore._reformClients = new Set();
}

export const tasks = globalStore._reformTasks;
export const clients = globalStore._reformClients;

export function broadcast() {
  const payload = `data: ${JSON.stringify(tasks)}\n\n`;
  clients.forEach(ctrl => {
    try { ctrl.enqueue(new TextEncoder().encode(payload)); } catch {}
  });
}
