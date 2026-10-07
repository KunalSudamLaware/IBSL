"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeyRound, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { checkPassword, passwordStrengthLevel } from "@/lib/password";

function StrengthBar({ level }: { level: 0 | 1 | 2 | 3 }) {
  const labels = ["", "Weak", "Medium", "Strong"];
  const colors = ["", "bg-rose-500", "bg-amber-400", "bg-emerald-500"];
  const textColors = ["", "text-rose-600", "text-amber-600", "text-emerald-600"];

  if (level === 0) return null;

  return (
    <div className="mt-2.5 space-y-2 animate-in fade-in duration-300">
      <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= level ? colors[level] : "bg-stone-200"}`}
          />
        ))}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${textColors[level]}`}>
        {labels[level]}
      </span>
    </div>
  );
}

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${met ? "text-emerald-600" : "text-stone-400"}`}>
      {met ? (
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
      ) : (
        <svg className="w-3.5 h-3.5 shrink-0 text-stone-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      )}
      {label}
    </li>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const checks = useMemo(() => checkPassword(password), [password]);
  const strengthLevel = useMemo(() => passwordStrengthLevel(password), [password]);
  const allMet = checks.minLength && checks.hasUpper && checks.hasLower && checks.hasNumber && checks.hasSpecial;
  const passwordsMatch = confirmPassword === "" ? null : password === confirmPassword;

  // Protect against direct manual access without a token
  if (!token) {
    return (
      <div className="text-center py-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-600 border border-rose-100 shadow-sm mb-4">
          <KeyRound className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Reset Link</h2>
        <p className="text-sm text-stone-500 mb-6">You must use a valid password reset link from your email.</p>
        <Link href="/forgot-password" className="text-xs font-bold uppercase tracking-widest text-slate-900 underline hover:text-[#b89047] transition-colors">
          Return to Forgot Password
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!allMet) {
      setError("Please meet all password requirements before submitting.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Failed to reset password. Please try again.");
      } else {
        router.push("/login?reset=1");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-2">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-14 h-14 flex items-center justify-center border border-[#b89047]/20 bg-stone-50 mb-5 text-[#b89047] rounded-full shadow-sm">
          <KeyRound className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-2">
          Security Update
        </span>
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-3 tracking-tight">
          Create New Password
        </h1>
        <p className="text-[13px] text-stone-500 font-medium leading-relaxed max-w-[320px]">
          Enter a new password for your Morya Designs account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-100 rounded-xl text-center shadow-sm animate-in fade-in zoom-in-95 duration-300">
            {error}
          </div>
        )}

        <div className="space-y-2.5">
          <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest text-slate-800">
            New Password
          </Label>
          <div className="relative group">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              required
              className="h-12 px-4 rounded-xl border-stone-200 text-sm focus-visible:ring-2 focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047] pr-12 bg-white transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#b89047] transition-colors p-1.5 focus:outline-none rounded-md focus-visible:ring-2 focus-visible:ring-[#b89047]/20"
            >
              {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
            </button>
          </div>

          {password.length > 0 && <StrengthBar level={strengthLevel} />}

          {(passwordFocused || password.length > 0) && (
            <div className="mt-3 p-4 bg-stone-50 rounded-xl border border-stone-200/60 animate-in fade-in zoom-in-95 duration-300">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-3">
                Password Requirements
              </p>
              <ul className="space-y-2">
                <Requirement met={checks.minLength} label="At least 8 characters" />
                <Requirement met={checks.hasUpper} label="One uppercase letter (A-Z)" />
                <Requirement met={checks.hasLower} label="One lowercase letter (a-z)" />
                <Requirement met={checks.hasNumber} label="One number (0-9)" />
                <Requirement met={checks.hasSpecial} label="One special character (!@#$%...)" />
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="confirmPassword" className="text-[11px] font-bold uppercase tracking-widest text-slate-800">
            Confirm New Password
          </Label>
          <div className="relative group">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError("");
              }}
              required
              className={`h-12 px-4 rounded-xl text-sm focus-visible:ring-2 pr-12 bg-white transition-all shadow-sm ${passwordsMatch === false ? "border-rose-300 focus-visible:ring-rose-200 focus-visible:border-rose-400" : passwordsMatch === true ? "border-emerald-300 focus-visible:ring-emerald-200 focus-visible:border-emerald-400" : "border-stone-200 focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047]"}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#b89047] transition-colors p-1.5 focus:outline-none rounded-md focus-visible:ring-2 focus-visible:ring-[#b89047]/20"
            >
              {showConfirm ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={loading || (password.length > 0 && !allMet) || (confirmPassword.length > 0 && !passwordsMatch)}
            className="w-full h-12 text-xs font-bold tracking-widest uppercase text-white rounded-xl bg-slate-900 hover:bg-slate-800 hover:-translate-y-0.5 shadow-md shadow-slate-900/10 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#b89047]" /> Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Reset Password <ArrowRight className="w-4 h-4 text-[#b89047]" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] py-16 px-6 flex flex-col items-center justify-center text-slate-800 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-stone-100 to-transparent pointer-events-none -z-10" />
      <div className="w-full max-w-[420px] bg-white border border-stone-200/60 p-10 rounded-[24px] shadow-lg shadow-stone-200/50 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-700 w-full" />
        <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-[#b89047]" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}