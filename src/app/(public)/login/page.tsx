"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ArrowLeft, ArrowRight, User, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account/orders";
  const justRegistered = searchParams.get("registered") === "1";
  const justReset = searchParams.get("reset") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ email, password }) 
      }); 
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "EMAIL_NOT_VERIFIED") {
          setError("Please verify your email address before logging in.");
        } else {
          setError("Invalid email or password. Please try again.");
        }
        setLoading(false);
      } else {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 800);
      }
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] bg-white border border-stone-200/60 p-10 rounded-[24px] shadow-lg shadow-stone-200/50 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="w-14 h-14 flex items-center justify-center border border-[#b89047]/20 bg-stone-50 mb-5 text-[#b89047] rounded-full shadow-sm">
          <User className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-2">Customer Space</span>
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-3 tracking-tight">Customer Login</h1>
        <p className="text-[13px] text-stone-500 font-medium leading-relaxed max-w-[280px]">
          Sign in to access your purchased designs, plans, and downloads
        </p>
      </div>

      {/* Registration success banner */}
      {justRegistered && (
        <div className="mb-6 p-4 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in zoom-in-95 duration-500">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <span className="leading-snug">Account created! Please check your email and mobile for verification before logging in.</span>
        </div>
      )}

      {/* Password reset success banner */}
      {justReset && (
        <div className="mb-6 p-4 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in zoom-in-95 duration-500">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <span className="leading-snug">Password reset successfully. You can now log in with your new password.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-100 rounded-xl text-center shadow-sm animate-in fade-in zoom-in-95 duration-300">
            {error}
          </div>
        )}
        
        {/* Email field */}
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
        
        {/* Password field */}
        <div className="space-y-2.5">
          <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest text-slate-800">Password</Label>
          <div className="relative group">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 px-4 rounded-xl border-stone-200 text-sm focus-visible:ring-2 focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047] pr-12 bg-white transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#b89047] transition-colors p-1.5 focus:outline-none rounded-md focus-visible:ring-2 focus-visible:ring-[#b89047]/20"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
            </button>
          </div>
          <div className="flex justify-end pt-0.5">
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[#b89047] hover:text-[#8a6a32] hover:underline transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button 
            type="submit" 
            className={`w-full h-12 text-xs font-bold tracking-widest uppercase text-white rounded-xl transition-all duration-300 shadow-md ${
              success 
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20" 
                : "bg-slate-900 hover:bg-slate-800 hover:-translate-y-0.5 shadow-slate-900/10"
            }`}
            disabled={loading || success}
          >
            {loading ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Authenticating...</span>
            ) : success ? (
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Success</span>
            ) : (
              <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4 text-[#b89047]" /></span>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-8 border-t border-stone-150 text-center text-[11px] text-stone-500 font-bold uppercase tracking-widest">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#b89047] hover:text-[#8a6a32] transition-colors">
          Register Here
        </Link>
      </div>

    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-6 py-16 bg-[#FAF9F6] text-slate-900 antialiased font-sans relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-stone-100 to-transparent pointer-events-none -z-10" />
      
      <Suspense fallback={
        <div className="w-full max-w-[420px] bg-white border border-stone-200/60 p-10 rounded-[24px] shadow-sm flex flex-col items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-[#b89047] mb-4" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Loading secure form...</p>
        </div>
      }>
        <LoginFormContent />
      </Suspense>

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
