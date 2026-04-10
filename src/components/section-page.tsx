"use client";

import type { Section } from "@/types/assessment";
import { QuestionLikert } from "./question-likert";
import { QuestionChoice } from "./question-choice";
import { QuestionOpen } from "./question-open";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function SectionPage({
  section,
  sectionIndex,
  totalSections,
  answers,
  onAnswer,
  onPrev,
  onNext,
  progressPercent,
}: {
  section: Section;
  sectionIndex: number;
  totalSections: number;
  answers: Record<string, number | string>;
  onAnswer: (qId: string, value: number | string) => void;
  onPrev: () => void;
  onNext: () => void;
  progressPercent: number;
}) {
  const sectionProgress = section.questions.filter(
    (q) => answers[q.id] !== undefined
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky progress */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="font-medium text-gray-700">
              {sectionIndex + 1} / {totalSections}
            </span>
            <span>
              本頁 {sectionProgress}/{section.questions.length} 題 · 整體 {progressPercent}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Section header */}
      <div className="mx-auto max-w-2xl px-4 pt-8 pb-2">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
          <p className="mt-1 text-sm text-gray-500">{section.instruction}</p>
        </div>
      </div>

      {/* Questions */}
      <div className="mx-auto max-w-2xl px-4 space-y-4 pb-8">
        {section.questions.map((q) => {
          if (q.type === "likert") {
            return (
              <QuestionLikert
                key={q.id}
                question={q}
                value={answers[q.id] as number | undefined}
                onAnswer={onAnswer}
              />
            );
          }
          if (q.type === "choice") {
            return (
              <QuestionChoice
                key={q.id}
                question={q}
                value={answers[q.id] as string | undefined}
                onAnswer={onAnswer}
              />
            );
          }
          if (q.type === "open") {
            return (
              <QuestionOpen
                key={q.id}
                question={q}
                value={answers[q.id] as string | undefined}
                onAnswer={onAnswer}
              />
            );
          }
          return null;
        })}
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 border-t border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <button
            onClick={onPrev}
            className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
            上一步
          </button>
          <button
            onClick={onNext}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700 active:scale-[0.98]"
          >
            {sectionIndex < totalSections - 1 ? "下一頁" : "前往回顧"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
