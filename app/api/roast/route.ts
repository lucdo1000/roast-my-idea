import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const { idea } = await req.json();

  if (!idea || idea.trim().length < 10) {
    return NextResponse.json({ error: "Give us something to work with." }, { status: 400 });
  }

  const prompt = `You are a brutally honest startup advisor who has seen thousands of pitches. Roast this business idea with zero mercy, but also give genuinely useful feedback.

Business idea: "${idea}"

Respond in this exact JSON format:
{
  "score": <number 1-10, where 1 = dead on arrival, 10 = actually great>,
  "verdict": "<one punchy sentence verdict>",
  "roast": "<2-3 sentences of brutal, specific critique of the biggest problems>",
  "killerRisk": "<the single biggest risk that will kill this>",
  "marketReality": "<honest market assessment: size, competition, saturation>",
  "actuallyGood": "<1-2 things that are genuinely not terrible about this idea>",
  "verdict_emoji": "<one emoji that captures the vibe>"
}

Be specific to THEIR idea, not generic. Reference real competitors, real market conditions, real problems. Don't be encouraging unless it's actually warranted.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
