"use client";

import spec from "@/data/assessment-spec.json";
import { Brain, Clock, Layers, Shield } from "lucide-react";

const FRAMEWORK_ICONS: Record<string, string> = {
  BIG_FIVE: "🧬",
  HEXACO: "🤝",
  SDT: "🔋",
  REISS: "🧭",
  RF: "⚖️",
  MINDSET_NFC: "🧠",
  COG_STYLE: "💡",
  CAPS: "🎭",
  COPING: "🛡️",
  SELF_ID: "🪞",
};

export function IntroPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
            <Brain className="h-4 w-4" />
            整合 {spec.frameworks.length} 個心理學框架
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {spec.meta.name}
          </h1>
          <p className="mb-8 text-lg text-gray-600 leading-relaxed">
            {spec.meta.description}
          </p>

          {/* Stats */}
          <div className="mb-8 flex justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-2 text-gray-600">
              <Layers className="h-5 w-5 text-indigo-500" />
              <span className="text-sm">
                <strong className="text-gray-900">{spec.meta.totalQuestions}</strong> 題
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-5 w-5 text-indigo-500" />
              <span className="text-sm">
                <strong className="text-gray-900">{spec.meta.estimatedMinutes}</strong> 分鐘
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="h-5 w-5 text-indigo-500" />
              <span className="text-sm">隱私安全</span>
            </div>
          </div>

          <button
            onClick={onStart}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-8 text-base font-medium text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 active:scale-[0.98]"
          >
            開始測評
          </button>
        </div>
      </div>

      {/* Frameworks */}
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="mb-6 text-center text-lg font-semibold text-gray-900">
          涵蓋的心理學框架
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {spec.frameworks.map((fw) => (
            <div
              key={fw.id}
              className="flex gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-2xl leading-none">
                {FRAMEWORK_ICONS[fw.id] || "📊"}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 leading-snug">
                  {fw.name}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                  {fw.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          所有作答資料僅存於你的瀏覽器,不會上傳至伺服器。你可以隨時關閉頁面,下次回來繼續。
        </p>
      </div>
    </div>
  );
}
