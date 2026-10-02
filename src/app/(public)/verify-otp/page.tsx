"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const focusInput = (index: number) => {
    if (index >= 0 && index < 6) {
      inputRefs[index].current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        focusInput(index - 1);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    // Handle single character
    const char = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);
    if (index < 5) focusInput(index + 1);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    focusInput(Math.min(pastedData.length, 5));
  };

  const currentOtpString = otp.join("");

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
        body: JSON.stringify({ email: emailParam, otp: currentOtpString }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed. Please try again.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login?verified=true"), 1500);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      if (!success) setLoading(false);
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
        setOtp(["", "", "", "", "", ""]);
        focusInput(0);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (!emailParam) {
    return (
      <div className="text-center space-y-4 py-8 animate-in fade-in zoom-in-95 duration-500">
        <p className="text-[11px] font-bold text-rose-700 uppercase tracking-widest bg-rose-50 border border-rose-100 p-4 rounded-xl shadow-sm">
          Missing Email
        </p>
        <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mt-4">
          We couldn&apos;t find your email address. Please register again.
        </p>
        <Link href="/register" className="inline-flex items-center gap-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-[#b89047] hover:text-[#8a6a32] transition-colors bg-[#b89047]/10 px-6 py-3 rounded-xl">
          Go to Registration <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4 py-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-in zoom-in-50 duration-500 delay-150" />
        </div>
        <p className="text-xl font-serif font-bold text-slate-900">Email Verified Successfully!</p>
        <p className="text-[11px] text-stone-500 font-bold uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin text-[#b89047]" /> Redirecting you to login...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
        <p className="text-[13px] text-stone-500 font-medium mb-1">We sent a 6-digit code to</p>
        <p className="font-bold text-slate-900 bg-stone-50 border border-stone-100 inline-block px-4 py-1.5 rounded-lg text-sm">{emailParam}</p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        {error && (
          <div className="p-4 text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-100 rounded-xl text-center shadow-sm animate-in fade-in zoom-in-95 duration-300">
            {error}
          </div>
        )}
        
        <div className="flex justify-center gap-2 sm:gap-3 my-8">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onChange={(e) => handleChange(e, index)}
              onPaste={handlePaste}
              className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl transition-all shadow-sm ${
                digit 
                  ? "border-[#b89047] ring-1 ring-[#b89047] text-slate-900 bg-white" 
                  : "border-stone-200 text-slate-900 bg-white focus-visible:ring-2 focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047]"
              }`}
            />
          ))}
        </div>

        <Button
          type="submit"
          disabled={loading || currentOtpString.length < 6}
          className="w-full h-12 text-xs font-bold tracking-widest uppercase bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-md shadow-slate-900/10 hover:-translate-y-0.5 mt-4"
        >
          {loading ? (
            <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</span>
          ) : (
            <span className="flex items-center gap-2">Verify Email <ArrowRight className="w-4 h-4 text-[#b89047]" /></span>
          )}
        </Button>
      </form>

      <div className="mt-8 pt-8 border-t border-stone-150 text-center">
        <Button
          type="button"
          variant="ghost"
          disabled={cooldown > 0 || resending}
          onClick={handleResend}
          className="text-[11px] font-bold uppercase tracking-widest text-stone-500 hover:text-slate-900 hover:bg-stone-50 h-10 px-6 rounded-lg transition-colors"
        >
          {resending ? (
             <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin text-[#b89047]" /> Sending...</span>
          ) : cooldown > 0 ? (
            <span className="text-stone-400">Resend OTP in <span className="text-[#b89047]">{cooldown}s</span></span>
          ) : (
            "Didn't receive the code? Resend OTP"
          )}
        </Button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-6 py-16 bg-[#FAF9F6] text-slate-900 antialiased font-sans relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-stone-100 to-transparent pointer-events-none -z-10" />
      
      <div className="w-full max-w-[420px] bg-white border border-stone-200/60 p-10 rounded-[24px] shadow-lg shadow-stone-200/50 flex flex-col">
        <div className="flex flex-col items-center text-center mb-2">
          <div className="w-14 h-14 flex items-center justify-center border border-[#b89047]/20 bg-stone-50 mb-5 text-[#b89047] rounded-full shadow-sm">
            <Mail className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-2">Security</span>
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">Verify Your Email</h1>
        </div>
        
        <Suspense fallback={
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#b89047]" />
            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Loading...</div>
          </div>
        }>
          <VerifyEmailForm />
        </Suspense>
      </div>
    </div>
  );
}