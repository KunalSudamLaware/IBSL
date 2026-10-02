"use client";

import Link from "next/link";
import { Building2, ArrowLeft } from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { useEffect } from "react";

export default function NotFound() {
  // Adding small fake loading effect so it transitions smoothly
  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-slate-900 font-sans antialiased">
      <PublicNavbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#b89047]/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-full h-[300px] bg-gradient-to-b from-stone-100 to-transparent pointer-events-none -z-10"></div>
        
        <div className="animate-in fade-in zoom-in-95 duration-700 max-w-lg w-full flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-xl shadow-stone-200/50 flex items-center justify-center mb-8 border border-stone-100">
            <Building2 className="w-10 h-10 text-[#b89047]" />
          </div>
          
          <h1 className="font-serif text-8xl md:text-9xl font-bold text-slate-900 mb-2 opacity-10">404</h1>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-4 -mt-12 md:-mt-16 relative z-10">Page Not Found</h2>
          
          <p className="text-xs md:text-sm text-stone-500 font-semibold uppercase tracking-wider leading-relaxed mb-10 max-w-sm mx-auto">
            The architectural plan or page you are looking for has been moved or does not exist.
          </p>
          
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back To Home
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
