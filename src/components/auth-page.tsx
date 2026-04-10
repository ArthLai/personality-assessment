"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Mail, Lock, Loader2, Brain, Eye, EyeOff, Sparkles, BarChart3, Target, Zap } from "lucide-react";

type Mode = "login" | "signup";

export function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || loading) return;

    setLoading(true);
    setError("");

    const supabase = createClient();

    if (mode === "signup") {
      if (password.length < 6) {
        setError("密碼至少需要 6 個字元");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes("already registered")) {
          setError("這個 email 已經註冊過了,請直接登入");
        } else {
          setError(error.message);
        }
      }
      // signUp with email confirmation disabled will auto-login
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login")) {
          setError("Email 或密碼錯誤");
        } else {
          setError(error.message);
        }
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-100 mb-4">
            <Brain className="h-7 w-7 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">人格與驅動測評</h1>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            {mode === "login"
              ? "登入後繼續你的測評"
              : "註冊後開始你的深度人格分析"}
          </p>
        </div>

        {/* What you'll get */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm mb-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">測完你會得到</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-800">人格數據圖表</p>
                <p className="text-[11px] text-gray-400">10 個框架、40+ 項指標</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-800">深度模式發現</p>
                <p className="text-[11px] text-gray-400">找出你行為裡的隱藏規律</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Sparkles className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-800">AI 專屬解讀</p>
                <p className="text-[11px] text-gray-400">不是罐頭報告,是針對你寫的</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Target className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-800">行動建議</p>
                <p className="text-[11px] text-gray-400">明天就能開始做的具體步驟</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4"
        >
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                required
                placeholder="你的 email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-300 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">密碼</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder={mode === "signup" ? "設定密碼（至少 6 字元）" : "你的密碼"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-10 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-300 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {mode === "login" ? "登入中..." : "註冊中..."}
              </span>
            ) : mode === "login" ? (
              "登入"
            ) : (
              "註冊"
            )}
          </button>

          {/* Toggle mode */}
          <p className="text-center text-sm text-gray-500">
            {mode === "login" ? (
              <>
                還沒有帳號？
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                  className="text-indigo-600 font-medium hover:underline ml-1"
                >
                  註冊
                </button>
              </>
            ) : (
              <>
                已經有帳號？
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="text-indigo-600 font-medium hover:underline ml-1"
                >
                  登入
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
