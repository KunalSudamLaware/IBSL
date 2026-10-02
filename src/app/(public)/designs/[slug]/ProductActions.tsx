"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/providers/AuthProvider";

interface Props {
  designId: string;
  designSlug: string;
  priceInr: number;
}

export function ProductActions({ designId, designSlug, priceInr }: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [inCart, setInCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState("");

  // Sync cart with localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem("morya_cart");
    if (storedCart) {
      const cartIds = JSON.parse(storedCart);
      if (Array.isArray(cartIds) && cartIds.includes(designId)) {
        setInCart(true);
      }
    }
    
    const handleCartUpdate = () => {
      const currentCart = localStorage.getItem("morya_cart");
      if (currentCart) {
        const cartIds = JSON.parse(currentCart);
        setInCart(Array.isArray(cartIds) && cartIds.includes(designId));
      } else {
        setInCart(false);
      }
    };
    
    window.addEventListener("storage", handleCartUpdate);
    window.addEventListener("cartUpdated", handleCartUpdate);
    
    return () => {
      window.removeEventListener("storage", handleCartUpdate);
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [designId]);

  // Sync wishlist from API if logged in
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/wishlist")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const isSaved = data.some(item => item.designId === designId);
            setInWishlist(isSaved);
          }
        })
        .catch(err => console.error(err));
    } else if (status === "unauthenticated") {
      setInWishlist(false);
    }
  }, [status, designId]);

  const toggleCart = () => {
    const storedCart = localStorage.getItem("morya_cart");
    let cartIds = storedCart ? JSON.parse(storedCart) : [];
    if (!Array.isArray(cartIds)) cartIds = [];

    if (inCart) {
      const updated = cartIds.filter((id: string) => id !== designId);
      localStorage.setItem("morya_cart", JSON.stringify(updated));
      setInCart(false);
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      cartIds.push(designId);
      localStorage.setItem("morya_cart", JSON.stringify(cartIds));
      setInCart(true);
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  const toggleWishlist = async () => {
    if (status !== "authenticated") {
      setWishlistError("Please login to add designs to your wishlist.");
      return;
    }

    setWishlistError("");
    setWishlistLoading(true);

    try {
      if (inWishlist) {
        // Remove
        const res = await fetch(`/api/wishlist?designId=${designId}`, {
          method: "DELETE"
        });
        if (res.ok) setInWishlist(false);
      } else {
        // Add
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ designId })
        });
        if (res.ok) setInWishlist(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleBuyNow = () => {
    router.push(`/checkout?design=${designSlug}`);
  };

  return (
    <div className="space-y-4">
      {/* 1. Buy Now (Direct Checkout) */}
      <button 
        onClick={handleBuyNow}
        className="group relative w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center gap-2 overflow-hidden shadow-lg shadow-slate-900/20 transition-all duration-300 transform hover:-translate-y-0.5"
      >
        <span className="relative z-10 text-sm font-bold tracking-widest uppercase">Buy Now</span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
      </button>

      <div className="grid grid-cols-2 gap-3">
        {/* 2. Cart Toggle */}
        <button 
          onClick={toggleCart}
          className={`h-12 text-[10px] font-bold tracking-widest uppercase transition-all rounded-lg flex items-center justify-center gap-2 border shadow-sm ${
            inCart 
              ? "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100" 
              : "bg-white text-slate-700 hover:bg-stone-50 border-stone-200 hover:border-stone-300"
          }`}
        >
          {inCart ? (
            <>
              <Check className="w-[14px] h-[14px] text-emerald-600" /> In Cart
            </>
          ) : (
            <>
              <ShoppingCart className="w-[14px] h-[14px] text-[#b89047]" /> Add to Cart
            </>
          )}
        </button>

        {/* 3. Wishlist Toggle */}
        <div className="space-y-1 relative">
          <button 
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className={`w-full h-12 text-[10px] font-bold tracking-widest uppercase border transition-all duration-300 rounded-lg flex items-center justify-center gap-2 shadow-sm ${
              inWishlist 
                ? "text-rose-600 border-rose-200 bg-rose-50/50 hover:bg-rose-50" 
                : "text-slate-700 bg-white border-stone-200 hover:bg-stone-50 hover:border-stone-300"
            }`}
          >
            {wishlistLoading ? (
              <Loader2 className="w-[14px] h-[14px] animate-spin text-stone-400" />
            ) : (
              <Heart 
                className={`w-[14px] h-[14px] transition-all duration-300 ${
                  inWishlist ? "fill-rose-500 text-rose-500 scale-110" : "fill-transparent"
                }`} 
              /> 
            )}
            {inWishlist ? "Saved" : "Save"}
          </button>
        </div>
      </div>
      
      {wishlistError && (
        <div className="text-[10px] font-bold text-rose-600 text-center uppercase tracking-wider flex items-center justify-center gap-2 mt-2">
          {wishlistError}
          <button onClick={() => router.push('/login')} className="underline">Login</button>
        </div>
      )}

      {/* 4. Request Consultation */}
      <button 
        onClick={() => router.push(`/consultation?design=${designId}`)}
        className="w-full h-11 text-[10px] font-bold tracking-widest uppercase border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 transition-all rounded-lg flex items-center justify-center gap-2 text-slate-600 mt-4 shadow-sm"
      >
        Request Consultation
      </button>
    </div>
  );
}