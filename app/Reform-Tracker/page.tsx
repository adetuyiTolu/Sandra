"use client"

import { useState, useEffect, useRef } from "react"
import { Check, ChevronDown, ChevronUp, Plus, Sparkles, X, AlertCircle, Loader2, Zap, Users, Clock, CheckCircle2, Circle, Trash2, Edit2 } from "lucide-react"
import type { Task } from "@/lib/reform-store"

type Filter = "all" | "Tolu" | "Marketing" | "EMT" | "Lanre" | "urgent"


const OWNER_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Tolu:      { bg: "bg-indigo-500/15", text: "text-indigo-300", border: "border-indigo-500/30" },
  Marketing: { bg: "bg-teal-500/15",   text: "text-teal-300",   border: "border-teal-500/30" },
  EMT:       { bg: "bg-amber-500/15",  text: "text-amber-300",  border: "border-amber-500/30" },
  Lanre:     { bg: "bg-sky-500/15",    text: "text-sky-300",    border: "border-sky-500/30" },
}

function OwnerBadge({ owner }: { owner: string }) {
  const s = OWNER_STYLES[owner] || { bg: "bg-white/10", text: "text-white/60", border: "border-white/20" }
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      {owner}
    </span>
  )
}

function TaskCard({
  task,
  onToggle,
  onDelete,
  onUpdate,
}: {
  task: Task
  onToggle: () => void
  onDelete: () => void
  onUpdate: (t: Partial<Task>) => void
}) {
  const [noteOpen, setNoteOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)

  const handleEdit = () => {
    onUpdate({ title: editTitle })
    setEditing(false)
  }

  return (
    <div className={`group bg-[#141414] border rounded-xl p-4 mb-3 transition-all duration-200 hover:border-[#333] ${task.done ? "opacity-50 border-[#1E1E1E]" : "border-[#2A2A2A]"}`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200 ${
            task.done ? "bg-[#37b7ab] border-[#37b7ab]" : "border-[#444] hover:border-[#818cf8]"
          }`}
        >
          {task.done && <Check size={11} strokeWidth={3} className="text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title */}
          {editing ? (
            <div className="flex gap-2 mb-2">
              <input
                autoFocus
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleEdit()}
                className="flex-1 bg-[#0A0A0A] border border-[#333] rounded-md px-2 py-1 text-[13px] text-white focus:outline-none focus:border-[#818cf8]"
              />
              <button onClick={handleEdit} className="text-[#37b7ab] text-xs font-semibold">Save</button>
              <button onClick={() => setEditing(false)} className="text-[#666] text-xs">Cancel</button>
            </div>
          ) : (
            <p className={`text-[13px] leading-snug mb-2 font-medium ${task.done ? "line-through text-[#555]" : "text-[#EAEAEA]"}`}>
              {task.title}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center flex-wrap gap-2 mb-1">
            {task.urgent && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                <Zap size={9} className="fill-red-400" /> Urgent
              </span>
            )}
            <OwnerBadge owner={task.owner} />
            <span className={`text-[11px] ${task.deadline === "This week" ? "text-red-400" : "text-[#666]"}`}>
              <Clock size={10} className="inline mr-0.5 -mt-0.5" />{task.deadline}
            </span>
          </div>

          {/* Note toggle */}
          {task.note && (
            <>
              <button
                onClick={() => setNoteOpen(!noteOpen)}
                className="flex items-center gap-1 text-[11px] text-[#555] hover:text-[#888] mt-1 transition-colors"
              >
                {noteOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {noteOpen ? "Hide note" : "Show note"}
              </button>
              {noteOpen && (
                <p className="mt-2 pt-2 border-t border-[#222] text-[12px] text-[#888] leading-relaxed">
                  {task.note}
                </p>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-[#222] text-[#555] hover:text-[#888] transition-colors">
            <Edit2 size={12} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#555] hover:text-red-400 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

function AddTaskModal({ onClose, onAdd }: { onClose: () => void; onAdd: (t: Partial<Task>) => void }) {
  const [title, setTitle] = useState("")
  const [owner, setOwner] = useState("EMT")
  const [section, setSection] = useState("General")
  const [deadline, setDeadline] = useState("This week")
  const [urgent, setUrgent] = useState(false)
  const [note, setNote] = useState("")

  const submit = () => {
    if (!title.trim()) return
    onAdd({ title, owner, section, deadline, urgent, note })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111] border border-[#333] rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-[16px]">Add Task</h3>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] text-[#888] mb-1.5 font-bold uppercase tracking-wider">Task title *</label>
            <textarea
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              rows={2}
              className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-[13px] text-white resize-none focus:outline-none focus:border-[#818cf8] placeholder-[#444]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[#888] mb-1.5 font-bold uppercase tracking-wider">Owner</label>
              <select value={owner} onChange={e => setOwner(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#818cf8]">
                <option>Tolu</option>
                <option>Marketing</option>
                <option>EMT</option>
                <option>Lanre</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-[#888] mb-1.5 font-bold uppercase tracking-wider">Deadline</label>
              <select value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#818cf8]">
                <option>This week</option>
                <option>2 weeks</option>
                <option>30 days</option>
                <option>45 days</option>
                <option>60 days</option>
                <option>Ongoing</option>
                <option>TBD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#888] mb-1.5 font-bold uppercase tracking-wider">Section</label>
            <input value={section} onChange={e => setSection(e.target.value)} placeholder="e.g. Marketing — urgent" className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#818cf8] placeholder-[#444]" />
          </div>

          <div>
            <label className="block text-[11px] text-[#888] mb-1.5 font-bold uppercase tracking-wider">Note (optional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Context or rationale..." rows={2} className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-[13px] text-white resize-none focus:outline-none focus:border-[#818cf8] placeholder-[#444]" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => setUrgent(!urgent)} className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${urgent ? "bg-red-500 border-red-500" : "border-[#444]"}`}>
              {urgent && <Check size={9} strokeWidth={3} className="text-white" />}
            </div>
            <span className="text-[12px] text-[#888]">Mark as urgent</span>
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-[#333] text-[#888] text-[13px] font-medium hover:bg-[#1A1A1A] transition-colors">Cancel</button>
          <button onClick={submit} disabled={!title.trim()} className="flex-1 px-4 py-2.5 rounded-lg bg-[#818cf8] text-white text-[13px] font-bold hover:bg-[#6366f1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Add Task
          </button>
        </div>
      </div>
    </div>
  )
}



export default function ReformTrackerPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<Filter>("all")
  const [showAdd, setShowAdd] = useState(false)
  const [connected, setConnected] = useState(false)
  const esRef = useRef<EventSource | null>(null)

  // SSE connection
  useEffect(() => {
    const es = new EventSource("/api/reform-tracker/sse")
    esRef.current = es
    es.onopen = () => setConnected(true)
    es.onmessage = e => {
      try { setTasks(JSON.parse(e.data)) } catch {}
    }
    es.onerror = () => setConnected(false)
    return () => es.close()
  }, [])

  const toggleTask = async (id: string, current: boolean) => {
    await fetch("/api/reform-tracker", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, done: !current }) })
  }

  const deleteTask = async (id: string) => {
    await fetch("/api/reform-tracker", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
  }

  const addTask = async (t: Partial<Task>) => {
    await fetch("/api/reform-tracker", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(t) })
  }

  const updateTask = async (id: string, changes: Partial<Task>) => {
    await fetch("/api/reform-tracker", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...changes }) })
  }

  // Filtering
  const filtered = tasks.filter(t => {
    if (filter === "all") return true
    if (filter === "urgent") return t.urgent
    return t.owner === filter
  })

  // Group by section
  const sections = [...new Set(filtered.map(t => t.section))]

  // Stats
  const total = tasks.length
  const done = tasks.filter(t => t.done).length
  const left = total - done
  const urgent = tasks.filter(t => t.urgent).length

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "Tolu", label: "Tolu" },
    { key: "Marketing", label: "Marketing" },
    { key: "EMT", label: "EMT" },
    { key: "Lanre", label: "Lanre" },
    { key: "urgent", label: "⚡ Urgent" },
  ]

  return (
    <div className="h-screen overflow-y-auto bg-[#050505] text-[#EAEAEA] font-sans">
      {/* Header */}
      <header className="border-b border-[#1A1A1A] bg-[#080808] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#37b7ab] animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#37b7ab]">
                {connected ? "Live · All changes sync instantly" : "Connecting..."}
              </span>
            </div>
            <h1 className="text-[22px] font-extrabold text-white tracking-tight">Prembly Reform Tracker</h1>
            <p className="text-[12px] text-[#555] mt-0.5">Strategic task board · Every update syncs to all viewers in real time</p>
          </div>
          <div className="flex items-center gap-3">

            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#37b7ab] text-white text-[12px] font-bold hover:bg-[#2da096] transition-colors"
            >
              <Plus size={14} />
              Add Task
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: total, icon: <Circle size={14} />, color: "text-[#888]" },
            { label: "Done", value: done, icon: <CheckCircle2 size={14} />, color: "text-[#37b7ab]" },
            { label: "Left", value: left, icon: <Clock size={14} />, color: "text-[#818cf8]" },
            { label: "Urgent", value: urgent, icon: <Zap size={14} />, color: "text-red-400" },
          ].map(s => (
            <div key={s.label} className="bg-[#111] border border-[#1E1E1E] rounded-xl p-4 hover:border-[#2A2A2A] transition-colors">
              <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-2 ${s.color}`}>
                {s.icon}{s.label}
              </div>
              <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-[11px] text-[#555] mb-2">
            <span>Overall progress</span>
            <span>{total > 0 ? Math.round((done / total) * 100) : 0}%</span>
          </div>
          <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#37b7ab] to-[#818cf8] rounded-full transition-all duration-500"
              style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-semibold border transition-all duration-200 ${
                filter === f.key
                  ? "bg-[#818cf8] text-white border-[#818cf8]"
                  : "bg-transparent text-[#666] border-[#2A2A2A] hover:border-[#444] hover:text-[#EAEAEA]"
              }`}
            >
              {f.label}
              {f.key !== "all" && f.key !== "urgent" && (
                <span className="ml-1.5 text-[10px] opacity-60">
                  {tasks.filter(t => t.owner === f.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Task list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#444]">
            <Users size={32} className="mx-auto mb-3 text-[#333]" />
            <p className="text-[13px]">No tasks match this filter.</p>
          </div>
        ) : (
          sections.map(sec => (
            <div key={sec} className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#555]">{sec}</span>
                <div className="flex-1 h-px bg-[#1E1E1E]" />
                <span className="text-[10px] text-[#444]">{filtered.filter(t => t.section === sec).length}</span>
              </div>
              {filtered.filter(t => t.section === sec).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTask(task.id, task.done)}
                  onDelete={() => deleteTask(task.id)}
                  onUpdate={changes => updateTask(task.id, changes)}
                />
              ))}
            </div>
          ))
        )}
      </main>

      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onAdd={addTask} />}
    </div>
  )
}
