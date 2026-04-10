"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import spec from "@/data/assessment-spec.json";
import { computeAllScores } from "@/lib/scoring";
import type { AssessmentScores, Section } from "@/types/assessment";
import { IntroPage } from "./intro-page";
import { SectionPage } from "./section-page";
import { ReviewPage } from "./review-page";
import { ResultsPage } from "./results-page";
import { Loader2, Clock } from "lucide-react";

const STORAGE_KEY = "personality-assessment-answers";
type Step = "loading" | "intro" | `section-${number}` | "review" | "computing" | "results" | "weekly_limit";

interface AssessmentRecord {
  id: string;
  answers: Record<string, number | string>;
  scores: AssessmentScores | null;
  interpretation: string | null;
  status: string;
  completed_at: string | null;
}

export function AssessmentFlow({ userId }: { userId: string }) {
  const [step, setStep] = useState<Step>("loading");
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [scores, setScores] = useState<AssessmentScores | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [nextAvailable, setNextAvailable] = useState<string | null>(null);
  const [pastResults, setPastResults] = useState<AssessmentRecord[]>([]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sections = spec.sections as Section[];

  // ─── Load existing assessment on mount ───
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/assessments");
        if (!res.ok) throw new Error();
        const data = await res.json();

        setPastResults(data.history || []);

        // Has in-progress assessment → resume
        if (data.in_progress) {
          setAssessmentId(data.in_progress.id);
          const savedAnswers = data.in_progress.answers || {};
          setAnswers(savedAnswers);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(savedAnswers));
          // Jump to where they left off
          if (Object.keys(savedAnswers).length > 0) {
            setStep("intro"); // they can click "繼續" on intro
          } else {
            setStep("intro");
          }
          return;
        }

        // Weekly limit reached
        if (data.weekly_limit_reached) {
          setNextAvailable(data.next_available);
          // If has past results, show the most recent
          if (data.history && data.history.length > 0 && data.history[0].scores) {
            setScores(data.history[0].scores);
            setStep("results");
          } else {
            setStep("weekly_limit");
          }
          return;
        }

        // Fresh start
        setStep("intro");
      } catch {
        // Fallback: localStorage only
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) setAnswers(JSON.parse(saved));
        } catch {}
        setStep("intro");
      }
    }
    load();
  }, []);

  // ─── Persist answers to localStorage (immediate) ───
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    }
  }, [answers]);

  // ─── Debounced save to DB ───
  const saveToDb = useCallback(
    (newAnswers: Record<string, number | string>) => {
      if (!assessmentId) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          await fetch("/api/assessments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "save_progress",
              assessment_id: assessmentId,
              answers: newAnswers,
            }),
          });
        } catch {}
      }, 2000); // save every 2s of inactivity
    },
    [assessmentId]
  );

  const setAnswer = useCallback(
    (qId: string, value: number | string) => {
      setAnswers((prev) => {
        const next = { ...prev, [qId]: value };
        saveToDb(next);
        return next;
      });
    },
    [saveToDb]
  );

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(
    (answeredCount / spec.meta.totalQuestions) * 100
  );

  const currentSectionIndex = step.startsWith("section-")
    ? parseInt(step.split("-")[1]) - 1
    : -1;

  const sectionAnsweredCount = (idx: number) => {
    const section = sections[idx];
    if (!section) return 0;
    return section.questions.filter((q) => answers[q.id] !== undefined).length;
  };

  // ─── Start new assessment ───
  const handleStart = useCallback(async () => {
    if (assessmentId) {
      // Resume existing
      setStep("section-1");
      window.scrollTo(0, 0);
      return;
    }

    // Create new
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create" }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          setStep("weekly_limit");
          return;
        }
        return;
      }
      setAssessmentId(data.assessment.id);
    } catch {}

    setStep("section-1");
    window.scrollTo(0, 0);
  }, [assessmentId]);

  // ─── Compute scores ───
  const handleCompute = useCallback(async () => {
    setStep("computing");
    setTimeout(async () => {
      const result = computeAllScores(sections, answers, assessmentId || undefined);
      setScores(result);

      // Save to DB
      if (assessmentId) {
        try {
          await fetch("/api/assessments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "complete",
              assessment_id: assessmentId,
              answers,
              scores: result,
            }),
          });
        } catch {}
      }

      localStorage.removeItem(STORAGE_KEY);
      setStep("results");
    }, 800);
  }, [sections, answers, assessmentId]);

  // ─── Retake (check weekly limit) ───
  const handleRetake = useCallback(async () => {
    // Check if allowed
    try {
      const res = await fetch("/api/assessments");
      const data = await res.json();
      if (data.weekly_limit_reached) {
        setNextAvailable(data.next_available);
        setStep("weekly_limit");
        return;
      }
    } catch {}

    setAnswers({});
    setScores(null);
    setAssessmentId(null);
    localStorage.removeItem(STORAGE_KEY);
    setStep("intro");
    window.scrollTo(0, 0);
  }, []);

  // ─── Render ───

  if (step === "loading") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (step === "weekly_limit") {
    const nextDate = nextAvailable
      ? new Date(nextAvailable).toLocaleDateString("zh-TW", {
          month: "long",
          day: "numeric",
          weekday: "long",
        })
      : "下週";

    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="rounded-full bg-amber-100 p-4">
          <Clock className="h-8 w-8 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">本週已完成測評</h2>
          <p className="text-sm text-gray-500 max-w-sm">
            為了確保每次測評的品質和準確度,每週限測評一次。
            <br />
            下次可測評時間:
            <strong className="text-gray-700"> {nextDate}</strong>
          </p>
        </div>
        {scores && (
          <button
            onClick={() => setStep("results")}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
          >
            查看上次測評結果
          </button>
        )}
      </div>
    );
  }

  if (step === "intro") {
    const hasProgress = Object.keys(answers).length > 0;
    return (
      <IntroPage
        onStart={handleStart}
        resumeLabel={hasProgress ? `繼續作答 (${progressPercent}%)` : undefined}
      />
    );
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
          if (currentSectionIndex > 0)
            setStep(`section-${currentSectionIndex}`);
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
        onGoToSection={(idx) => {
          setStep(`section-${idx + 1}`);
          window.scrollTo(0, 0);
        }}
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
        assessmentId={assessmentId}
        onRetake={handleRetake}
      />
    );
  }

  return null;
}
