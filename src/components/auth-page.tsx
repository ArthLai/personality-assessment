"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Mail, Loader2, CheckCircle2, Brain } from "lucide-react";

export function AuthPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-100 mb-4">
            <Brain className="h-7 w-7 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">人格與驅動測評</h1>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            登入後開始你的深度人格分析,測評進度會自動儲存
          </p>
        </div>

        {sent ? (
          /* Success state */
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h2 className="text-base font-bold text-gray-900">
              驗證連結已寄出!
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              請到 <strong className="text-gray-700">{email}</strong> 的信箱點擊連結登入。
              <br />
              如果沒看到,請檢查垃圾郵件匣。
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="mt-2 text-xs text-indigo-600 hover:underline"
            >
              換一個 email
            </button>
          </div>
        ) : (
          /* Login form */
          <form onSubmit={handleLogin} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
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

            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  寄送中...
                </span>
              ) : (
                "寄送登入連結"
              )}
            </button>

            <p className="text-center text-[11px] text-gray-400">
              不需要密碼,我們會寄一封含登入連結的 email 給你
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
