"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useSession } from "@/components/providers/AuthProvider";

interface Props {
  designId: string;
}

export function WishlistButton({ designId }: Props) {
  const { data: session, status } = useSession();
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [showToast, setShowToast] = useState<{message: string, show: boolean}>({ message: "", show: false });

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/wishlist")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setInWishlist(data.some(item => item.designId === designId));
          }
        })
        .catch(err => console.error(err));
    } else if (status === "unauthenticated") {
      setInWishlist(false);
    }
  }, [status, designId]);

  const showFeedback = (message: string) => {
    setShowToast({ message, show: true });
    setTimeout(() => {
      setShowToast(prev => ({ ...prev, show: false }));
    }, 2000);
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return; // Prevent duplicate requests

    if (status !== "authenticated") {
      showFeedback("Login required");
      return;
    }

    setLoading(true);
    setClicked(true);
    setTimeout(() => setClicked(false), 300);

    try {
      if (inWishlist) {
        const res = await fetch(`/api/wishlist?designId=${designId}`, {
          method: "DELETE"
        });
        if (res.ok) {
          setInWishlist(false);
          showFeedback("Removed from wishlist");
        }
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ designId })
        });
        if (res.ok) {
          setInWishlist(true);
          showFeedback("Added to wishlist");
        }
      }
    } catch (err) {
      console.error(err);
      showFeedback("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-30">
      <button 
        type="button" 
        onClick={toggleWishlist}
        disabled={loading}
        title={inWishlist ? "Remove from Favorites" : "Save to Favorites"}
        className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm transition-all duration-300 transform outline-none focus:outline-none disabled:opacity-80 group/btn ${
          clicked ? "scale-90" : "hover:scale-110 hover:-translate-y-0.5"
        } ${
          inWishlist 
            ? "bg-rose-50 border border-rose-200 hover:bg-white" 
            : "bg-white/95 hover:bg-white border border-stone-200/80 hover:border-[#b89047]/30"
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
        ) : (
          <Heart 
            className={`w-[18px] h-[18px] transition-all duration-300 group-hover/btn:scale-95 ${
              inWishlist 
                ? "fill-rose-500 text-rose-500" 
                : "fill-transparent text-stone-400 group-hover/btn:text-rose-500"
            }`} 
          />
        )}
      </button>

      {/* Micro-toast feedback */}
      <div 
        className={`absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap bg-slate-900/90 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-md shadow-sm backdrop-blur-sm transition-all duration-300 ease-out ${
          showToast.show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        {showToast.message}
      </div>
    </div>
  );
}
