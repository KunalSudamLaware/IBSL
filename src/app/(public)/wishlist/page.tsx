"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart, ArrowLeft, Loader2, FileDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

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
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist items on mount
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const storedIds = localStorage.getItem("morya_wishlist");
        if (!storedIds) {
          setLoading(false);
          return;
        }

        const ids = JSON.parse(storedIds);
        if (!Array.isArray(ids) || ids.length === 0) {
          setLoading(false);
          return;
        }

        const res = await fetch("/api/designs/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });

        if (res.ok) {
          const data = await res.json();
          setWishlistItems(data.designs || []);
        }
      } catch (err) {
        console.error("Wishlist load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  const handleRemove = (id: string) => {
    const updated = wishlistItems.filter(item => item.id !== id);
    setWishlistItems(updated);
    
    const updatedIds = updated.map(item => item.id);
    localStorage.setItem("morya_wishlist", JSON.stringify(updatedIds));
  };

  const handleAddToCart = (id: string) => {
    // 1. Get current cart
    const storedCart = localStorage.getItem("morya_cart");
    let cartIds = storedCart ? JSON.parse(storedCart) : [];
    if (!Array.isArray(cartIds)) cartIds = [];
    
    // 2. Add if not present
    if (!cartIds.includes(id)) {
      cartIds.push(id);
      localStorage.setItem("morya_cart", JSON.stringify(cartIds));
    }

    // 3. Remove from wishlist
    handleRemove(id);
    
    // 4. Alert user or redirect to cart
    alert("Design successfully added to your cart!");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-24 flex flex-col items-center justify-center min-h-[50vh] text-slate-800 bg-[#FAF9F6]">
        <Loader2 className="w-8 h-8 text-[#b89047] animate-spin mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 min-h-[70vh] bg-[#FAF9F6] text-slate-900 antialiased font-sans">
      
      {/* Breadcrumb */}
      <div className="mb-8 pb-4 border-b border-stone-200">
        <Link href="/designs" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-[#b89047] hover:text-slate-900 transition-colors mb-2">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Continue Browsing
        </Link>
        <h1 className="text-3xl font-serif font-normal text-slate-900 tracking-tight">My Wishlist</h1>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="py-20 text-center bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
          <Heart className="w-12 h-12 text-stone-300 stroke-1 mx-auto mb-4" />
          <h2 className="text-lg font-serif font-bold uppercase tracking-wider text-slate-900 mb-2">Wishlist is Empty</h2>
          <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider max-w-md mx-auto mb-8 leading-relaxed">
            You haven&apos;t saved any architectural designs to your favorites yet. Add items to your wishlist while browsing.
          </p>
          <Link 
            href="/designs" 
            className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 hover:bg-slate-800 text-[#b89047] text-xs font-bold tracking-widest uppercase transition-colors rounded-lg border border-slate-900 shadow-md"
          >
            Explore House Plans
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {wishlistItems.map((design) => {
            const image = design.images[0]?.url;
            return (
              <div 
                key={design.id} 
                className="group bg-white border border-stone-200 overflow-hidden hover:border-[#b89047]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full rounded-lg relative"
              >
                {/* Trash/Remove Button */}
                <button 
                  onClick={() => handleRemove(design.id)}
                  title="Remove from Favorites"
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm flex items-center justify-center border border-stone-200/60 shadow-sm text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Image Block */}
                <Link href={`/designs/${design.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-stone-100 border-b border-stone-200 rounded-t-lg">
                  {image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img 
                      src={image} 
                      alt={design.title} 
                      className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <FileDown className="w-10 h-10 stroke-1" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 z-10">
                    <Badge variant="secondary" className="bg-slate-900/90 text-white border-none rounded-md text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1">
                      {design.category}
                    </Badge>
                  </div>
                </Link>
                
                {/* Content Block */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold tracking-wider uppercase text-[#b89047]">{design.facing} Facing</span>
                    <span className="text-xs font-medium text-stone-500">{design.plotWidthFt}×{design.plotLengthFt} ft Plot</span>
                  </div>
                  
                  <Link href={`/designs/${design.slug}`} className="block mb-4">
                    <h3 className="text-sm font-serif font-semibold text-slate-900 group-hover:text-[#b89047] transition-colors line-clamp-2 min-h-[44px]">
                      {design.title}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-stone-500 uppercase tracking-wider mb-6">
                    <span>{design.bhk} BHK</span>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-stone-100 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-stone-400">Fixed Price</span>
                        <span className="font-serif font-bold text-base text-slate-900">{formatPrice(design.priceInr)}</span>
                      </div>
                      <Link 
                        href={`/designs/${design.slug}`}
                        className="text-xs font-semibold tracking-widest uppercase text-slate-950 hover:text-[#b89047] transition-colors flex items-center gap-1.5"
                      >
                        View Design <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <Button 
                      onClick={() => handleAddToCart(design.id)}
                      className="w-full h-10 text-xs font-bold uppercase tracking-widest bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-[#b89047]" /> Add to Cart
                    </Button>
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
