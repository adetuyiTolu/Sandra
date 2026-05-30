import { clients } from "@/lib/reform-store";
import { tasks } from "@/lib/reform-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  let controller: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
      clients.add(controller);
      // Send initial state immediately
      const payload = `data: ${JSON.stringify(tasks)}\n\n`;
      controller.enqueue(new TextEncoder().encode(payload));
    },
    cancel() {
      clients.delete(controller);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
