"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserPlus, Eye, EyeOff, ArrowLeft, ArrowRight, Phone } from "lucide-react";
import Link from "next/link";
import { checkPassword, passwordStrengthLevel } from "@/lib/password";

// â”€â”€â”€ Password Strength Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
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

// â”€â”€â”€ Password Requirement Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${met ? "text-emerald-600" : "text-stone-400"}`}>
      {met ? (
        <svg className="w-3 h-3 shrink-0 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      ) : (
        <svg className="w-3 h-3 shrink-0 text-stone-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      )}
      {label}
    </li>
  );
}

// â”€â”€â”€ Register Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

      // Registration succeeded â€” redirect to OTP verification page
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-6 py-12 bg-[#FAF9F6] text-slate-900 antialiased font-sans">
      <div className="w-full max-w-md bg-white border border-stone-200 p-8 rounded-lg shadow-sm flex flex-col">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 flex items-center justify-center border border-stone-200 bg-stone-50 mb-4 text-[#b89047] rounded-lg">
            <UserPlus className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-1">Create Account</span>
          <h1 className="text-2xl font-serif font-normal text-slate-900 mb-2">Create Your Account</h1>
          <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
            Join the Morya Designs architectural marketplace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Global Error */}
          {error && (
            <div className="p-3 text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-100 rounded-lg text-center leading-relaxed">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-700">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 rounded-lg border-stone-200 text-sm focus-visible:ring-1 focus-visible:ring-[#b89047] bg-white"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-700">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 rounded-lg border-stone-200 text-sm focus-visible:ring-1 focus-visible:ring-[#b89047] bg-white"
            />
          </div>

          {/* Mobile Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-700">
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
                className="h-11 rounded-lg border-stone-200 text-sm focus-visible:ring-1 focus-visible:ring-[#b89047] bg-white tracking-widest"
              />
            </div>
            <p className="text-[10px] text-stone-400 font-semibold">
              10-digit number only â€” no spaces, or letters
            </p>
            {phone.length > 0 && phone.length < 10 && (
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                {10 - phone.length} more digit{10 - phone.length !== 1 ? "s" : ""} needed
              </p>
            )}
            {phone.length === 10 && !/^[0-9]{10}$/.test(phone) && (
              <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                Enter a valid 10-digit mobile number.
              </p>
            )}
            {phone.length === 10 && /^[0-9]{10}$/.test(phone) && (
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Valid mobile number
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-700">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Morya@2026"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                required
                className="h-11 rounded-lg border-stone-200 text-sm focus-visible:ring-1 focus-visible:ring-[#b89047] pr-10 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-slate-800 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength bar */}
            {password.length > 0 && <StrengthBar level={strengthLevel} />}

            {/* Requirements checklist */}
            {(passwordFocused || password.length > 0) && (
              <div className="mt-2 p-3 bg-stone-50 rounded-lg border border-stone-150">
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
            <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-slate-700">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`h-11 rounded-lg text-sm focus-visible:ring-1 pr-10 bg-white border-stone-200 ${
                  passwordsMatch === false
                    ? "border-rose-400 focus-visible:ring-rose-400"
                    : passwordsMatch === true
                    ? "border-emerald-400 focus-visible:ring-emerald-400"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-slate-800 transition-colors p-1"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordsMatch === false && (
              <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                Passwords do not match
              </p>
            )}
            {passwordsMatch === true && (
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Passwords match
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 text-xs font-bold tracking-widest uppercase bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors border border-slate-900 mt-2 flex items-center justify-center gap-1.5"
            disabled={loading || !allMet || passwordsMatch === false || phone.length !== 10 || !name || !email}
          >
            {loading ? "Creating Account..." : <>Register Account <ArrowRight className="w-3.5 h-3.5 text-[#b89047]" /></>}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-500 font-semibold uppercase tracking-wider">
          Already have an account?{" "}
          <Link href="/login" className="text-[#b89047] hover:underline">
            Login here
          </Link>
        </div>
      </div>

      {/* Back Link */}
      <Link
        href="/"
        className="mt-6 text-xs font-bold uppercase tracking-widest text-slate-650 hover:text-slate-900 transition-colors flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>
    </div>
  );
}
