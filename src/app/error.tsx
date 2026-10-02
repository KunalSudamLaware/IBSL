"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed, but not exposed to user
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-slate-900 font-sans antialiased">
      <PublicNavbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-full h-[300px] bg-gradient-to-b from-stone-100 to-transparent pointer-events-none -z-10"></div>
        
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-lg w-full flex flex-col items-center bg-white p-12 rounded-[24px] shadow-xl shadow-stone-200/50 border border-stone-200/60">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 border border-rose-100 shadow-inner">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
          
          <span className="text-[10px] font-bold tracking-[0.25em] text-rose-500 uppercase block mb-3">System Error</span>
          <h1 className="font-serif text-3xl font-bold text-slate-900 mb-4 tracking-tight">Something went wrong</h1>
          
          <p className="text-[11px] text-stone-500 font-bold uppercase tracking-widest leading-relaxed mb-10 max-w-sm mx-auto">
            We encountered an unexpected issue while processing your request. Please try again.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold tracking-widest uppercase transition-all duration-300 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 group"
            >
              <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-90 transition-transform duration-500" /> Try Again
            </button>
            <Link 
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-stone-200 hover:border-[#b89047]/50 text-slate-900 text-[11px] font-bold tracking-widest uppercase transition-all duration-300 rounded-xl hover:shadow-md hover:-translate-y-1"
            >
              <Home className="w-3.5 h-3.5 text-stone-400" /> Go Home
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
