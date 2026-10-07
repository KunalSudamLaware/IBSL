"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeyRound, ArrowLeft, ArrowRight, Loader2, CheckCircle2, ShieldCheck, Mail } from "lucide-react";
import Link from "next/link";

type Step = "EMAIL" | "OTP" | "VERIFIED";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown for resending OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0 && step === "OTP") {
      timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown, step]);

  // Focus first OTP field upon entering OTP step
  useEffect(() => {
    if (step === "OTP") {
      const timer = setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const validateEmail = (val: string): string | null => {
    const trimmed = val.trim();
    if (!trimmed) {
      return "Email address is required.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return "Please enter a valid email address.";
    }
    return null;
  };

  // â”€â”€ Step 1: Send OTP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Failed to send verification code. Please try again.");
      } else {
        setCooldown(60);
        setOtp(["", "", "", "", "", ""]);
        setOtpError("");
        setResendSuccess("");
        setStep("OTP");
      }
    } catch {
      setError("Network error. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // â”€â”€ Step 2: OTP Input Handling â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const focusInput = (index: number) => {
    if (index >= 0 && index < 6) {
      inputsRef.current[index]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        focusInput(index - 1);
      }
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (!rawValue) {
      const updated = [...otp];
      updated[index] = "";
      setOtp(updated);
      return;
    }

    const char = rawValue[rawValue.length - 1];
    const updated = [...otp];
    updated[index] = char;
    setOtp(updated);
    if (otpError) setOtpError("");

    if (index < 5) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const updated = [...otp];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || "";
    }
    setOtp(updated);
    if (otpError) setOtpError("");
    focusInput(Math.min(pasted.length, 5));
  };

  // â”€â”€ Step 2: Verify OTP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");

    const otpCode = otp.join("");
    if (otpCode.length !== 6 || !/^[0-9]{6}$/.test(otpCode)) {
      setOtpError("Please enter the complete 6-digit verification code.");
      return;
    }

    setVerifying(true);

    try {
      const res = await fetch("/api/auth/forgot-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otpCode,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setOtpError(data?.error || "Verification failed. Please try again.");
      } else {
        setResetToken(data?.resetToken || null);
        setStep("VERIFIED");
      }
    } catch {
      setOtpError("Network error. Please check your internet connection and try again.");
    } finally {
      setVerifying(false);
    }
  };

  // â”€â”€ Step 2: Resend OTP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setOtpError("");
    setResendSuccess("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setOtpError(data?.error || "Failed to resend code. Please try again.");
      } else {
        setCooldown(60);
        setOtp(["", "", "", "", "", ""]);
        focusInput(0);
        setResendSuccess("A new verification code has been sent to your email.");
      }
    } catch {
      setOtpError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-6 py-16 bg-[#FAF9F6] text-slate-900 antialiased font-sans relative overflow-hidden">
      
      {/* Background Decorative Gradient */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-stone-100 to-transparent pointer-events-none -z-10" />

      {/* Main Card */}
      <div className="w-full max-w-[420px] bg-white border border-stone-200/60 p-10 rounded-[24px] shadow-lg shadow-stone-200/50 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* â”€â”€â”€ State 1: EMAIL INPUT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {step === "EMAIL" && (
          <>
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 flex items-center justify-center border border-[#b89047]/20 bg-stone-50 mb-5 text-[#b89047] rounded-full shadow-sm">
                <KeyRound className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-2">
                Morya Designs
              </span>
              <h1 className="text-3xl font-serif font-bold text-slate-900 mb-3 tracking-tight">
                Forgot Password?
              </h1>
              <p className="text-[13px] text-stone-500 font-medium leading-relaxed max-w-[320px]">
                Enter your registered email address and we&apos;ll send you a verification code to reset your password.
              </p>
            </div>

            <form onSubmit={handleSendEmail} noValidate className="space-y-6">
              {error && (
                <div className="p-4 text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-100 rounded-xl text-center shadow-sm animate-in fade-in zoom-in-95 duration-300">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-slate-800">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={loading}
                  required
                  className="h-12 px-4 rounded-xl border-stone-200 text-sm focus-visible:ring-2 focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047] bg-white transition-all shadow-sm"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-xs font-bold tracking-widest uppercase text-white rounded-xl bg-slate-900 hover:bg-slate-800 hover:-translate-y-0.5 shadow-md shadow-slate-900/10 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#b89047]" /> Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Verification Code <ArrowRight className="w-4 h-4 text-[#b89047]" />
                    </span>
                  )}
                </Button>
              </div>
            </form>

            {/* Back to Login inside card */}
            <div className="mt-8 pt-8 border-t border-stone-150 text-center text-[11px] text-stone-500 font-bold uppercase tracking-widest">
              Remember your password?{" "}
              <Link href="/login" className="text-[#b89047] hover:text-[#8a6a32] transition-colors">
                Back to Login
              </Link>
            </div>
          </>
        )}

        {/* â”€â”€â”€ State 2: OTP VERIFICATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {step === "OTP" && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 flex items-center justify-center border border-[#b89047]/20 bg-stone-50 mb-4 text-[#b89047] rounded-full shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-1">
                Security Verification
              </span>
              <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
                Verify Your Email
              </h1>
              <p className="text-[12px] text-stone-500 font-medium mt-1">
                We sent a 6-digit verification code to
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 px-3 py-1 bg-stone-50 border border-stone-200/60 rounded-lg">
                <Mail className="w-3.5 h-3.5 text-[#b89047]" />
                <span className="text-xs font-semibold text-slate-800 break-all">{email}</span>
              </div>
            </div>

            {/* Notifications */}
            {otpError && (
              <div className="p-3.5 mb-4 text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-100 rounded-xl text-center shadow-sm animate-in fade-in duration-300">
                {otpError}
              </div>
            )}

            {resendSuccess && (
              <div className="p-3.5 mb-4 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl text-center shadow-sm animate-in fade-in duration-300">
                {resendSuccess}
              </div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center gap-2 sm:gap-2.5 my-6">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputsRef.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onChange={(e) => handleOtpChange(e, index)}
                    onPaste={handlePaste}
                    disabled={verifying}
                    className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl transition-all shadow-sm ${
                      digit
                        ? "border-[#b89047] ring-1 ring-[#b89047] text-slate-900 bg-white"
                        : "border-stone-200 text-slate-900 bg-white focus-visible:ring-2 focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047]"
                    }`}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <Button
                type="submit"
                disabled={verifying || otp.join("").length < 6}
                className="w-full h-12 text-xs font-bold tracking-widest uppercase text-white rounded-xl bg-slate-900 hover:bg-slate-800 hover:-translate-y-0.5 shadow-md shadow-slate-900/10 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {verifying ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#b89047]" /> Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Verify Code <ArrowRight className="w-4 h-4 text-[#b89047]" />
                  </span>
                )}
              </Button>
            </form>

            {/* Resend OTP Section with Cooldown */}
            <div className="mt-6 pt-6 border-t border-stone-150 flex flex-col items-center gap-3 text-center">
              <Button
                type="button"
                variant="ghost"
                disabled={cooldown > 0 || resending || verifying}
                onClick={handleResend}
                className="text-[11px] font-bold uppercase tracking-widest text-stone-500 hover:text-slate-900 hover:bg-stone-50 h-9 px-4 rounded-lg transition-colors"
              >
                {resending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#b89047]" /> Sending...
                  </span>
                ) : cooldown > 0 ? (
                  <span className="text-stone-400">
                    Resend code in <span className="text-[#b89047] font-semibold">{cooldown}s</span>
                  </span>
                ) : (
                  "Didn't receive the code? Resend Code"
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep("EMAIL");
                  setOtp(["", "", "", "", "", ""]);
                  setOtpError("");
                  setError("");
                }}
                className="text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-slate-700 transition-colors"
              >
                Change email address
              </button>
            </div>
          </div>
        )}

        {/* â”€â”€â”€ State 3: STEP 2 VERIFIED (READY FOR STEP 3) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {step === "VERIFIED" && (
          <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-500 py-2">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block">
                Verification Successful
              </span>
              <h2 className="text-2xl font-serif font-bold text-slate-900">
                Email Verified!
              </h2>
              <div className="p-4 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl leading-relaxed shadow-sm">
                Your 6-digit verification code has been confirmed. You are now authorized to reset your password.
              </div>
            </div>

            <p className="text-[12px] text-stone-500 font-medium leading-relaxed">
              Step 2 is complete. Proceed to set your new password.
            </p>

            <div className="pt-2 space-y-3">
              {resetToken ? (
                <Link
                  href={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                  className="inline-flex items-center justify-center w-full h-12 text-xs font-bold tracking-widest uppercase text-white rounded-xl bg-slate-900 hover:bg-slate-800 hover:-translate-y-0.5 shadow-md shadow-slate-900/10 transition-all duration-300"
                >
                  Continue to Set New Password <ArrowRight className="w-4 h-4 text-[#b89047] ml-2" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full h-12 text-xs font-bold tracking-widest uppercase text-white rounded-xl bg-slate-900 hover:bg-slate-800 hover:-translate-y-0.5 shadow-md shadow-slate-900/10 transition-all duration-300"
                >
                  Back to Login
                </Link>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Back to Login Link Outside Card */}
      <Link
        href="/login"
        className="mt-8 text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-slate-900 transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
      </Link>
    </div>
  );
}
