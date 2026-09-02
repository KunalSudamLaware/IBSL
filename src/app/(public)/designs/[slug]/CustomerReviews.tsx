"use client";

import { Star, UserCircle2 } from "lucide-react";

export function CustomerReviews() {
  const reviews = [
    { id: 1, name: "Rahul S.", rating: 5, date: "August 2026", text: "The architectural blueprints were incredibly detailed. My contractor had no issues following them. Highly recommended!" },
    { id: 2, name: "Priya M.", rating: 5, date: "July 2026", text: "Beautiful design and perfect Vastu compliance. The 3D elevations exactly matched the final built home." },
    { id: 3, name: "Vikram K.", rating: 4, date: "June 2026", text: "Great layout for a narrow plot. I only wish there was an option for a basement, but overall an excellent purchase." },
  ];

  return (
    <div className="mt-16 pt-12 border-t border-stone-200">
      <div className="mb-8">
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#b89047] uppercase block mb-1">Feedback</span>
        <h2 className="text-2xl font-serif text-slate-900 font-normal tracking-tight">Customer Reviews</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Rating Summary */}
        <div className="col-span-1 space-y-6">
          <div className="flex items-end gap-4">
            <span className="text-5xl font-serif font-medium text-slate-900">4.8</span>
            <div className="flex flex-col gap-1 pb-1">
              <div className="flex text-[#b89047]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Based on 24 reviews</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {[
              { stars: 5, pct: 85 },
              { stars: 4, pct: 10 },
              { stars: 3, pct: 5 },
              { stars: 2, pct: 0 },
              { stars: 1, pct: 0 },
            ].map((bar) => (
              <div key={bar.stars} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700 w-3">{bar.stars}</span>
                <Star className="w-3.5 h-3.5 text-slate-400" />
                <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#b89047] rounded-full" 
                    style={{ width: `${bar.pct}%` }} 
                  />
                </div>
                <span className="text-[10px] font-medium text-stone-400 w-8 text-right">{bar.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Cards */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {reviews.map((r) => (
            <div key={r.id} className="pb-6 border-b border-stone-100 last:border-0">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                    <UserCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{r.name}</h4>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">{r.date}</span>
                  </div>
                </div>
                <div className="flex text-[#b89047]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < r.rating ? "fill-current" : "text-stone-200"}`} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed pl-13">"{r.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}