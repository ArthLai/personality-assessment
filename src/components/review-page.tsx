"use client";

import type { Section } from "@/types/assessment";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

export function ReviewPage({
  sections,
  answers,
  onGoToSection,
  onSubmit,
  sectionAnsweredCount,
  progressPercent,
  totalQuestions,
}: {
  sections: Section[];
  answers: Record<string, number | string>;
  onGoToSection: (idx: number) => void;
  onSubmit: () => void;
  sectionAnsweredCount: (idx: number) => number;
  progressPercent: number;
  totalQuestions: number;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">回顧作答</h2>
          <p className="mt-2 text-sm text-gray-500">
            確認每個 Section 都已完成。未填答的題目不影響提交,但可能影響解讀完整度。
          </p>
        </div>

        {/* Progress ring */}
        <div className="mb-8 flex justify-center">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#6366f1"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - progressPercent / 100)}`}
                className="transition-all duration-700"
              />
            </svg>
            <div className="text-center">
              <span className="text-2xl font-bold text-gray-900">{progressPercent}%</span>
              <p className="text-[10px] text-gray-400">{Object.keys(answers).length}/{totalQuestions}</p>
            </div>
          </div>
        </div>

        {/* Section list */}
        <div className="space-y-2">
          {sections.map((section, idx) => {
            const answered = sectionAnsweredCount(idx);
            const total = section.questions.length;
            const complete = answered === total;
            const pct = Math.round((answered / total) * 100);

            return (
              <button
                key={section.id}
                onClick={() => onGoToSection(idx)}
                className="group flex w-full items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 text-left transition-all hover:border-gray-200 hover:shadow-sm"
              >
                {complete ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-gray-300" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {section.title}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0">
                      {answered}/{total}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-gray-500" />
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          <button
            onClick={onSubmit}
            className="w-full rounded-xl bg-indigo-600 py-3.5 text-base font-medium text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-xl active:scale-[0.99]"
          >
            提交並查看結果
          </button>
        </div>
      </div>
    </div>
  );
}
