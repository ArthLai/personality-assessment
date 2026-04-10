"use client";

import { cn } from "@/lib/utils";
import type { CrossValidationResult } from "@/types/assessment";
import { CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

const STATUS_CONFIG = {
  consistent: {
    icon: CheckCircle2,
    label: "高度一致",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconColor: "text-emerald-500",
    labelColor: "text-emerald-700",
  },
  inconsistent: {
    icon: AlertTriangle,
    label: "有趣的矛盾",
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconColor: "text-amber-500",
    labelColor: "text-amber-700",
  },
  pattern_detected: {
    icon: Lightbulb,
    label: "發現一個模式",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    iconColor: "text-indigo-500",
    labelColor: "text-indigo-700",
  },
};

export function CvCard({ cv }: { cv: CrossValidationResult }) {
  const config = STATUS_CONFIG[cv.status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-xl border p-5 space-y-3 animate-fade-in",
        config.bg,
        config.border
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn("h-5 w-5 shrink-0", config.iconColor)} />
        <div>
          <span className={cn("text-xs font-semibold uppercase tracking-wide", config.labelColor)}>
            {config.label}
          </span>
          <h4 className="text-sm font-bold text-gray-900">{cv.name}</h4>
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">
        {cv.explanation}
      </p>
    </div>
  );
}
