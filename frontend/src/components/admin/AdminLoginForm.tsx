"use client";

import { AlertCircle, Lock, User as UserIcon } from "lucide-react";

import type { AuthCopy } from "./authTranslations";

interface AdminLoginFormProps {
  authT: AuthCopy;
  emailInput: string;
  passwordInput: string;
  authError: string;
  isSigningIn: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AdminLoginForm({
  authT,
  emailInput,
  passwordInput,
  authError,
  isSigningIn,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AdminLoginFormProps) {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-md p-8 shadow-2xl dark:border-slate-800/40 dark:bg-slate-900/70">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20">
          <Lock className="h-6 w-6" />
        </div>
        <div className="mt-6 text-center">
          <h2 className="font-serif text-2xl font-black text-slate-900 dark:text-white leading-snug">
            {authT.loginTitle}
          </h2>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 max-w-70 mx-auto">
            {authT.loginSubtitle}
          </p>
        </div>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <UserIcon className="h-3 w-3" />
              {authT.emailLabel}
            </label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="john@example.com"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 px-4 text-xs font-semibold focus:border-amber-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950/50 dark:focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              {authT.passwordLabel}
            </label>
            <input
              type="password"
              required
              value={passwordInput}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 px-4 text-xs font-semibold focus:border-amber-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950/50 dark:focus:border-amber-500"
            />
          </div>

          {authError && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-500 bg-rose-50/50 p-2.5 rounded-xl dark:bg-rose-950/10">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSigningIn}
            className="w-full flex h-12 items-center justify-center rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 text-sm font-bold text-white shadow-xl shadow-orange-500/10 hover:from-amber-600 hover:to-orange-600 active:scale-98 transition-all duration-200"
          >
            {isSigningIn ? "Signing in..." : authT.loginBtn}
          </button>
        </form>
      </div>
    </div>
  );
}
