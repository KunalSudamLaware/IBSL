"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeyRound, Eye, EyeOff, Check, X, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { checkPassword, passwordStrengthLevel } from "@/lib/password";

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${met ? "text-emerald-600" : "text-stone-400"}`}>
      {met ? <Check className="w-3 h-3 shrink-0 text-emerald-500" /> : <X className="w-3 h-3 shrink-0 text-stone-300" />}
      {label}
    </li>
  );
}

function StrengthBar({ level }: { level: 0 | 1 | 2 | 3 }) {
  const colors = ["", "bg-rose-500", "bg-amber-400", "bg-emerald-500"];
  const labels = ["", "Weak", "Medium", "Strong"];
  const textColors = ["", "text-rose-600", "text-amber-600", "text-emerald-600"];
  if (level === 0) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= level ? colors[level] : "bg-stone-200"}`} />
        ))}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${textColors[level]}`}>{labels[level]}</span>
    </div>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const checks = useMemo(() => checkPassword(password), [password]);
  const strengthLevel = useMemo(() => passwordStrengthLevel(password), [password]);
  const allMet = checks.minLength && checks.hasUpper && checks.hasLower && checks.hasNumber && checks.hasSpecial;
  const passwordsMatch = confirmPassword === "" ? null : password === confirmPassword;

  if (!token) {
    return (
      <div className="text-center space-y-3 py-4">
        <p className="text-sm font-semibold text-rose-700 uppercase tracking-wider">Invalid reset link</p>
        <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
          This link is missing a reset token. Please request a new one.
        </p>
        <Link href="/forgot-password" className="block mt-4 text-xs font-bold uppercase tracking-widest text-[#b89047] hover:underline">
          Request New Reset Link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!allMet) { setError("Please meet all password requirements."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to reset password. Please try again.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login?reset=1"), 2000);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4 py-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
        <p className="text-sm font-semibold text-slate-800">Password reset successfully!</p>
        <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
          Redirecting you to login…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-100 rounded-lg text-center leading-relaxed">
          {error}
        </div>
      )}

      {/* New Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-700">New Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Morya@2026"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 rounded-lg border-stone-200 text-sm focus-visible:ring-1 focus-visible:ring-[#b89047] pr-10 bg-white"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-slate-800 p-1">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {password.length > 0 && <StrengthBar level={strengthLevel} />}
        {password.length > 0 && (
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-150">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Password Requirements</p>
            <ul className="space-y-1.5">
              <Requirement met={checks.minLength} label="At least 8 characters" />
              <Requirement met={checks.hasUpper} label="One uppercase letter (A-Z)" />
              <Requirement met={checks.hasLower} label="One lowercase letter (a-z)" />
              <Requirement met={checks.hasNumber} label="One number (0-9)" />
              <Requirement met={checks.hasSpecial} label="One special character (!@#$%...)" />
            </ul>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-slate-700">Confirm New Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={`h-11 rounded-lg text-sm focus-visible:ring-1 pr-10 bg-white border-stone-200 ${passwordsMatch === false ? "border-rose-400 focus-visible:ring-rose-400" : passwordsMatch === true ? "border-emerald-400 focus-visible:ring-emerald-400" : ""}`}
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-slate-800 p-1">
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {passwordsMatch === false && <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Passwords do not match</p>}
        {passwordsMatch === true && <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1"><Check className="w-3 h-3" /> Passwords match</p>}
      </div>

      <Button
        type="submit"
        disabled={loading || !allMet || passwordsMatch === false}
        className="w-full h-11 text-xs font-bold tracking-widest uppercase bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
      >
        {loading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-6 py-12 bg-[#FAF9F6] text-slate-900 antialiased font-sans">
      <div className="w-full max-w-md bg-white border border-stone-200 p-8 rounded-lg shadow-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 flex items-center justify-center border border-stone-200 bg-stone-50 mb-4 text-[#b89047] rounded-lg">
            <KeyRound className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-1">Account Security</span>
          <h1 className="text-2xl font-serif font-normal text-slate-900 mb-2">Reset Password</h1>
          <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
            Choose a new strong password
          </p>
        </div>
        <Suspense fallback={<div className="text-center text-xs text-stone-400 font-semibold uppercase tracking-wider">Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
      <Link href="/login" className="mt-6 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5">
        Back to Login
      </Link>
    </div>
  );
}