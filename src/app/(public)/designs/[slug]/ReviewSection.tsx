"use client";

import { useState, useEffect } from "react";
import { Star, Loader2, MessageSquare, Trash2, Edit2, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/providers/AuthProvider";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface ReviewSectionProps {
  designId: string;
}

export function ReviewSection({ designId }: ReviewSectionProps) {
  const { status, data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isEligible, setIsEligible] = useState(false);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [distribution, setDistribution] = useState<Record<number, number>>({ 1:0, 2:0, 3:0, 4:0, 5:0 });
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/designs/${designId}/reviews?sort=${sort}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setUserReview(data.userReview);
        setIsEligible(data.isEligible);
        setAverage(data.average);
        setTotal(data.total);
        setDistribution(data.distribution);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [designId, sort, status]);

  const handleSubmit = async () => {
    setError("");
    if (rating < 1 || rating > 5) {
      setError("Please select a rating.");
      return;
    }

    setSubmitLoading(true);
    try {
      const isUpdating = !!userReview;
      const method = isUpdating ? "PUT" : "POST";
      
      const res = await fetch(`/api/designs/${designId}/reviews`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");
      
      setIsEditing(false);
      await fetchReviews();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your review?")) return;
    try {
      const res = await fetch(`/api/designs/${designId}/reviews`, { method: "DELETE" });
      if (res.ok) {
        setUserReview(null);
        setIsEditing(false);
        setRating(5);
        setComment("");
        await fetchReviews();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = () => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment || "");
      setIsEditing(true);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError("");
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment || "");
    } else {
      setRating(5);
      setComment("");
    }
  };

  if (loading && reviews.length === 0 && !userReview) {
    return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 text-[#b89047] animate-spin" /></div>;
  }

  const showForm = (isEligible && !userReview) || isEditing;

  return (
    <div className="mt-20 pt-16 border-t border-stone-200">
      <h2 className="text-2xl font-serif text-slate-900 mb-10 flex items-center gap-3">
        Customer Reviews <span className="text-sm font-sans bg-stone-100 text-stone-600 px-3 py-1 rounded-full">{total}</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Col: Aggregates & Form */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Average Rating Block */}
          {total > 0 ? (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 text-center">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Average Rating</h3>
              <div className="text-5xl font-bold font-serif text-slate-900 mb-2">{average.toFixed(1)}</div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-5 h-5 ${s <= Math.round(average) ? "fill-[#b89047] text-[#b89047]" : "fill-stone-200 text-stone-200"}`} />
                ))}
              </div>
              <p className="text-xs text-stone-500 font-semibold tracking-wider uppercase">Based on {total} reviews</p>
              
              {/* Distribution */}
              <div className="mt-6 space-y-2">
                {[5, 4, 3, 2, 1].map((s) => {
                  const count = distribution[s] || 0;
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={s} className="flex items-center gap-3 text-xs">
                      <span className="w-8 text-right font-bold text-slate-700">{s} <Star className="inline w-3 h-3 -mt-0.5" /></span>
                      <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#b89047]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-left font-mono text-stone-500">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
             <div className="bg-stone-50 border border-stone-200 rounded-xl p-8 text-center text-stone-500">
               <MessageSquare className="w-8 h-8 text-[#b89047]/50 mx-auto mb-3" />
               <p className="text-sm font-semibold">No reviews yet.</p>
               <p className="text-xs mt-1">Be the first customer to review this design.</p>
             </div>
          )}

          {/* User Review / Form */}
          {status === "authenticated" ? (
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
              {!showForm && userReview && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-4 pb-3 border-b border-stone-100 flex items-center justify-between">
                    Your Review
                    <div className="flex gap-2">
                      <button onClick={startEdit} className="text-stone-400 hover:text-slate-900 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={handleDelete} className="text-stone-400 hover:text-rose-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </h3>
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= userReview.rating ? "fill-[#b89047] text-[#b89047]" : "fill-stone-200 text-stone-200"}`} />
                    ))}
                  </div>
                  {userReview.comment && <p className="text-sm text-slate-700 whitespace-pre-wrap">{userReview.comment}</p>}
                </div>
              )}

              {showForm && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-4 pb-3 border-b border-stone-100">
                    {isEditing ? "Edit Your Review" : "Write a Review"}
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-2">Rating</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            onClick={() => setRating(s)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star className={`w-6 h-6 ${s <= rating ? "fill-[#b89047] text-[#b89047]" : "fill-stone-200 text-stone-200"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-2">Review (Optional)</label>
                      <textarea 
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Tell us what you think..."
                        className="w-full h-24 border border-stone-200 rounded-lg p-3 text-sm focus-visible:ring-[#b89047] resize-none"
                      />
                    </div>
                    {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
                    <div className="flex gap-3">
                      <Button onClick={handleSubmit} disabled={submitLoading} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest">
                        {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
                      </Button>
                      {isEditing && (
                        <Button onClick={cancelEdit} variant="outline" className="flex-1 text-xs font-bold uppercase tracking-widest">Cancel</Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!isEligible && !userReview && (
                <div className="text-center p-4">
                   <Lock className="w-6 h-6 text-stone-300 mx-auto mb-2" />
                   <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Only customers who have purchased this design can write a review.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Want to leave a review?</p>
              <Link href="/login" className="flex items-center justify-center w-full h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded-md">
                Log In to Review
              </Link>
            </div>
          )}
        </div>

        {/* Right Col: Reviews List */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">{reviews.length} Reviews</h3>
            <select 
              value={sort} 
              onChange={e => setSort(e.target.value)}
              className="text-xs font-semibold uppercase tracking-wider bg-transparent border-none text-stone-500 focus:ring-0 cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="highest">Sort: Highest Rating</option>
              <option value="lowest">Sort: Lowest Rating</option>
            </select>
          </div>

          <div className="space-y-6">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white border border-stone-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center border border-stone-200">
                      <span className="font-serif font-bold text-slate-900">{r.user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {r.user.name} <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </p>
                      <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Verified Buyer</p>
                    </div>
                  </div>
                  <p className="text-xs text-stone-400 font-mono">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-[#b89047] text-[#b89047]" : "fill-stone-100 text-stone-200"}`} />
                  ))}
                </div>
                {r.comment && <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{r.comment}</p>}
              </div>
            ))}
            {reviews.length === 0 && (
               <div className="text-center py-12">
                 <p className="text-sm text-stone-500">No reviews yet. Be the first to share your experience.</p>
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
