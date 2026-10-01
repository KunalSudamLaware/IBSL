import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ConsultationStatusUpdater } from "./ConsultationStatusUpdater";
import { ArrowLeft } from "lucide-react";

export default async function AdminConsultationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const consultation = await prisma.consultationRequest.findUnique({
    where: { id },
    include: { design: true }
  });

  if (!consultation) notFound();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 bg-white text-slate-800">
      <div className="mb-8 pb-4 border-b border-stone-200">
        <Link href="/admin/consultations" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Back to Consultations
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight">
            Manage Consultation
          </h1>
        </div>
        <p className="text-[10px] font-bold tracking-[0.2em] text-stone-400 uppercase mt-2">
          ID: {consultation.id}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-6 pb-3 border-b border-stone-150">Customer Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-1">Name</p>
                <p className="font-semibold text-slate-900">{consultation.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-1">Email</p>
                <p className="font-semibold text-slate-900">{consultation.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-1">Mobile</p>
                <p className="font-semibold text-slate-900">{consultation.mobile}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-1">Requested On</p>
                <p className="font-semibold text-slate-900">{new Date(consultation.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-6 pb-3 border-b border-stone-150">Request Details</h3>
            
            {consultation.design && (
              <div className="mb-6">
                <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-1">Interested Design</p>
                <Link href={`/designs/${consultation.design.slug}`} className="font-semibold text-slate-900 hover:text-[#b89047] transition-colors" target="_blank">
                  {consultation.design.title}
                </Link>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-1">Preferred Date</p>
                <p className="font-semibold text-slate-900">{consultation.preferredDate ? new Date(consultation.preferredDate).toLocaleDateString() : 'Any Date'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-1">Preferred Time</p>
                <p className="font-semibold text-slate-900">{consultation.preferredTime || 'Any Time'}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-2">Message</p>
              <div className="bg-stone-50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap border border-stone-200">
                {consultation.message}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Status Updater */}
        <div className="lg:col-span-1">
          <ConsultationStatusUpdater 
            id={consultation.id} 
            initialStatus={consultation.status} 
            initialNotes={consultation.adminNotes || ""}
          />
        </div>
      </div>
    </div>
  );
}
