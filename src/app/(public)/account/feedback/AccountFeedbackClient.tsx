"use client";

import { useState } from "react";
import { Star, Loader2, Edit2, Trash2, CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AccountFeedbackClient({ initialReviews }: { initialReviews: any[] }) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string, designId: string) => {
    if (!confirm("Are you sure you want to delete your feedback?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/designs/${designId}/reviews`, { method: "DELETE" });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
        router.refresh();
      } else {
        alert("Failed to delete feedback");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setLoadingId(null);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'APPROVED': return <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case 'REJECTED': return <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-1 rounded-full"><XCircle className="w-3 h-3" /> Rejected</span>;
      default: return <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-full"><Clock className="w-3 h-3" /> Pending Review</span>;
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white border border-stone-200 p-12 rounded-xl text-center shadow-sm">
        <Star className="w-12 h-12 text-stone-300 mx-auto mb-4" />
        <h3 className="text-lg font-serif text-slate-900 mb-2">No Feedback Yet</h3>
        <p className="text-stone-500 mb-6 text-sm max-w-sm mx-auto">
          You haven't submitted any feedback. Once you purchase a design, you can leave a review on its page.
        </p>
        <Link href="/orders">
          <Button className="bg-slate-900 text-white hover:bg-slate-800">
            View My Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white border border-stone-200 p-6 rounded-xl shadow-sm flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-48 shrink-0 relative rounded-lg overflow-hidden border border-stone-100 aspect-[4/3] bg-stone-50">
            {review.design.images?.[0]?.url ? (
              <img src={review.design.images[0].url} alt={review.design.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400 font-serif text-xs">No Image</div>
            )}
            <div className="absolute top-2 left-2">
              <StatusBadge status={review.status} />
            </div>
          </div>
          
          <div className="flex-1 w-full space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <Link href={`/designs/${review.design.slug}`} className="font-serif text-lg text-slate-900 font-bold hover:text-[#b89047] transition-colors">
                  {review.design.title}
                </Link>
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-[#b89047] text-[#b89047]' : 'fill-stone-100 text-stone-200'}`} />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider whitespace-nowrap">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed italic border-l-2 border-stone-200 pl-4 py-1">
              "{review.comment || 'No comment provided.'}"
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link href={`/designs/${review.design.slug}#reviews`}>
                <Button variant="outline" size="sm" className="h-8 text-xs border-stone-200 text-slate-700 hover:text-[#b89047] hover:border-[#b89047]">
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDelete(review.id, review.design.id)}
                disabled={loadingId === review.id}
                className="h-8 text-xs border-stone-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200"
              >
                {loadingId === review.id ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
