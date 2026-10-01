import { prisma } from "@/lib/prisma";
import { DesignStatus, Prisma } from "@prisma/client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminDesignListClient } from "./AdminDesignListClient";
import { DesignTableClient } from "./DesignTableClient";


type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AdminDesignsPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  
  const statusFilter = searchParams.status ? (searchParams.status as DesignStatus) : undefined;
  const search = searchParams.search ? (searchParams.search as string) : undefined;
  const sort = searchParams.sort ? (searchParams.sort as string) : "newest";

  const whereClause: Prisma.DesignWhereInput = {
    // Hide archived by default unless filtering explicitly
    status: statusFilter ? statusFilter : { not: DesignStatus.ARCHIVED },
  };

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
    ];
  }

  let orderBy: Prisma.DesignOrderByWithRelationInput = { createdAt: "desc" };
  
  switch (sort) {
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "price_asc":
      orderBy = { priceInr: "asc" };
      break;
    case "price_desc":
      orderBy = { priceInr: "desc" };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  const designs = await prisma.design.findMany({
    where: whereClause,
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
    orderBy,
  });

  // Calculate stats for the header
  const totalPublished = await prisma.design.count({ where: { status: DesignStatus.PUBLISHED } });
  const totalDrafts = await prisma.design.count({ where: { status: DesignStatus.DRAFT } });
  const totalArchived = await prisma.design.count({ where: { status: DesignStatus.ARCHIVED } });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 bg-white text-slate-800">
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold uppercase tracking-widest text-[#b89047] mb-4 flex items-center gap-1.5">
        <Link href="/admin/dashboard" className="hover:text-slate-900 transition-colors">Admin</Link>
        <span className="text-stone-400">/</span>
        <span className="text-slate-900">Designs</span>
      </div>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6 pb-4 border-b border-stone-200/60">
        <div>
          <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight">Design Management</h1>
          <p className="text-xs text-stone-500 mt-1 uppercase font-semibold tracking-wider">
            Manage your architectural catalog, upload files, and publish new designs.
          </p>
        </div>
        <Link 
          href="/admin/designs/new" 
          className="inline-flex items-center justify-center px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-lg border border-slate-900"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Design
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Published", count: totalPublished, color: "text-[#b89047]" },
          { label: "Drafts", count: totalDrafts, color: "text-slate-900" },
          { label: "Archived", count: totalArchived, color: "text-rose-600" }
        ].map((stat, i) => (
          <div key={i} className="bg-stone-50/50 border border-stone-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">{stat.label}</div>
            <div className={`text-2xl font-serif font-bold ${stat.color}`}>{stat.count}</div>
          </div>
        ))}
      </div>

      {/* Design Table Container */}
      <div className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-stone-50/30 border-b border-stone-150 p-6">
          <AdminDesignListClient />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-stone-50 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Design Name</th>
                <th className="px-6 py-4">Plot Size</th>
                <th className="px-6 py-4">Specs</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <DesignTableClient designs={designs} />
          </table>
        </div>
      </div>
    </div>
  );
}

