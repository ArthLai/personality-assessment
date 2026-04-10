"use client";

import type { OpenQuestion } from "@/types/assessment";
import { PenLine } from "lucide-react";

export function QuestionOpen({
  question,
  value,
  onAnswer,
}: {
  question: OpenQuestion;
  value: string | undefined;
  onAnswer: (qId: string, value: string) => void;
}) {
  const qNum = question.id.replace("q", "");
  const charCount = (value || "").length;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm animate-fade-in">
      <div className="mb-3 flex items-start gap-2">
        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-medium text-emerald-600">
          {qNum}
        </span>
        <div>
          <p className="text-sm text-gray-800 leading-relaxed">{question.text}</p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
            <PenLine className="h-3 w-3" />
            <span>開放作答</span>
          </div>
        </div>
      </div>

      <textarea
        className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 p-4 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-300 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        rows={4}
        placeholder="請在此寫下你的想法..."
        value={value || ""}
        onChange={(e) => onAnswer(question.id, e.target.value)}
      />
      <div className="mt-1 text-right text-[11px] text-gray-300">
        {charCount > 0 && `${charCount} 字`}
      </div>
    </div>
  );
}
