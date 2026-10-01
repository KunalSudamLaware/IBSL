"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/components/providers/AuthProvider";
import { Loader2, ArrowLeft, MessageSquare, Calendar, Clock, Phone, Mail, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { use } from "react";

export default function ConsultationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { status } = useSession();
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const resolvedParams = use(params);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetch(`/api/consultations/${resolvedParams.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          setConsultation(data.consultation);
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [status, router, resolvedParams.id]);

  if (loading || status === "loading") {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-24 flex flex-col items-center justify-center min-h-[50vh] text-slate-800 bg-[#FAF9F6]">
        <Loader2 className="w-8 h-8 text-[#b89047] animate-spin mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Loading details...</p>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="text-2xl font-serif text-slate-900 mb-4">Error Loading Consultation</h2>
        <p className="text-slate-600 mb-8">{error || "Consultation not found."}</p>
        <Link href="/account/consultations" className="text-xs font-bold uppercase tracking-widest text-[#b89047] hover:text-slate-900 transition-colors">
          &larr; Back to My Consultations
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 min-h-[70vh] bg-[#FAF9F6] text-slate-900 antialiased font-sans">
      
      {/* Breadcrumb */}
      <div className="mb-8 pb-4 border-b border-stone-200">
        <Link href="/account/consultations" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Back to List
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight">
            Consultation Details
          </h1>
          <Badge variant="secondary" className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md border-none">
            {consultation.status}
          </Badge>
        </div>
        <p className="text-[10px] font-bold tracking-[0.2em] text-stone-400 uppercase mt-2">
          ID: {consultation.id}
        </p>
      </div>

      <div className="space-y-6">
        
        {consultation.design && (
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Related Design</h3>
            <Link href={`/designs/${consultation.design.slug}`} className="font-serif font-bold text-xl text-slate-900 hover:text-[#b89047] transition-colors inline-block">
              {consultation.design.title}
            </Link>
          </div>
        )}

        <div className="bg-white border border-stone-200 rounded-xl p-8 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-6 pb-3 border-b border-stone-150">
            Your Request
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-[#b89047] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-0.5">Name</p>
                <p className="text-sm font-semibold text-slate-900">{consultation.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#b89047] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-0.5">Email</p>
                <p className="text-sm font-semibold text-slate-900">{consultation.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#b89047] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-0.5">Mobile</p>
                <p className="text-sm font-semibold text-slate-900">{consultation.mobile}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-[#b89047] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-0.5">Requested On</p>
                <p className="text-sm font-semibold text-slate-900">{new Date(consultation.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {(consultation.preferredDate || consultation.preferredTime) && (
            <div className="mb-8 pt-6 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {consultation.preferredDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-0.5">Preferred Date</p>
                    <p className="text-sm font-semibold text-slate-900">{new Date(consultation.preferredDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {consultation.preferredTime && (
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-0.5">Preferred Time</p>
                    <p className="text-sm font-semibold text-slate-900">{consultation.preferredTime}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-6 border-t border-stone-100">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" /> Message
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-stone-50 p-4 rounded-lg border border-stone-150">
              {consultation.message}
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
