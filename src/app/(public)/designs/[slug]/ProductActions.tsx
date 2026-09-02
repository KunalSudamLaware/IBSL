"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  designId: string;
  designSlug: string;
  priceInr: number;
}

export function ProductActions({ designId, designSlug, priceInr }: Props) {
  const router = useRouter();
  const [inCart, setInCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  // Sync state with localStorage on mount
  useEffect(() => {
    // 1. Cart
    const storedCart = localStorage.getItem("morya_cart");
    if (storedCart) {
      const cartIds = JSON.parse(storedCart);
      if (Array.isArray(cartIds) && cartIds.includes(designId)) {
        setInCart(true);
      }
    }

    // 2. Wishlist
    const storedWishlist = localStorage.getItem("morya_wishlist");
    if (storedWishlist) {
      const wishlistIds = JSON.parse(storedWishlist);
      if (Array.isArray(wishlistIds) && wishlistIds.includes(designId)) {
        setInWishlist(true);
      }
    }
    
    // Listen for cross-tab or global cart changes
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

  const toggleCart = () => {
    const storedCart = localStorage.getItem("morya_cart");
    let cartIds = storedCart ? JSON.parse(storedCart) : [];
    if (!Array.isArray(cartIds)) cartIds = [];

    if (inCart) {
      // Remove
      const updated = cartIds.filter((id: string) => id !== designId);
      localStorage.setItem("morya_cart", JSON.stringify(updated));
      setInCart(false);
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      // Add
      cartIds.push(designId);
      localStorage.setItem("morya_cart", JSON.stringify(cartIds));
      setInCart(true);
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  const toggleWishlist = () => {
    const storedWishlist = localStorage.getItem("morya_wishlist");
    let wishlistIds = storedWishlist ? JSON.parse(storedWishlist) : [];
    if (!Array.isArray(wishlistIds)) wishlistIds = [];

    if (inWishlist) {
      // Remove
      const updated = wishlistIds.filter((id: string) => id !== designId);
      localStorage.setItem("morya_wishlist", JSON.stringify(updated));
      setInWishlist(false);
    } else {
      // Add
      wishlistIds.push(designId);
      localStorage.setItem("morya_wishlist", JSON.stringify(wishlistIds));
      setInWishlist(true);
    }
  };

  const handleBuyNow = () => {
    // Navigate straight to checkout for this design
    router.push(`/checkout?design=${designSlug}`);
  };

  return (
    <div className="space-y-4">
      {/* 1. Buy Now (Direct Checkout) */}
      <Button 
        onClick={handleBuyNow}
        className="w-full h-14 text-xs font-bold tracking-widest uppercase bg-[#b89047] hover:bg-[#b89047]/90 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg border border-[#b89047]"
      >
        Buy Now
      </Button>

      {/* 2. Cart Toggle */}
      <Button 
        onClick={toggleCart}
        variant={inCart ? "outline" : "default"}
        className={`w-full h-12 text-xs font-bold tracking-widest uppercase transition-all rounded-lg flex items-center justify-center gap-2 ${
          inCart 
            ? "border-slate-900 text-slate-900 bg-white hover:bg-stone-50" 
            : "bg-slate-900 text-white hover:bg-slate-800 border border-slate-900"
        }`}
      >
        {inCart ? (
          <>
            <Check className="w-4 h-4 text-emerald-600" /> In Your Cart
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4 text-[#b89047]" /> Add to Cart
          </>
        )}
      </Button>

      {/* 3. Wishlist Toggle */}
      <Button 
        onClick={toggleWishlist}
        variant="outline"
        className={`w-full h-11 text-xs font-bold tracking-widest uppercase border-stone-250 hover:bg-stone-50 transition-all rounded-lg flex items-center justify-center gap-2 ${
          inWishlist ? "text-rose-600 border-rose-200 bg-rose-50/10 hover:bg-rose-50/20" : "text-slate-655"
        }`}
      >
        <Heart className={`w-4 h-4 ${inWishlist ? "fill-rose-600 text-rose-600" : ""}`} /> 
        {inWishlist ? "Saved in Wishlist" : "Add to Wishlist"}
      </Button>
    </div>
  );
}