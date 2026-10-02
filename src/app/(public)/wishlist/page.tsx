"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart, ArrowLeft, Loader2, FileDown, ArrowRight, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { useSession } from "@/components/providers/AuthProvider";

interface Design {
  id: string;
  slug: string;
  title: string;
  category: string;
  plotWidthFt: number;
  plotLengthFt: number;
  bhk: number;
  priceInr: number;
  facing: string;
  images: { url: string }[];
  floors?: number;
}

interface WishlistItem {
  id: string;
  designId: string;
  design: Design;
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
    } else if (status === "authenticated") {
      fetch("/api/wishlist")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setWishlistItems(data);
          }
        })
        .catch(err => console.error("Wishlist fetch error:", err))
        .finally(() => setLoading(false));
    }
  }, [status]);

  const handleRemove = async (e: React.MouseEvent, designId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (removingId) return; // Prevent double click
    setRemovingId(designId);
    
    try {
      const res = await fetch(`/api/wishlist?designId=${designId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        // Delay slightly for animation to play out
        setTimeout(() => {
          setWishlistItems(prev => prev.filter(item => item.designId !== designId));
          setRemovingId(null);
        }, 300);
      } else {
        setRemovingId(null);
      }
    } catch (err) {
      console.error(err);
      setRemovingId(null);
    }
  };

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-24 flex flex-col items-center justify-center min-h-[70vh] text-slate-800 bg-[#FAF9F6] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-stone-100 to-transparent pointer-events-none -z-10" />
        <div className="bg-white border border-stone-200/60 p-12 rounded-[24px] shadow-lg shadow-stone-200/50 flex flex-col items-center text-center max-w-lg w-full animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-stone-150">
            <Heart className="w-8 h-8 text-stone-300 stroke-1" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-2">Account Required</span>
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-3 tracking-tight">Login to View Wishlist</h2>
          <p className="text-[11px] text-stone-500 font-bold uppercase tracking-widest max-w-sm mx-auto mb-8 leading-relaxed">
            You must be logged in to view and save architectural designs to your personal wishlist.
          </p>
          <Link 
            href="/login" 
            className="w-full inline-flex items-center justify-center px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-widest uppercase transition-all rounded-xl shadow-md shadow-slate-900/10 hover:-translate-y-0.5"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (loading || status === "loading") {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-24 flex flex-col items-center justify-center min-h-[70vh] text-slate-800 bg-[#FAF9F6]">
        <Loader2 className="w-10 h-10 text-[#b89047] animate-spin mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16 min-h-[85vh] bg-[#FAF9F6] text-slate-900 antialiased font-sans relative">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-stone-100 to-transparent pointer-events-none -z-10" />

      {/* Header */}
      <div className="mb-12 pb-6 border-b border-stone-200">
        <Link href="/designs" className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Continue Browsing
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#b89047] uppercase block mb-2">Your Favorites</span>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight">My Wishlist</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-white border border-stone-200 px-4 py-2 rounded-lg shadow-sm">
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> {wishlistItems.length} {wishlistItems.length === 1 ? 'Design' : 'Designs'}
          </div>
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="py-24 text-center bg-white border border-stone-200/60 rounded-[24px] p-8 shadow-sm flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-stone-150">
            <LayoutGrid className="w-8 h-8 text-stone-300 stroke-1" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-2">Empty Collection</span>
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-3 tracking-tight">Your Wishlist is Empty</h2>
          <p className="text-[11px] text-stone-500 font-bold uppercase tracking-widest max-w-sm mx-auto mb-10 leading-relaxed">
            Explore our architectural marketplace and save designs you like to easily find them here later.
          </p>
          <Link 
            href="/designs" 
            className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold tracking-widest uppercase transition-all rounded-xl shadow-md shadow-slate-900/10 hover:-translate-y-0.5 gap-2"
          >
            Explore Designs <ArrowRight className="w-3.5 h-3.5 text-[#b89047]" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {wishlistItems.map((item, index) => {
            const design = item.design;
            const image = design.images[0]?.url;
            const isRemoving = removingId === design.id;
            
            return (
              <div 
                key={design.id} 
                className={`group bg-white border border-stone-200 overflow-hidden hover:border-[#b89047]/40 hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-500 ease-out flex flex-col justify-between h-full rounded-[16px] relative animate-in fade-in slide-in-from-bottom-8 ${isRemoving ? 'opacity-0 scale-95 pointer-events-none' : 'hover:-translate-y-1'}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Remove Button overlayed on top right */}
                <div className="absolute top-4 right-4 z-20">
                  <button 
                    onClick={(e) => handleRemove(e, design.id)}
                    title="Remove from Wishlist"
                    disabled={isRemoving}
                    className="w-9 h-9 rounded-full bg-white/90 hover:bg-white backdrop-blur-md shadow-sm border border-stone-200/80 flex items-center justify-center transition-all duration-300 transform hover:scale-110 group/btn"
                  >
                    {isRemoving ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                    ) : (
                      <Heart className="w-[18px] h-[18px] fill-rose-500 text-rose-500 group-hover/btn:scale-90 transition-transform" />
                    )}
                  </button>
                </div>

                {/* Image Block */}
                <Link href={`/designs/${design.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-stone-100 rounded-t-[16px]">
                  {image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img 
                      src={image} 
                      alt={design.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <FileDown className="w-10 h-10 stroke-1" />
                    </div>
                  )}
                  
                  {/* Subtle Dark Overlay on Hover */}
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-500"></div>

                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <Badge variant="secondary" className="bg-slate-900/90 text-white border-none rounded-md text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 shadow-sm">
                      {design.category}
                    </Badge>
                  </div>
                </Link>
                
                {/* Content Block */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[#b89047]">{design.facing} Facing</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 bg-stone-50 px-2 py-0.5 rounded-sm">{design.plotWidthFt}×{design.plotLengthFt} ft Plot</span>
                  </div>
                  
                  <Link href={`/designs/${design.slug}`} className="block mb-4">
                    <h3 className="text-lg font-serif font-bold text-slate-900 group-hover:text-[#b89047] transition-colors line-clamp-2 min-h-[56px] leading-snug">
                      {design.title}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-6">
                    <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#b89047]"></span> {design.bhk} BHK</span>
                    {design.floors && (
                      <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#b89047]"></span> {design.floors} {design.floors > 1 ? "Floors" : "Floor"}</span>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-5 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Fixed Price</span>
                      <span className="font-mono font-bold text-base text-slate-900">{formatPrice(design.priceInr)}</span>
                    </div>
                    <Link 
                      href={`/designs/${design.slug}`}
                      className="group/btn relative overflow-hidden px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:bg-[#b89047] flex items-center gap-2 shadow-sm"
                    >
                      <span className="relative z-10">Details</span>
                      <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

