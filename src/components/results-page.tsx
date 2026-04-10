"use client";

import { useState, useCallback, useRef } from "react";
import spec from "@/data/assessment-spec.json";
import { FRAMEWORK_REFS } from "@/lib/framework-refs";
import { BAND_LABELS } from "@/lib/scoring";
import type { AssessmentScores, ConstructDef } from "@/types/assessment";
import { ScoreBar } from "./score-bar";
import { CvCard } from "./cv-card";
import { QuickProfile } from "./quick-profile";
import { ContextForm, type UserContext } from "./context-form";
import {
  RotateCcw,
  Share2,
  BookOpen,
  Sparkles,
  Download,
  Loader2,
  AlertCircle,
  ChevronDown,
  ArrowRight,
  Lightbulb,
} from "lucide-react";

const constructDefs = spec.constructs as Record<string, ConstructDef>;
const displayGroups = spec.display_groups;

function groupSummary(groupConstructs: string[], scores: AssessmentScores): string {
  return groupConstructs
    .filter((c) => scores.construct_scores[c])
    .map((c) => {
      const s = scores.construct_scores[c];
      const label = constructDefs[c]?.label_zh || c;
      return `${label}${BAND_LABELS[s.band]}`;
    })
    .join(" · ");
}

// ─── Parse AI interpretation into structured sections ───

interface InterpSection {
  title: string;
  content: string[];
  actionAdvice: string[];
}

function parseInterpretation(text: string): InterpSection[] {
  const sections: InterpSection[] = [];
  let current: InterpSection | null = null;
  let inAction = false;

  for (const line of text.split("\n")) {
    if (line.startsWith("## ")) {
      if (current) sections.push(current);
      current = { title: line.replace(/^## \d+\.\s*/, "").replace(/^## /, ""), content: [], actionAdvice: [] };
      inAction = false;
    } else if (line.startsWith("### ") && line.includes("行動") || line.startsWith("### ") && line.includes("下一步")) {
      inAction = true;
    } else if (current) {
      if (inAction) {
        if (line.trim()) current.actionAdvice.push(line);
      } else {
        current.content.push(line);
      }
    }
  }
  if (current) sections.push(current);
  return sections;
}

// ─── Render a line of interpretation text ───

function InterpLine({ line, idx }: { line: string; idx: number }) {
  if (line.startsWith("**") && line.endsWith("**")) {
    return <p key={idx} className="font-semibold text-gray-800 mt-2 text-sm">{line.replace(/\*\*/g, "")}</p>;
  }
  if (line.startsWith("- ") || line.startsWith("* ")) {
    return (
      <div key={idx} className="flex gap-2.5 ml-1 text-sm text-gray-700">
        <span className="text-indigo-400 mt-1 shrink-0">
          <ArrowRight className="h-3 w-3" />
        </span>
        <span className="leading-relaxed">{line.slice(2)}</span>
      </div>
    );
  }
  if (line.trim() === "") return <div key={idx} className="h-1.5" />;
  return <p key={idx} className="text-sm text-gray-700 leading-relaxed">{line}</p>;
}

// ─── Main Results Page ───

export function ResultsPage({
  scores,
  assessmentId,
  onRetake,
}: {
  scores: AssessmentScores;
  assessmentId?: string | null;
  onRetake: () => void;
}) {
  const [interpretation, setInterpretation] = useState<string>("");
  const [interpretLoading, setInterpretLoading] = useState(false);
  const [interpretError, setInterpretError] = useState<string>("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [userContext, setUserContext] = useState<UserContext>({
    role: "",
    stuckPoint: "",
    breakthrough: "",
  });
  const resultsRef = useRef<HTMLDivElement>(null);

  const toggleGroup = (name: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const expandAll = () => setExpandedGroups(new Set(displayGroups.map((g) => g.name)));

  const parsedSections = interpretation ? parseInterpretation(interpretation) : [];

  // ─── AI Interpretation ───

  const fetchInterpretation = useCallback(async () => {
    if (interpretLoading || interpretation) return;
    setInterpretLoading(true);
    setInterpretError("");
    try {
      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scores_json: scores,
          context: {
            role: userContext.role || undefined,
            stuck_point: userContext.stuckPoint || undefined,
            breakthrough: userContext.breakthrough || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInterpretError(data.error || "生成失敗,請稍後再試。");
        return;
      }
      setInterpretation(data.interpretation);
      // Save interpretation to DB
      if (assessmentId) {
        fetch("/api/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save_interpretation",
            assessment_id: assessmentId,
            interpretation: data.interpretation,
          }),
        }).catch(() => {});
      }
    } catch {
      setInterpretError("網路錯誤,請檢查連線後再試。");
    } finally {
      setInterpretLoading(false);
    }
  }, [scores, userContext, interpretLoading, interpretation]);

  // ─── PDF ───

  const handleDownloadPDF = useCallback(async () => {
    if (pdfLoading || !resultsRef.current) return;
    setPdfLoading(true);
    setExpandedGroups(new Set(displayGroups.map((g) => g.name)));
    await new Promise((r) => setTimeout(r, 300));
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(resultsRef.current, {
        scale: 2, useCORS: true, logging: false, backgroundColor: "#fafbfc",
      });
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF("p", "mm", "a4");
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`人格測評結果-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("PDF 生成失敗,請稍後再試。");
    } finally {
      setPdfLoading(false);
    }
  }, [pdfLoading]);

  // ─── Share ───

  const handleShare = async () => {
    const shareData = {
      title: "個人化人格與驅動測評",
      text: "我剛完成了一份深度人格測評,來試試看你的結果!",
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert("已複製連結到剪貼簿!");
      }
    } catch {}
  };

  // ─── Render ───

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          分析完成
        </div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">你的測評結果</h1>
        <p className="mt-2 text-sm text-gray-500">
          {new Date(scores.computed_at).toLocaleString("zh-TW")}
        </p>
      </div>

      <div ref={resultsRef} className="mx-auto max-w-3xl px-4 pt-8 space-y-8">

        {/* ── 1. 一眼看懂你 ── */}
        <QuickProfile scores={scores} />

        {/* ── 2. AI 解讀 (核心區塊,置頂) ── */}
        <div className="space-y-4">
          {/* Context form + trigger */}
          {!interpretation && !interpretLoading && (
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-white to-indigo-50/30 p-6 shadow-sm space-y-5">
              <div className="text-center">
                <Sparkles className="mx-auto h-8 w-8 text-indigo-500 mb-2" />
                <h3 className="text-lg font-bold text-gray-900">
                  生成你的專屬解讀
                </h3>
                <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                  AI 會讀完你所有的作答,幫你找出分數背後的故事 — 不只是「你是什麼樣的人」,而是「為什麼你會這樣」。
                </p>
              </div>

              {/* Inline context form */}
              <ContextForm value={userContext} onChange={setUserContext} />

              <button
                onClick={fetchInterpretation}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-base font-medium text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.99]"
              >
                <Sparkles className="h-4 w-4" />
                生成我的專屬解讀
              </button>
            </div>
          )}

          {/* Loading */}
          {interpretLoading && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-12 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
              <p className="text-base font-medium text-gray-900">AI 正在讀你的數據...</p>
              <p className="mt-1 text-sm text-gray-500">大約需要 30-60 秒,正在交叉比對所有框架</p>
            </div>
          )}

          {/* Error */}
          {interpretError && (
            <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">{interpretError}</p>
                <button
                  onClick={() => { setInterpretError(""); fetchInterpretation(); }}
                  className="mt-1 text-xs text-red-600 underline"
                >
                  重試
                </button>
              </div>
            </div>
          )}

          {/* Rendered interpretation cards */}
          {parsedSections.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-gray-900">你的專屬解讀</h3>
              </div>

              {parsedSections.map((section, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden animate-fade-in"
                >
                  {/* Section title */}
                  <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                    <h4 className="text-base font-bold text-gray-900">
                      {section.title}
                    </h4>
                  </div>

                  {/* Content */}
                  <div className="px-6 py-5 space-y-1.5">
                    {section.content.map((line, j) => (
                      <InterpLine key={j} line={line} idx={j} />
                    ))}
                  </div>

                  {/* Action advice highlight box */}
                  {section.actionAdvice.length > 0 && (
                    <div className="mx-4 mb-4 rounded-xl bg-emerald-50 border border-emerald-100 px-5 py-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                        <Lightbulb className="h-4 w-4" />
                        行動建議
                      </div>
                      {section.actionAdvice.map((line, j) => (
                        <InterpLine key={j} line={line} idx={j} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 3. 你的數據明細 ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              你的數據明細
            </h3>
            <button onClick={expandAll} className="text-xs text-indigo-600 hover:underline">
              全部展開
            </button>
          </div>

          {displayGroups.map((group) => {
            const groupScores = group.constructs
              .filter((c) => scores.construct_scores[c])
              .map((c) => ({ id: c, score: scores.construct_scores[c], def: constructDefs[c] }));
            if (groupScores.length === 0) return null;

            const isExpanded = expandedGroups.has(group.name);
            const ref = FRAMEWORK_REFS[group.name];
            const summary = groupSummary(group.constructs, scores);

            return (
              <div key={group.name} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleGroup(group.name)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50/50"
                >
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-gray-900">{group.name}</h4>
                    {!isExpanded && (
                      <p className="mt-0.5 text-xs text-gray-400 truncate">{summary}</p>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-50 animate-fade-in">
                    {ref && (
                      <div className="bg-gray-50/50 px-5 py-3 space-y-1">
                        <p className="text-sm text-gray-600 leading-relaxed">{ref.groupInsight}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                          <BookOpen className="h-3 w-3" />
                          <span>{ref.source}</span>
                        </div>
                      </div>
                    )}
                    <div className="px-5 py-4 space-y-4">
                      {groupScores.map(({ id, score, def }) => (
                        <ScoreBar key={id} score={score} def={def} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── 4. 深度發現 ── */}
        {scores.cross_validations.length > 0 && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">
                深度發現
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                我們比對了不同面向的數據,發現了一些有趣的地方
              </p>
            </div>
            <div className="space-y-3">
              {scores.cross_validations.map((cv) => (
                <CvCard key={cv.id} cv={cv} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="mx-auto max-w-3xl px-4 pt-8 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onRetake}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-[0.99]"
          >
            <RotateCcw className="h-4 w-4" />
            重新測評
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-[0.99]"
          >
            <Share2 className="h-4 w-4" />
            分享給朋友
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50"
          >
            {pdfLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />生成 PDF 中...</>
            ) : (
              <><Download className="h-4 w-4" />下載 PDF 報告</>
            )}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 pb-4">
          你的測評結果僅存於當前瀏覽器,分享的是測評連結而非你的個人結果。
        </p>
      </div>
    </div>
  );
}
