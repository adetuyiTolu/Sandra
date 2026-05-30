import { NextRequest, NextResponse } from "next/server";
import { tasks, broadcast } from "@/lib/reform-store";
import { randomUUID } from "crypto";

export async function GET() {
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const task = {
    id: randomUUID(),
    section: body.section || "General",
    title: body.title,
    owner: body.owner || "EMT",
    urgent: body.urgent ?? false,
    deadline: body.deadline || "TBD",
    note: body.note || "",
    done: false,
    createdAt: Date.now(),
  };
  tasks.push(task);
  broadcast();
  return NextResponse.json(task, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const idx = tasks.findIndex(t => t.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  tasks[idx] = { ...tasks[idx], ...body };
  broadcast();
  return NextResponse.json(tasks[idx]);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx !== -1) tasks.splice(idx, 1);
  broadcast();
  return NextResponse.json({ ok: true });
}
