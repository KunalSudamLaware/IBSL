import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { OrdersTableClient } from "./OrdersTableClient";
import Link from "next/link";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AdminOrdersPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  
  const statusFilter = searchParams.status ? (searchParams.status as OrderStatus) : undefined;
  const search = searchParams.search ? (searchParams.search as string) : undefined;

  const whereClause: Record<string, unknown> = {};
  
  if (statusFilter) {
    whereClause.status = statusFilter;
  }
  
  if (search) {
    whereClause.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { id: { contains: search, mode: "insensitive" } },
      { invoiceNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: { design: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 bg-white text-slate-800">
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold uppercase tracking-widest text-[#b89047] mb-4 flex items-center gap-1.5">
        <Link href="/admin/dashboard" className="hover:text-slate-900 transition-colors">Admin</Link>
        <span className="text-stone-400">/</span>
        <span className="text-slate-900">Orders</span>
      </div>

      <div className="mb-10 pb-4 border-b border-stone-200/60">
        <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight">Order Management</h1>
        <p className="text-xs text-stone-500 mt-1 uppercase font-semibold tracking-wider">
          View and manage all customer purchases
        </p>
      </div>

      <OrdersTableClient initialOrders={orders} />
    </div>
  );
}
