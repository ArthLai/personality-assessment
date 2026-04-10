"use client";

import { cn } from "@/lib/utils";
import { BAND_LABELS } from "@/lib/scoring";
import type { Band, ConstructScore, ConstructDef } from "@/types/assessment";

const BAND_COLORS: Record<Band, { bar: string; badge: string }> = {
  very_low: { bar: "bg-blue-400", badge: "bg-blue-50 text-blue-700" },
  low: { bar: "bg-sky-400", badge: "bg-sky-50 text-sky-700" },
  moderate: { bar: "bg-amber-400", badge: "bg-amber-50 text-amber-700" },
  high: { bar: "bg-orange-400", badge: "bg-orange-50 text-orange-700" },
  very_high: { bar: "bg-rose-400", badge: "bg-rose-50 text-rose-700" },
};

export function ScoreBar({
  score,
  def,
}: {
  score: ConstructScore;
  def: ConstructDef;
}) {
  const colors = BAND_COLORS[score.band];

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <div className="min-w-0">
          <span className="text-sm font-semibold text-gray-900">
            {def.label_zh}
          </span>
          <span className="ml-1.5 text-xs text-gray-400">
            {def.label_en}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-lg font-bold text-gray-900 tabular-nums">
            {score.percent}%
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
              colors.badge
            )}
          >
            {BAND_LABELS[score.band]}
          </span>
        </div>
      </div>

      {/* Bar */}
      <div className="flex items-center gap-2">
        <span className="w-16 text-right text-[10px] text-gray-400 leading-tight hidden sm:block">
          {def.pole_low}
        </span>
        <div className="relative h-2.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={cn(
              "absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out",
              colors.bar
            )}
            style={{ width: `${score.percent}%` }}
          />
        </div>
        <span className="w-16 text-[10px] text-gray-400 leading-tight hidden sm:block">
          {def.pole_high}
        </span>
      </div>

      {/* Mobile pole labels */}
      <div className="flex justify-between text-[10px] text-gray-400 sm:hidden px-0.5">
        <span>{def.pole_low}</span>
        <span>{def.pole_high}</span>
      </div>
    </div>
  );
}
