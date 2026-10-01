"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "@/components/providers/AuthProvider";
import { LayoutDashboard, Package, Heart, LogOut, MessageSquare, Loader2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MyConsultationsPage() {
  const router = useRouter();
  const { status } = useSession();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetch("/api/consultations")
        .then(res => res.json())
        .then(data => {
          if (data.consultations) setConsultations(data.consultations);
        })
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  const handleLogout = async () => {
    await signOut();
  };

  if (loading || status === "loading") {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-24 flex flex-col items-center justify-center min-h-[50vh] text-slate-800 bg-[#FAF9F6]">
        <Loader2 className="w-8 h-8 text-[#b89047] animate-spin mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Loading your consultations...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 min-h-[70vh] bg-[#FAF9F6] text-slate-900 antialiased font-sans">
      
      {/* Header */}
      <div className="mb-10 pb-4 border-b border-stone-200">
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#b89047] uppercase block mb-1">Customer Area</span>
        <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight">My Consultations</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-1 space-y-2">
          <Link href="/account" className="flex items-center gap-3 px-4 py-3 bg-white text-slate-650 hover:bg-stone-50 hover:text-slate-900 border border-stone-200 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Profile
          </Link>
          <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 bg-white text-slate-650 hover:bg-stone-50 hover:text-slate-900 border border-stone-200 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors">
            <Package className="w-4 h-4" /> My Orders
          </Link>
          <Link href="/wishlist" className="flex items-center gap-3 px-4 py-3 bg-white text-slate-650 hover:bg-stone-50 hover:text-slate-900 border border-stone-200 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors">
            <Heart className="w-4 h-4" /> Wishlist
          </Link>
          <Link href="/account/consultations" className="flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-lg text-xs font-bold tracking-widest uppercase shadow-sm">
            <MessageSquare className="w-4 h-4 text-[#b89047]" /> Consultations
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white text-rose-600 hover:bg-rose-50 border border-stone-200 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors mt-6"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {consultations.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-lg p-12 text-center shadow-sm">
              <MessageSquare className="w-12 h-12 text-stone-200 mx-auto mb-4" />
              <h2 className="text-xl font-serif text-slate-900 mb-2">No Consultations Yet</h2>
              <p className="text-sm text-slate-600 mb-8 max-w-sm mx-auto">
                You haven't requested any consultations. Browse our designs and let us know how we can help!
              </p>
              <Link 
                href="/designs"
                className="inline-flex items-center justify-center h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors"
              >
                Browse Designs
              </Link>
            </div>
          ) : (
            consultations.map(consultation => (
              <div key={consultation.id} className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                      ID: {consultation.id.slice(-8).toUpperCase()}
                    </span>
                    <Badge variant="secondary" className="bg-stone-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded-md border-none px-2 py-0.5">
                      {consultation.status}
                    </Badge>
                  </div>
                  
                  {consultation.design ? (
                    <Link href={`/designs/${consultation.design.slug}`} className="font-serif font-bold text-lg text-slate-900 hover:text-[#b89047] transition-colors mb-2 inline-block">
                      Consultation for: {consultation.design.title}
                    </Link>
                  ) : (
                    <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">General Consultation</h3>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-xs font-medium text-stone-500 uppercase tracking-wider">
                    <span>Requested: {new Date(consultation.createdAt).toLocaleDateString()}</span>
                    {(consultation.preferredDate || consultation.preferredTime) && (
                      <span className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-stone-300" />
                        Preferred: {consultation.preferredDate ? new Date(consultation.preferredDate).toLocaleDateString() : 'Any Date'} {consultation.preferredTime ? `| ${consultation.preferredTime}` : ''}
                      </span>
                    )}
                  </div>
                </div>
                
                <Link 
                  href={`/account/consultations/${consultation.id}`}
                  className="flex items-center justify-center h-10 px-6 bg-white hover:bg-stone-50 border border-stone-200 text-slate-700 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors shrink-0 gap-2"
                >
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
