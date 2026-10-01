"use client";

import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function AdminConsultationsClient({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = data.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search);
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input 
            placeholder="Search name, email, or mobile..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 border-stone-200 focus-visible:ring-[#b89047]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 border border-stone-200 rounded-lg px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b89047] bg-white w-full sm:w-auto"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONTACTED">Contacted</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                <th className="py-4 px-6 font-medium">Customer</th>
                <th className="py-4 px-6 font-medium">Design / Request</th>
                <th className="py-4 px-6 font-medium">Preferred</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-500">
                    No consultations found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      <div className="text-[10px] text-stone-500 uppercase tracking-wider">{c.mobile}</div>
                    </td>
                    <td className="py-4 px-6">
                      {c.design ? (
                        <span className="font-semibold text-slate-900 line-clamp-1">{c.design.title}</span>
                      ) : (
                        <span className="text-stone-500 italic">General Inquiry</span>
                      )}
                      <div className="text-[10px] text-stone-500 uppercase tracking-wider mt-0.5">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-900">
                        {c.preferredDate ? new Date(c.preferredDate).toLocaleDateString() : 'Any Date'}
                      </div>
                      <div className="text-[10px] text-stone-500 uppercase tracking-wider">
                        {c.preferredTime || 'Any Time'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="secondary" className="bg-stone-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded-md border-none px-2 py-0.5">
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/consultations/${c.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-900 hover:text-[#b89047] transition-colors"
                      >
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
