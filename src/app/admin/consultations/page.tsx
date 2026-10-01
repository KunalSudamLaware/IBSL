import { prisma } from "@/lib/prisma";
import { ConsultationStatus } from "@prisma/client";
import { AdminConsultationsClient } from "./AdminConsultationsClient";
import Link from "next/link";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AdminConsultationsPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  
  const statusFilter = searchParams.status ? (searchParams.status as ConsultationStatus) : undefined;
  const search = searchParams.search ? (searchParams.search as string) : undefined;

  const whereClause: Record<string, unknown> = {};
  
  if (statusFilter) {
    whereClause.status = statusFilter;
  }
  
  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { mobile: { contains: search, mode: "insensitive" } },
    ];
  }

  const consultations = await prisma.consultationRequest.findMany({
    where: whereClause,
    include: { design: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 bg-white text-slate-800">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[#b89047] mb-4 flex items-center gap-1.5">
        <Link href="/admin/dashboard" className="hover:text-slate-900 transition-colors">Admin</Link>
        <span className="text-stone-400">/</span>
        <span className="text-slate-900">Consultations</span>
      </div>

      <div className="mb-10 pb-4 border-b border-stone-200/60">
        <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight">Consultation Requests</h1>
        <p className="text-xs text-stone-500 mt-1 uppercase font-semibold tracking-wider">
          Manage customer inquiries and appointments
        </p>
      </div>

      <AdminConsultationsClient initialData={consultations} />
    </div>
  );
}
