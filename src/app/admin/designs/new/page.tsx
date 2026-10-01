import { DesignForm } from "../DesignForm";
import Link from "next/link";

export default function NewDesignPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 bg-white text-slate-800 antialiased">
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold uppercase tracking-widest text-[#b89047] mb-4 flex items-center gap-1.5">
        <Link href="/admin/dashboard" className="hover:text-slate-900 transition-colors">Admin</Link>
        <span className="text-stone-400">/</span>
        <Link href="/admin/designs" className="hover:text-slate-900 transition-colors">Designs</Link>
        <span className="text-stone-400">/</span>
        <span className="text-slate-900">New</span>
      </div>

      {/* Header Info */}
      <div className="mb-10 pb-4 border-b border-stone-200/60 max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight">Add New Design</h1>
        <p className="text-xs text-stone-500 mt-1 uppercase font-semibold tracking-wider">Create a new architectural listing for the public catalog</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <DesignForm />
      </div>
    </div>
  );
}
