"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, FilterX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DesignsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DesignsPage] Error loading designs:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-20 bg-[#FAF9F6] text-slate-900 min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-stone-200 rounded-[24px] p-8 sm:p-10 text-center shadow-xl shadow-stone-200/50 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-rose-100">
          <AlertCircle className="w-7 h-7" />
        </div>
        
        <span className="text-[10px] font-bold tracking-[0.25em] text-rose-500 uppercase block mb-2">Error Encountered</span>
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-3 tracking-tight">Unable to Load Designs</h2>
        
        <p className="text-xs text-stone-500 leading-relaxed mb-8 font-medium">
          We encountered an issue while searching the design marketplace. This may be due to an unexpected connection error or invalid filter combination.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl h-11 px-6 shadow-md shadow-slate-900/10"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-2" /> Try Again
          </Button>
          <Link
            href="/designs"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 border border-stone-200 bg-white hover:bg-stone-50 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm h-11"
          >
            <FilterX className="w-3.5 h-3.5 mr-2 text-rose-500" /> Clear Filters
          </Link>
        </div>
      </div>
    </div>
  );
}
