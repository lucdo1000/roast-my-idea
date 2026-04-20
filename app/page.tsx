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
  improvementPlan: string;
}

interface RebuttalResult {
  response: string;
  changed_mind: boolean;
  new_score: number | null;
  new_verdict: string | null;
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

  const [rebuttal, setRebuttal] = useState("");
  const [rebuttalLoading, setRebuttalLoading] = useState(false);
  const [rebuttalResult, setRebuttalResult] = useState<RebuttalResult | null>(null);
  const [rebuttalError, setRebuttalError] = useState("");

  const displayScore = rebuttalResult?.changed_mind && rebuttalResult.new_score != null
    ? rebuttalResult.new_score
    : result?.score ?? 0;

  const displayVerdict = rebuttalResult?.changed_mind && rebuttalResult.new_verdict
    ? rebuttalResult.new_verdict
    : result?.verdict ?? "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idea.trim()) return;
    setLoading(true);
    setResult(null);
    setRebuttalResult(null);
    setRebuttal("");
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

  async function handleRebuttal(e: React.FormEvent) {
    e.preventDefault();
    if (!rebuttal.trim() || !result) return;
    setRebuttalLoading(true);
    setRebuttalError("");
    try {
      const res = await fetch("/api/rebuttal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, originalRoast: result.roast, rebuttal }),
      });
      const data = await res.json();
      if (!res.ok) setRebuttalError(data.error || "Something went wrong");
      else setRebuttalResult(data);
    } catch {
      setRebuttalError("Request failed. Try again.");
    } finally {
      setRebuttalLoading(false);
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
            {/* Score */}
            <div className={`border rounded-xl p-6 flex items-center gap-6 ${scoreBg(displayScore)}`}>
              <div className={`text-6xl font-black tabular-nums ${scoreColor(displayScore)}`}>
                {displayScore}<span className="text-2xl">/10</span>
              </div>
              <div>
                <div className="text-2xl mb-1">{result.verdict_emoji}</div>
                <div className="font-semibold text-lg">{displayVerdict}</div>
                {rebuttalResult?.changed_mind && (
                  <div className="text-xs text-zinc-400 mt-1">↑ Updated after your rebuttal</div>
                )}
              </div>
            </div>

            {/* Roast */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">The Roast</div>
              <p className="text-zinc-200">{result.roast}</p>
            </div>

            {/* Killer risk */}
            <div className="bg-zinc-900 border border-red-900 rounded-xl p-5">
              <div className="text-xs text-red-500 uppercase tracking-wider font-semibold mb-2">Killer Risk</div>
              <p className="text-zinc-200">{result.killerRisk}</p>
            </div>

            {/* Market reality */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Market Reality</div>
              <p className="text-zinc-200">{result.marketReality}</p>
            </div>

            {/* Actually good */}
            <div className="bg-zinc-900 border border-green-900 rounded-xl p-5">
              <div className="text-xs text-green-600 uppercase tracking-wider font-semibold mb-2">Actually Not Terrible</div>
              <p className="text-zinc-200">{result.actuallyGood}</p>
            </div>

            {/* Improvement plan */}
            {result.improvementPlan && (
              <div className="bg-zinc-900 border border-blue-900 rounded-xl p-5">
                <div className="text-xs text-blue-400 uppercase tracking-wider font-semibold mb-2">
                  What would raise the score
                </div>
                <p className="text-zinc-200">{result.improvementPlan}</p>
              </div>
            )}

            {/* Rebuttal section */}
            <div className="border border-zinc-700 rounded-xl overflow-hidden">
              <div className="bg-zinc-900 px-5 py-3 border-b border-zinc-700">
                <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                  Push back
                </div>
                <p className="text-zinc-500 text-xs mt-1">
                  Correct a wrong assumption, add context, or defend your idea.
                </p>
              </div>

              {rebuttalResult ? (
                <div className="p-5 space-y-4">
                  <div className={`rounded-lg p-4 text-sm ${rebuttalResult.changed_mind ? "bg-green-950 border border-green-800 text-green-100" : "bg-zinc-800 text-zinc-200"}`}>
                    {rebuttalResult.changed_mind && (
                      <div className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-2">
                        Fair point — view updated
                      </div>
                    )}
                    <p>{rebuttalResult.response}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setRebuttalResult(null); setRebuttal(""); }}
                    className="text-xs text-zinc-500 hover:text-zinc-300 underline transition-colors"
                  >
                    Push back again
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRebuttal} className="p-5 space-y-3">
                  <textarea
                    value={rebuttal}
                    onChange={(e) => setRebuttal(e.target.value)}
                    placeholder="e.g. 'You assumed X but actually Y because...' or 'The competitor you mentioned doesn't do Z...'"
                    className="w-full h-24 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-500 text-sm"
                    disabled={rebuttalLoading}
                  />
                  {rebuttalError && (
                    <p className="text-red-400 text-xs">{rebuttalError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={rebuttalLoading || !rebuttal.trim()}
                    className="w-full py-2.5 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-100 font-medium rounded-lg transition-colors text-sm"
                  >
                    {rebuttalLoading ? "Thinking..." : "Submit rebuttal"}
                  </button>
                </form>
              )}
            </div>

            <button
              onClick={() => { setResult(null); setIdea(""); setRebuttalResult(null); setRebuttal(""); }}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-colors text-sm"
            >
              Roast another idea
            </button>
          </div>
        )}

        <p className="text-center text-zinc-600 text-xs mt-12">
          Built by Jarvis &amp; Puter · Powered by Claude
        </p>
      </div>
    </main>
  );
}
