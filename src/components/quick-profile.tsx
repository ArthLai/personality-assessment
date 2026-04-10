"use client";

import spec from "@/data/assessment-spec.json";
import type { AssessmentScores, ConstructDef } from "@/types/assessment";
import { BAND_LABELS } from "@/lib/scoring";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";

const constructs = spec.constructs as Record<string, ConstructDef>;

export function QuickProfile({ scores }: { scores: AssessmentScores }) {
  const sorted = Object.entries(scores.construct_scores)
    .map(([id, s]) => ({
      id,
      label: constructs[id]?.label_zh || id,
      percent: s.percent,
      band: BAND_LABELS[s.band],
    }))
    .sort((a, b) => b.percent - a.percent);

  const top3 = sorted.slice(0, 3);
  const bottom3 = sorted.slice(-3).reverse();

  const patternTags = scores.cross_validations
    .filter((cv) => cv.status === "pattern_detected" || cv.status === "inconsistent")
    .map((cv) => cv.name);

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-1">一眼看懂你</h3>
      <p className="text-sm text-gray-500 mb-4">
        你最鮮明的特質,以及我們從數據中發現的有趣模式
      </p>

      {patternTags.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {patternTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-indigo-700 shadow-sm border border-indigo-100"
            >
              <Zap className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
            <TrendingUp className="h-4 w-4" />
            你最突出的
          </div>
          {top3.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
              <span className="text-sm text-gray-800">{c.label}</span>
              <span className="text-sm font-bold text-emerald-600">{c.percent}%</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-700">
            <TrendingDown className="h-4 w-4" />
            你相對淡的
          </div>
          {bottom3.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
              <span className="text-sm text-gray-800">{c.label}</span>
              <span className="text-sm font-bold text-blue-600">{c.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
