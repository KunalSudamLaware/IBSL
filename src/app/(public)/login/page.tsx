"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ArrowLeft, ArrowRight, User } from "lucide-react";
import Link from "next/link";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account/orders";
  const justRegistered = searchParams.get("registered") === "1";
  const justReset = searchParams.get("reset") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        if (res.error === "EMAIL_NOT_VERIFIED") {
          setError("Please verify your email address before logging in.");
        } else {
          setError("Invalid email or password. Please try again.");
        }
      } else if (res?.ok) {
        router.refresh();
        router.push(callbackUrl);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-stone-200 p-8 rounded-lg shadow-sm flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-12 h-12 flex items-center justify-center border border-stone-200 bg-stone-50 mb-4 text-[#b89047] rounded-lg">
          <User className="w-5 h-5" />
        </div>
        <span className="text-[9px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-1">Customer Space</span>
        <h1 className="text-2xl font-serif font-normal text-slate-900 mb-2">Customer Login</h1>
        <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
          Sign in to access your designs &amp; downloads
        </p>
      </div>

      {/* Registration success banner */}
      {justRegistered && (
        <div className="mb-4 p-3 text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg text-center leading-relaxed">
          Account created! Please check your email and mobile for verification before logging in.
        </div>
      )}

      {/* Password reset success banner */}
      {justReset && (
        <div className="mb-4 p-3 text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg text-center leading-relaxed">
          Password reset successfully. You can now log in with your new password.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-100 rounded-lg text-center leading-relaxed">
            {error}
          </div>
        )}
        
        {/* Email field */}
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
        
        {/* Password field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-700">Password</Label>
            <Link
              href="/forgot-password"
              className="text-[10px] font-semibold text-[#b89047] hover:underline uppercase tracking-wider"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 rounded-lg border-stone-200 text-sm focus-visible:ring-1 focus-visible:ring-[#b89047] pr-10 bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-450 hover:text-slate-800 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-11 text-xs font-bold tracking-widest uppercase bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors border border-slate-900 mt-2 flex items-center justify-center gap-1.5" 
          disabled={loading}
        >
          {loading ? "Signing in..." : <>Sign In <ArrowRight className="w-3.5 h-3.5 text-[#b89047]" /></>}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-stone-500 font-semibold uppercase tracking-wider">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#b89047] hover:underline">
          Register Here
        </Link>
      </div>

    </div>
  );
}

export default function CustomerLoginPage() {

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-6 py-12 bg-[#FAF9F6] text-slate-900 antialiased font-sans">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white border border-stone-200 p-8 rounded-lg shadow-sm flex flex-col items-center justify-center py-20">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Loading form...</p>
        </div>
      }>
        <LoginFormContent />
      </Suspense>

      {/* Back Link */}
      <Link 
        href="/" 
        className="mt-6 text-xs font-bold uppercase tracking-widest text-slate-655 hover:text-slate-900 transition-colors flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>
    </div>
  );
}
