import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });
  }

  const systemPrompt = `You are a strategic operations assistant for Prembly — a Nigerian identity verification, fraud intelligence, and compliance infrastructure company.

Prembly's goals: grow enterprise sales through compliance officers, expand sector coverage (banking, telco, oil & gas, consumer goods), build trust infrastructure positioning, launch consultant distribution channel, strengthen AML/KYC product suite, and grow in African markets.

Extract meaningful, actionable tasks from the text the user provides. For each task:
- Assign it to one of: Tolu, Marketing, EMT, or Lanre
- Set urgency (true/false)
- Set a deadline (e.g. "This week", "2 weeks", "30 days", "Ongoing")
- Write a brief note explaining why it matters to Prembly's goals
- Determine the right section grouping

Return ONLY a JSON array, no markdown, no explanation:
[
  {
    "title": "...",
    "owner": "Tolu|Marketing|EMT|Lanre",
    "urgent": true|false,
    "deadline": "...",
    "section": "...",
    "note": "...",
    "rationale": "One sentence: why this aligns with Prembly's current priorities"
  }
]`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Extract tasks from this text:\n\n${text}` },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "[]";
    
    // Parse - handle both array and {tasks:[]} formats
    let parsed;
    try {
      const obj = JSON.parse(raw);
      parsed = Array.isArray(obj) ? obj : obj.tasks || obj.items || [];
    } catch {
      parsed = [];
    }

    return NextResponse.json({ tasks: parsed });
  } catch (err) {
    return NextResponse.json({ error: "OpenAI call failed", detail: String(err) }, { status: 500 });
  }
}
