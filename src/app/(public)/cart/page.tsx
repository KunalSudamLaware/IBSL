"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  images: { url: string }[];
}

export default function ShoppingCartPage() {
  const [cartItems, setCartItems] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart items on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedIds = localStorage.getItem("morya_cart");
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
          setCartItems(data.designs || []);
        }
      } catch (err) {
        console.error("Cart load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const handleRemove = (id: string) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    
    const updatedIds = updated.map(item => item.id);
    localStorage.setItem("morya_cart", JSON.stringify(updatedIds));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.priceInr, 0);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-24 flex flex-col items-center justify-center min-h-[50vh] text-slate-800 bg-[#FAF9F6]">
        <Loader2 className="w-8 h-8 text-[#b89047] animate-spin mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 min-h-[70vh] bg-[#FAF9F6] text-slate-900 antialiased font-sans">
      
      {/* Breadcrumb */}
      <div className="mb-8 pb-4 border-b border-stone-200">
        <Link href="/designs" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-[#b89047] hover:text-slate-900 transition-colors mb-2">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Continue Shopping
        </Link>
        <h1 className="text-3xl font-serif font-normal text-slate-900 tracking-tight">Shopping Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="py-20 text-center bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-stone-300 stroke-1 mx-auto mb-4" />
          <h2 className="text-lg font-serif font-bold uppercase tracking-wider text-slate-900 mb-2">Your Cart is Empty</h2>
          <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider max-w-md mx-auto mb-8 leading-relaxed">
            You haven&apos;t added any architectural designs to your cart yet. Explore our portfolio to find your perfect house plan.
          </p>
          <Link 
            href="/designs" 
            className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 hover:bg-slate-800 text-[#b89047] text-xs font-bold tracking-widest uppercase transition-colors rounded-lg border border-slate-900 shadow-md"
          >
            Browse House Plans
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart items list */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => {
              const image = item.images[0]?.url;
              return (
                <div key={item.id} className="bg-white border border-stone-200 p-6 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-[#b89047]/30 transition-all duration-300">
                  <div className="flex items-center gap-4 flex-1">
                    {image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={image} alt={item.title} className="w-24 h-18 object-cover rounded-lg border border-stone-200 shrink-0 bg-stone-50" />
                    ) : (
                      <div className="w-24 h-18 bg-stone-50 border border-stone-200 rounded-lg shrink-0 flex items-center justify-center text-stone-400">
                        <FileText className="w-6 h-6 stroke-1" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <Link href={`/designs/${item.slug}`} className="hover:text-[#b89047] transition-colors">
                        <h3 className="font-serif font-bold text-sm text-slate-900 line-clamp-1">{item.title}</h3>
                      </Link>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-1">{item.category}</p>
                      <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-widest mt-1">
                        {item.bhk} BHK &bull; {item.plotWidthFt}x{item.plotLengthFt} ft Plot
                      </p>
                    </div>
                  </div>
                  
                  {/* Price & Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    <span className="font-serif font-bold text-slate-900 text-sm">{formatPrice(item.priceInr)}</span>
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 transition-colors border border-stone-150 rounded-lg bg-stone-50/20 cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart summary box */}
          <div className="lg:col-span-4 bg-white border border-stone-200 p-8 rounded-lg shadow-sm space-y-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-stone-100">Order Summary</h2>
              <div className="flex justify-between items-center text-xs font-semibold py-4 border-b border-stone-100 text-slate-700">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-stone-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Total Price</span>
                <span className="font-serif font-bold text-base text-slate-900">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <Link 
              href={`/checkout?designs=${cartItems.map(i => i.id).join(",")}`}
              className="w-full h-12 inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-[#b89047] text-xs font-bold tracking-widest uppercase rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-slate-900 gap-1"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            
            <p className="text-[10px] text-stone-405 font-bold uppercase tracking-widest text-center">
              ðŸ”’ Instant Delivery After Successful Checkout
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
