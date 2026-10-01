"use client";

import { useState } from "react";
import { Star, Trash2, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ReviewDisplay {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: { name: string; email: string };
  design: { title: string; slug: string };
}

export function AdminReviewsClient({ initialReviews }: { initialReviews: ReviewDisplay[] }) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = reviews.filter(r => 
    r.user.name.toLowerCase().includes(search.toLowerCase()) ||
    r.user.email.toLowerCase().includes(search.toLowerCase()) ||
    r.design.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.comment && r.comment.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete review");
      }
    } catch (error) {
      alert("Network error deleting review");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input 
            placeholder="Search reviews, customers, or designs..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 border-stone-200 focus-visible:ring-[#b89047]"
          />
        </div>
      </div>

      {/* Table / Grid */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                <th className="py-4 px-6 font-medium">Customer</th>
                <th className="py-4 px-6 font-medium">Design</th>
                <th className="py-4 px-6 font-medium">Rating</th>
                <th className="py-4 px-6 font-medium min-w-[200px]">Review</th>
                <th className="py-4 px-6 font-medium">Date</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                filtered.map((review) => (
                  <tr key={review.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{review.user.name}</div>
                      <div className="text-[10px] text-stone-500 uppercase tracking-wider">{review.user.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <Link 
                        href={`/designs/${review.design.slug}`} 
                        className="font-semibold text-slate-900 hover:text-[#b89047] line-clamp-1"
                        target="_blank"
                      >
                        {review.design.title}
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            className={`w-3.5 h-3.5 ${s <= review.rating ? "fill-[#b89047] text-[#b89047]" : "fill-stone-100 text-stone-200"}`} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-stone-600 line-clamp-2 max-w-sm">{review.comment || "-"}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-stone-500 whitespace-nowrap">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Review"
                      >
                        {deletingId === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
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
