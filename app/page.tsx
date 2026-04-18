"use client";

import { useState } from "react";

interface RoastResult {
  score: number;
  verdict: string;
  roast: string;
  killerRisk: string;
  marketReality: string;
  actuallyGood: string;
  verdict_emoji: string;
}

const scoreBg = (score: number) => {
  if (score <= 3) return "bg-red-950 border-red-800";
  if (score <= 6) return "bg-yellow-950 border-yellow-800";
  return "bg-green-950 border-green-800";
};

const scoreColor = (score: number) => {
  if (score <= 3) return "text-red-500";
  if (score <= 6) return "text-yellow-500";
  return "text-green-500";
};

export default function Home() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idea.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong");
      else setResult(data);
    } catch {
      setError("Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">🔥</div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Roast My Idea</h1>
          <p className="text-zinc-400 text-lg">
            Paste your startup idea. Get brutally honest feedback.
            <br />
            <span className="text-zinc-500 text-sm">No fluff. No encouragement unless it&apos;s earned.</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your business idea. Be specific — vague ideas get vague roasts."
            className="w-full h-36 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none focus:border-zinc-500 text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !idea.trim()}
            className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold rounded-xl transition-colors"
          >
            {loading ? "Roasting..." : "Roast It 🔥"}
          </button>
        </form>

        {error && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-red-300 text-sm mb-6">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className={`border rounded-xl p-6 flex items-center gap-6 ${scoreBg(result.score)}`}>
              <div className={`text-6xl font-black ${scoreColor(result.score)}`}>
                {result.score}<span className="text-2xl">/10</span>
              </div>
              <div>
                <div className="text-2xl mb-1">{result.verdict_emoji}</div>
                <div className="font-semibold text-lg">{result.verdict}</div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">The Roast</div>
              <p className="text-zinc-200">{result.roast}</p>
            </div>

            <div className="bg-zinc-900 border border-red-900 rounded-xl p-5">
              <div className="text-xs text-red-500 uppercase tracking-wider font-semibold mb-2">Killer Risk</div>
              <p className="text-zinc-200">{result.killerRisk}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Market Reality</div>
              <p className="text-zinc-200">{result.marketReality}</p>
            </div>

            <div className="bg-zinc-900 border border-green-900 rounded-xl p-5">
              <div className="text-xs text-green-600 uppercase tracking-wider font-semibold mb-2">Actually Not Terrible</div>
              <p className="text-zinc-200">{result.actuallyGood}</p>
            </div>

            <button
              onClick={() => { setResult(null); setIdea(""); }}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-colors text-sm"
            >
              Roast another idea
            </button>
          </div>
        )}

        <p className="text-center text-zinc-600 text-xs mt-12">
          Built in 1 hour by Jarvis &amp; Puter · Powered by Claude
        </p>
      </div>
    </main>
  );
}
