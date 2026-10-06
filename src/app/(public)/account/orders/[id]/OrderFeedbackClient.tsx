"use client";

import { useState } from "react";
import { Star, Loader2, Edit2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface OrderFeedbackClientProps {
  orderId: string;
  designId: string;
  isPaid: boolean;
  existingReview: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    user: { name: string };
  } | null;
}

export function OrderFeedbackClient({ orderId, designId, isPaid, existingReview }: OrderFeedbackClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isPaid && !existingReview) {
    return (
      <div className="bg-stone-50 p-6 md:p-8 rounded-2xl border border-stone-200/60 mt-8 shadow-sm opacity-60">
        <h3 className="text-lg font-serif font-bold text-slate-900 mb-2">Customer Feedback</h3>
        <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider mb-4">How was your experience with Morya Designs?</p>
        <div className="text-stone-400 text-sm italic">
          You can leave feedback once this order has been fully paid.
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setError("Please select a star rating");
      return;
    }
    if (!comment || comment.trim().length < 5) {
      setError("Please write a brief comment (at least 5 characters)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = `/api/designs/${designId}/reviews`;
      const method = existingReview ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while submitting feedback");
    } finally {
      setLoading(false);
    }
  };

  if (existingReview && !isEditing) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200/60 mt-8 shadow-sm">
        <div className="flex justify-between items-start mb-6 pb-6 border-b border-stone-150">
          <div>
            <h3 className="text-lg font-serif font-bold text-slate-900 mb-1">Your Feedback</h3>
            <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Purchase
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="h-8 text-xs font-bold uppercase tracking-widest border-stone-300 text-slate-700 hover:text-[#b89047] hover:border-[#b89047]"
          >
            <Edit2 className="w-3 h-3 mr-1.5" /> Edit
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`w-4 h-4 ${star <= existingReview.rating ? 'fill-[#b89047] text-[#b89047]' : 'fill-stone-100 text-stone-200'}`} 
              />
            ))}
          </div>
          <p className="text-sm text-stone-600 leading-relaxed italic border-l-2 border-stone-200 pl-4">
            "{existingReview.comment}"
          </p>
          <div className="pt-2 flex justify-between items-center">
            <span className="font-serif font-bold text-slate-900 text-sm">{existingReview.user.name}</span>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
              {new Date(existingReview.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 p-6 md:p-8 rounded-2xl border border-stone-200/60 mt-8 shadow-sm transition-all">
      <h3 className="text-lg font-serif font-bold text-slate-900 mb-2">Customer Feedback</h3>
      <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider mb-6">How was your experience with Morya Designs?</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-800">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star className={`w-8 h-8 ${star <= rating ? "fill-[#b89047] text-[#b89047]" : "fill-white text-stone-300"}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="comment" className="text-xs font-bold uppercase tracking-widest text-slate-800">Your Feedback</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you loved about this design..."
            className="w-full h-32 p-4 text-sm bg-white border border-stone-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#b89047]/30 transition-shadow"
          />
        </div>

        {error && (
          <div className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button 
            type="submit" 
            disabled={loading}
            className="h-11 px-6 bg-slate-900 text-white font-bold uppercase tracking-widest text-xs hover:bg-slate-800 rounded-xl transition-all w-full sm:w-auto"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {existingReview ? "Update Feedback" : "Submit Feedback"}
          </Button>
          
          {existingReview && isEditing && (
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setRating(existingReview.rating);
                setComment(existingReview.comment || "");
                setError("");
              }}
              className="h-11 px-6 border-stone-300 text-slate-700 font-bold uppercase tracking-widest text-xs hover:bg-stone-50 rounded-xl transition-all"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
