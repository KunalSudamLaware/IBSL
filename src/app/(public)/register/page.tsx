"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserPlus, Eye, EyeOff, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { checkPassword, passwordStrengthLevel } from "@/lib/password";

// ─── Password Strength Bar ────────────────────────────────────────────────────────

function StrengthBar({ level }: { level: 0 | 1 | 2 | 3 }) {
  const labels = ["", "Weak", "Medium", "Strong"];
  const colors = [
    "",
    "bg-rose-500",
    "bg-amber-400",
    "bg-emerald-500",
  ];
  const textColors = ["", "text-rose-600", "text-amber-600", "text-emerald-600"];

  if (level === 0) return null;

  return (
    <div className="mt-2.5 space-y-2 animate-in fade-in duration-300">
      <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i <= level ? colors[level] : "bg-stone-200"
            }`}
          />
        ))}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${textColors[level]}`}>
        {labels[level]}
      </span>
    </div>
  );
}

// ─── Password Requirement Row ───────────────────────────────────────────────────

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${met ? "text-emerald-600" : "text-stone-400"}`}>
      {met ? (
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
      ) : (
        <svg className="w-3.5 h-3.5 shrink-0 text-stone-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      )}
      {label}
    </li>
  );
}

// ─── Register Page ─────────────────────────────────────────────────────────────────

export default function CustomerRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const checks = useMemo(() => checkPassword(password), [password]);
  const strengthLevel = useMemo(() => passwordStrengthLevel(password), [password]);
  const allMet = checks.minLength && checks.hasUpper && checks.hasLower && checks.hasNumber && checks.hasSpecial;
  const passwordsMatch = confirmPassword === "" ? null : password === confirmPassword;

  // Phone: only allow digits, max 10
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side guards (server re-validates independently)
    if (!allMet) {
      setError("Please meet all password requirements before submitting.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Registration succeeded — redirect to OTP verification page
      setSuccess(true);
      setTimeout(() => {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      }, 800);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-6 py-16 bg-[#FAF9F6] text-slate-900 antialiased font-sans relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-stone-100 to-transparent pointer-events-none -z-10" />
      
      <div className="w-full max-w-[420px] bg-white border border-stone-200/60 p-10 rounded-[24px] shadow-lg shadow-stone-200/50 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-14 h-14 flex items-center justify-center border border-[#b89047]/20 bg-stone-50 mb-5 text-[#b89047] rounded-full shadow-sm">
            <UserPlus className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-2">Create Account</span>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mb-3 tracking-tight">Create Your Account</h1>
          <p className="text-[13px] text-stone-500 font-medium leading-relaxed max-w-[280px]">
            Join the Morya Designs architectural marketplace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Global Error */}
          {error && (
            <div className="p-4 text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-100 rounded-xl text-center shadow-sm animate-in fade-in zoom-in-95 duration-300">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-2.5">
            <Label htmlFor="name" className="text-[11px] font-bold uppercase tracking-widest text-slate-800">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 px-4 rounded-xl border-stone-200 text-sm focus-visible:ring-2 focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047] bg-white transition-all shadow-sm"
            />
          </div>

          {/* Email */}
          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-slate-800">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 px-4 rounded-xl border-stone-200 text-sm focus-visible:ring-2 focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047] bg-white transition-all shadow-sm"
            />
          </div>

          {/* Mobile Number */}
          <div className="space-y-2.5">
            <Label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-widest text-slate-800">
              Mobile Number <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                pattern="[0-9]{10}"
                placeholder="9876543210"
                value={phone}
                onChange={handlePhoneChange}
                required
                className="h-12 px-4 rounded-xl border-stone-200 text-sm focus-visible:ring-2 focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047] bg-white tracking-widest transition-all shadow-sm"
              />
            </div>
            
            <div className="flex flex-col gap-1 mt-1 animate-in fade-in duration-300">
              {phone.length === 0 && (
                <p className="text-[10px] text-stone-400 font-bold tracking-wider uppercase">
                  10-digit number only
                </p>
              )}
              {phone.length > 0 && phone.length < 10 && (
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                  {10 - phone.length} more digit{10 - phone.length !== 1 ? "s" : ""} needed
                </p>
              )}
              {phone.length === 10 && !/^[0-9]{10}$/.test(phone) && (
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                  Invalid mobile number.
                </p>
              )}
              {phone.length === 10 && /^[0-9]{10}$/.test(phone) && (
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid mobile number
                </p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2.5">
            <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest text-slate-800">Password</Label>
            <div className="relative group">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Morya@2026"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
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

            {/* Strength bar */}
            {password.length > 0 && <StrengthBar level={strengthLevel} />}

            {/* Requirements checklist */}
            {(passwordFocused || password.length > 0) && (
              <div className="mt-3 p-4 bg-stone-50 rounded-xl border border-stone-200/60 animate-in fade-in zoom-in-95 duration-300">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-3">Password Requirements</p>
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

          {/* Confirm Password */}
          <div className="space-y-2.5">
            <Label htmlFor="confirmPassword" className="text-[11px] font-bold uppercase tracking-widest text-slate-800">Confirm Password</Label>
            <div className="relative group">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`h-12 px-4 rounded-xl text-sm focus-visible:ring-2 pr-12 bg-white transition-all shadow-sm ${
                  passwordsMatch === false
                    ? "border-rose-300 focus-visible:ring-rose-200 focus-visible:border-rose-400"
                    : passwordsMatch === true
                    ? "border-emerald-300 focus-visible:ring-emerald-200 focus-visible:border-emerald-400"
                    : "border-stone-200 focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#b89047] transition-colors p-1.5 focus:outline-none rounded-md focus-visible:ring-2 focus-visible:ring-[#b89047]/20"
              >
                {showConfirm ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
              </button>
            </div>
            <div className="h-4 mt-1">
              {passwordsMatch === false && (
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider animate-in fade-in duration-300">
                  Passwords do not match
                </p>
              )}
              {passwordsMatch === true && (
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1 animate-in fade-in duration-300">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              className={`w-full h-12 text-xs font-bold tracking-widest uppercase text-white rounded-xl transition-all duration-300 shadow-md ${
                success 
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20" 
                  : "bg-slate-900 hover:bg-slate-800 hover:-translate-y-0.5 shadow-slate-900/10"
              }`}
              disabled={loading || success || !allMet || passwordsMatch === false || phone.length !== 10 || !name || !email}
            >
              {loading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</span>
              ) : success ? (
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Success! Redirecting...</span>
              ) : (
                <span className="flex items-center gap-2">Register Account <ArrowRight className="w-4 h-4 text-[#b89047]" /></span>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-stone-150 text-center text-[11px] text-stone-500 font-bold uppercase tracking-widest">
          Already have an account?{" "}
          <Link href="/login" className="text-[#b89047] hover:text-[#8a6a32] transition-colors">
            Login here
          </Link>
        </div>
      </div>

      {/* Back Link */}
      <Link
        href="/"
        className="mt-8 text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-slate-900 transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>
    </div>
  );
}
