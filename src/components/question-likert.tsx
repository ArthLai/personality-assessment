"use client";

import { cn } from "@/lib/utils";
import type { LikertQuestion } from "@/types/assessment";

const LIKERT_OPTIONS = [
  { value: 1, label: "非常不同意", short: "1" },
  { value: 2, label: "不同意", short: "2" },
  { value: 3, label: "中立", short: "3" },
  { value: 4, label: "同意", short: "4" },
  { value: 5, label: "非常同意", short: "5" },
];

export function QuestionLikert({
  question,
  value,
  onAnswer,
}: {
  question: LikertQuestion;
  value: number | undefined;
  onAnswer: (qId: string, value: number) => void;
}) {
  const qNum = question.id.replace("q", "");

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm animate-fade-in">
      {/* Scenario callout for CAPS questions */}
      {question.scenario && (
        <div className="mb-3 rounded-lg bg-amber-50 border border-amber-100 px-4 py-2.5">
          <p className="text-sm text-amber-800 font-medium leading-relaxed">
            {question.scenario}
          </p>
        </div>
      )}

      <p className="mb-4 text-sm text-gray-800 leading-relaxed">
        <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[11px] font-medium text-gray-500">
          {qNum}
        </span>
        {question.text}
      </p>

      {/* Likert scale */}
      <div className="flex gap-1.5">
        {LIKERT_OPTIONS.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onAnswer(question.id, opt.value)}
              className={cn(
                "flex-1 rounded-lg border-2 py-2.5 text-center text-xs font-medium transition-all",
                isSelected
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 animate-select"
                  : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200 hover:bg-gray-100"
              )}
            >
              <div className="sm:hidden">{opt.short}</div>
              <div className="hidden sm:block">{opt.label}</div>
            </button>
          );
        })}
      </div>

      {/* Scale labels on mobile */}
      <div className="mt-1.5 flex justify-between text-[10px] text-gray-400 sm:hidden">
        <span>非常不同意</span>
        <span>非常同意</span>
      </div>
    </div>
  );
}
