"use client";

import { useState, useCallback, useEffect } from "react";
import spec from "@/data/assessment-spec.json";
import { computeAllScores } from "@/lib/scoring";
import type { AssessmentScores, Section } from "@/types/assessment";
import { IntroPage } from "./intro-page";
import { SectionPage } from "./section-page";
import { ReviewPage } from "./review-page";
import { ResultsPage } from "./results-page";

const STORAGE_KEY = "personality-assessment-answers";
type Step = "intro" | `section-${number}` | "review" | "computing" | "results";

export function AssessmentFlow() {
  const [step, setStep] = useState<Step>("intro");
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [scores, setScores] = useState<AssessmentScores | null>(null);

  const sections = spec.sections as Section[];

  // Load saved answers
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Object.keys(parsed).length > 0) setAnswers(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  // Persist answers
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    }
  }, [answers]);

  const setAnswer = useCallback((qId: string, value: number | string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }, []);

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / spec.meta.totalQuestions) * 100);

  const currentSectionIndex = step.startsWith("section-")
    ? parseInt(step.split("-")[1]) - 1
    : -1;

  const sectionAnsweredCount = (idx: number) => {
    const section = sections[idx];
    if (!section) return 0;
    return section.questions.filter((q) => answers[q.id] !== undefined).length;
  };

  const handleCompute = useCallback(() => {
    setStep("computing");
    setTimeout(() => {
      const result = computeAllScores(sections, answers);
      setScores(result);
      setStep("results");
      localStorage.removeItem(STORAGE_KEY);
    }, 800);
  }, [sections, answers]);

  const handleRetake = useCallback(() => {
    setAnswers({});
    setScores(null);
    localStorage.removeItem(STORAGE_KEY);
    setStep("intro");
    window.scrollTo(0, 0);
  }, []);

  // ─── Render ───

  if (step === "intro") {
    return <IntroPage onStart={() => { setStep("section-1"); window.scrollTo(0, 0); }} />;
  }

  if (step.startsWith("section-") && currentSectionIndex >= 0) {
    const section = sections[currentSectionIndex];
    if (!section) return null;
    return (
      <SectionPage
        section={section}
        sectionIndex={currentSectionIndex}
        totalSections={sections.length}
        answers={answers}
        onAnswer={setAnswer}
        onPrev={() => {
          if (currentSectionIndex > 0) setStep(`section-${currentSectionIndex}`);
          else setStep("intro");
          window.scrollTo(0, 0);
        }}
        onNext={() => {
          if (currentSectionIndex < sections.length - 1)
            setStep(`section-${currentSectionIndex + 2}`);
          else setStep("review");
          window.scrollTo(0, 0);
        }}
        progressPercent={progressPercent}
      />
    );
  }

  if (step === "review") {
    return (
      <ReviewPage
        sections={sections}
        answers={answers}
        onGoToSection={(idx) => { setStep(`section-${idx + 1}`); window.scrollTo(0, 0); }}
        onSubmit={handleCompute}
        sectionAnsweredCount={sectionAnsweredCount}
        progressPercent={progressPercent}
        totalQuestions={spec.meta.totalQuestions}
      />
    );
  }

  if (step === "computing") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-4">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-lg font-medium">正在分析你的測評結果</p>
          <p className="text-sm text-muted-foreground">
            交叉驗證 {spec.frameworks.length} 個框架的數據...
          </p>
        </div>
      </div>
    );
  }

  if (step === "results" && scores) {
    return (
      <ResultsPage
        scores={scores}
        onRetake={handleRetake}
      />
    );
  }

  return null;
}
