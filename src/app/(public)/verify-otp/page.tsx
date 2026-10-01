"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!emailParam) {
      setError("Email is missing. Please register again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailParam, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed. Please try again.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login?verified=true"), 2000);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError("");
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailParam }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to resend OTP.");
      } else {
        setCooldown(60);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (!emailParam) {
    return (
      <div className="text-center space-y-3 py-4">
        <p className="text-sm font-semibold text-rose-700 uppercase tracking-wider">Missing Email</p>
        <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
          We couldn't find your email address. Please register again.
        </p>
        <Link href="/register" className="block mt-4 text-xs font-bold uppercase tracking-widest text-[#b89047] hover:underline">
          Go to Registration
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4 py-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
        <p className="text-sm font-semibold text-slate-800">Email Verified Successfully!</p>
        <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
          Redirecting you to login...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <p className="text-sm text-slate-600 mb-2">We sent a 6-digit code to</p>
        <p className="font-semibold text-slate-900">{emailParam}</p>
      </div>

      <form onSubmit={handleVerify} className="space-y-5">
        {error && (
          <div className="p-3 text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-100 rounded-lg text-center leading-relaxed">
            {error}
          </div>
        )}
        
        <div className="space-y-2 flex flex-col items-center">
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            className="h-14 w-full max-w-[200px] text-center text-2xl tracking-[0.5em] font-bold rounded-lg border-stone-200 focus-visible:ring-1 focus-visible:ring-[#b89047] bg-white"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || otp.length < 6}
          className="w-full h-11 text-xs font-bold tracking-widest uppercase bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors border border-slate-900 mt-2"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Button
          type="button"
          variant="ghost"
          disabled={cooldown > 0 || resending}
          onClick={handleResend}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          {resending
            ? "Sending..."
            : cooldown > 0
            ? `Resend OTP in ${cooldown}s`
            : "Didn't receive the code? Resend OTP"}
        </Button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-6 py-12 bg-[#FAF9F6] text-slate-900 antialiased font-sans">
      <div className="w-full max-w-md bg-white border border-stone-200 p-8 rounded-lg shadow-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 flex items-center justify-center border border-stone-200 bg-stone-50 mb-4 text-[#b89047] rounded-lg">
            <Mail className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-1">Security</span>
          <h1 className="text-2xl font-serif font-normal text-slate-900 mb-2">Verify Your Email</h1>
        </div>
        <Suspense fallback={<div className="text-center text-xs text-stone-400 font-semibold uppercase tracking-wider">Loading...</div>}>
          <VerifyEmailForm />
        </Suspense>
      </div>
    </div>
  );
}