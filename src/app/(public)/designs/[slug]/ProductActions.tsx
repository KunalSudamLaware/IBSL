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
      <div className="space-y-1">
        <Button 
          onClick={toggleWishlist}
          disabled={wishlistLoading}
          variant="outline"
          className={`w-full h-11 text-xs font-bold tracking-widest uppercase border-stone-250 hover:bg-stone-50 transition-all rounded-lg flex items-center justify-center gap-2 ${
            inWishlist ? "text-rose-600 border-rose-200 bg-rose-50/10 hover:bg-rose-50/20" : "text-slate-655"
          }`}
        >
          {wishlistLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
          ) : (
            <Heart className={`w-4 h-4 ${inWishlist ? "fill-rose-600 text-rose-600" : ""}`} /> 
          )}
          {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        </Button>
        {wishlistError && (
          <div className="text-[10px] font-bold text-rose-600 text-center uppercase tracking-wider flex items-center justify-center gap-2 mt-2">
            {wishlistError}
            <button onClick={() => router.push('/login')} className="underline">Login</button>
          </div>
        )}
      </div>

      {/* 4. Request Consultation */}
      <Button 
        onClick={() => router.push(`/consultation?design=${designId}`)}
        variant="outline"
        className="w-full h-11 text-xs font-bold tracking-widest uppercase border-stone-250 hover:bg-stone-50 transition-all rounded-lg flex items-center justify-center gap-2 text-slate-600 mt-4"
      >
        Request Consultation
      </Button>
    </div>
  );
}