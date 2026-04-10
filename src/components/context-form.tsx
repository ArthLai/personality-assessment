"use client";

import { useState } from "react";
import { User, Target, Rocket } from "lucide-react";

export interface UserContext {
  role: string;
  stuckPoint: string;
  breakthrough: string;
}

const ROLE_OPTIONS = [
  "上班族",
  "自由工作者",
  "創業者",
  "學生",
  "轉職中",
  "管理職",
  "退休 / 空窗期",
];

export function ContextForm({
  value,
  onChange,
}: {
  value: UserContext;
  onChange: (ctx: UserContext) => void;
}) {
  const [customRole, setCustomRole] = useState("");

  return (
    <div className="space-y-4 rounded-xl bg-gray-50/80 p-5 border border-gray-100">
      <div>
        <h4 className="text-sm font-bold text-gray-800">告訴我們更多關於你</h4>
        <p className="mt-0.5 text-xs text-gray-400">
          選填,但填了會讓解讀更準、建議更具體
        </p>
      </div>

      {/* Role */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
          <User className="h-3.5 w-3.5 text-indigo-500" />
          你現在是什麼角色?
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ROLE_OPTIONS.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => onChange({ ...value, role })}
              className={`rounded-lg px-2.5 py-1 text-xs transition-all ${
                value.role === role
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
              }`}
            >
              {role}
            </button>
          ))}
          <input
            type="text"
            placeholder="其他..."
            value={value.role && !ROLE_OPTIONS.includes(value.role) ? value.role : customRole}
            onChange={(e) => {
              setCustomRole(e.target.value);
              onChange({ ...value, role: e.target.value });
            }}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 outline-none placeholder:text-gray-300 focus:border-indigo-300 w-20"
          />
        </div>
      </div>

      {/* Stuck point */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
          <Target className="h-3.5 w-3.5 text-indigo-500" />
          你最近卡在什麼事上?
        </label>
        <textarea
          className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-300 focus:border-indigo-300"
          rows={2}
          maxLength={200}
          placeholder="例如:知道該做什麼但一直沒行動、團隊溝通老是卡住..."
          value={value.stuckPoint}
          onChange={(e) => onChange({ ...value, stuckPoint: e.target.value })}
        />
      </div>

      {/* Breakthrough */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
          <Rocket className="h-3.5 w-3.5 text-indigo-500" />
          你最想改變什麼?
        </label>
        <textarea
          className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-300 focus:border-indigo-300"
          rows={2}
          maxLength={200}
          placeholder="例如:想當能帶人的人、想找到真正有熱情的方向..."
          value={value.breakthrough}
          onChange={(e) => onChange({ ...value, breakthrough: e.target.value })}
        />
      </div>
    </div>
  );
}
