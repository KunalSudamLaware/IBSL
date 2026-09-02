"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-6 py-12 bg-[#FAF9F6] text-slate-900 antialiased font-sans">
      <div className="w-full max-w-md bg-white border border-stone-200 p-8 rounded-lg shadow-sm">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 flex items-center justify-center border border-stone-200 bg-stone-50 mb-4 text-[#b89047] rounded-lg">
            <KeyRound className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-1">Account Recovery</span>
          <h1 className="text-2xl font-serif font-normal text-slate-900 mb-2">Forgot Password</h1>
          <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
            Enter your email to receive a reset link
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">Reset link sent!</p>
            <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider leading-relaxed">
              If an account with that email exists, you will receive a password reset link shortly. Check your inbox and spam folder.
            </p>
            <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
              The link expires in 30 minutes.
            </p>
            <Link href="/login" className="block mt-4 text-xs font-bold uppercase tracking-widest text-[#b89047] hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-100 rounded-lg text-center">
                {error}
              </div>
            )}
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
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-xs font-bold tracking-widest uppercase bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}
      </div>

      <Link href="/login" className="mt-6 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
      </Link>
    </div>
  );
}