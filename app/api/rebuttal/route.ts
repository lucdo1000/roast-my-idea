import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const { idea, originalRoast, rebuttal } = await req.json();

  if (!idea || !originalRoast || !rebuttal?.trim()) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const prompt = `You are a brutally honest startup advisor. You previously roasted this idea:

Idea: "${idea}"

Your original roast: "${originalRoast}"

The founder has pushed back with: "${rebuttal}"

Respond honestly. If they've corrected a genuine wrong assumption, acknowledge it and adjust your view. If their rebuttal is wishful thinking or doesn't address the core problem, call it out. Be direct — not harsh for the sake of it, but don't soften real problems.

Respond in this exact JSON format:
{
  "response": "<2-3 sentences responding to their specific rebuttal — address what they actually said>",
  "changed_mind": <true if they've genuinely changed your view, false if not>,
  "new_score": <updated score 1-10 if changed_mind is true, otherwise same as original>,
  "new_verdict": "<updated one-line verdict if score changed, otherwise null>"
}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
