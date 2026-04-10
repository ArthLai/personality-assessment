"use client";

import { cn } from "@/lib/utils";
import type { ChoiceQuestion } from "@/types/assessment";
import { Check } from "lucide-react";

export function QuestionChoice({
  question,
  value,
  onAnswer,
}: {
  question: ChoiceQuestion;
  value: string | undefined;
  onAnswer: (qId: string, value: string) => void;
}) {
  const qNum = question.id.replace("q", "");

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm animate-fade-in">
      <p className="mb-4 text-sm text-gray-800 leading-relaxed">
        <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-medium text-indigo-500">
          {qNum}
        </span>
        {question.text}
      </p>

      <div className="space-y-2">
        {question.options.map((opt) => {
          const isSelected = value === opt.val;
          return (
            <button
              key={opt.val}
              onClick={() => onAnswer(question.id, opt.val)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-left text-sm transition-all",
                isSelected
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-all",
                  isSelected
                    ? "bg-indigo-600 text-white"
                    : "border-2 border-gray-200 text-gray-400"
                )}
              >
                {isSelected ? <Check className="h-3.5 w-3.5" /> : opt.val}
              </span>
              <span className={cn(isSelected ? "text-indigo-900 font-medium" : "text-gray-700")}>
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
