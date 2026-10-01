import Link from "next/link";

export default function CustomersPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 bg-white text-slate-800 antialiased">
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold uppercase tracking-widest text-[#b89047] mb-4 flex items-center gap-1.5 max-w-4xl mx-auto">
        <Link href="/admin/dashboard" className="hover:text-slate-900 transition-colors">Admin</Link>
        <span className="text-stone-400">/</span>
        <span className="text-slate-900">Customers</span>
      </div>

      <div className="max-w-4xl mx-auto text-center py-10">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-3">Management</span>
        <h1 className="text-3xl font-serif text-slate-900 font-normal mb-8">Customers</h1>
        
        <div className="bg-stone-50/50 p-8 md:p-12 border border-stone-200 rounded-lg text-center shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">Coming Soon</h2>
          <p className="text-xs text-stone-450 font-semibold uppercase tracking-wider">The customer management module will be implemented in a later stage.</p>
        </div>
      </div>
    </div>
  );
}
