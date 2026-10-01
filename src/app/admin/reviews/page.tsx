import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminReviewsClient } from "./AdminReviewsClient";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      design: true,
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 bg-white text-slate-800">
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold uppercase tracking-widest text-[#b89047] mb-4 flex items-center gap-1.5">
        <Link href="/admin/dashboard" className="hover:text-slate-900 transition-colors">Admin</Link>
        <span className="text-stone-400">/</span>
        <span className="text-slate-900">Reviews</span>
      </div>

      <div className="mb-10 pb-4 border-b border-stone-200/60">
        <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight">Review Management</h1>
        <p className="text-xs text-stone-500 mt-1 uppercase font-semibold tracking-wider">
          View and manage all customer design reviews
        </p>
      </div>

      <AdminReviewsClient initialReviews={reviews} />
    </div>
  );
}
