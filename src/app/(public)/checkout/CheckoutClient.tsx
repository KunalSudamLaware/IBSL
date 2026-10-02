"use client";

import { useState } from "react";
import { placeOrder } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, ShieldCheck, CreditCard } from "lucide-react";

interface InitialUser {
  name: string;
  email: string;
  phone: string;
}

interface Props {
  designIds: string[];
  initialUser: InitialUser;
}

export function CheckoutClient({ designIds, initialUser }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("designIds", JSON.stringify(designIds));

    try {
      const result = await placeOrder(formData);
      
      if (result && result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        // If order creation was successful, clear the cart from localStorage!
        localStorage.removeItem("morya_cart");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-slate-800 animate-in fade-in duration-500">
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-[11px] font-bold uppercase tracking-wider text-center shadow-sm animate-in fade-in zoom-in-95 duration-300">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div className="space-y-2.5">
          <Label htmlFor="fullName" className="text-[11px] font-bold uppercase tracking-widest text-slate-800">Full Name</Label>
          <Input 
            id="fullName" 
            name="fullName" 
            required 
            defaultValue={initialUser.name}
            placeholder="John Doe" 
            className="h-12 px-4 rounded-xl border-stone-200 text-sm focus-visible:ring-2 focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047] bg-white transition-all shadow-sm" 
          />
        </div>
        
        {/* Email is read-only since it is tied to account session */}
        <div className="space-y-2.5">
          <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-slate-800 flex justify-between">
            Email Address
            <span className="text-[9px] text-stone-400">Account verified</span>
          </Label>
          <div className="relative">
            <Input 
              id="email" 
              name="email" 
              type="email" 
              required 
              readOnly
              defaultValue={initialUser.email}
              className="h-12 px-4 pr-10 rounded-xl border-stone-250 bg-stone-50/80 text-stone-500 text-sm cursor-not-allowed select-none shadow-inner" 
            />
            <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
          </div>
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-widest text-slate-800">Phone Number</Label>
          <Input 
            id="phone" 
            name="phone" 
            type="tel" 
            required 
            defaultValue={initialUser.phone}
            placeholder="+91 9876543210" 
            className="h-12 px-4 rounded-xl border-stone-200 text-sm focus-visible:ring-2 focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047] bg-white transition-all shadow-sm" 
          />
        </div>
      </div>

      <div className="bg-stone-50 border border-stone-200/60 text-stone-600 p-5 rounded-xl text-[11px] leading-relaxed shadow-sm mt-8">
        <span className="font-bold text-slate-900 flex items-center gap-2 mb-2 uppercase tracking-widest text-[10px]">
          <CreditCard className="w-4 h-4 text-[#b89047]" /> Payment Method Notice
        </span>
        Order placements are simulated as paid transactions for demonstration. No actual Razorpay payments are required in this demo system.
      </div>

      <div className="pt-2">
        <Button 
          type="submit" 
          className="w-full h-14 text-xs font-bold tracking-widest uppercase bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md shadow-slate-900/10 transition-all hover:-translate-y-0.5 border border-slate-900 flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing Order...</>
          ) : (
            <>Place Secure Order <ArrowRight className="w-4 h-4 text-[#b89047]" /></>
          )}
        </Button>
      </div>
    </form>
  );
}
