"use client";

import { useState } from "react";
import { placeOrder } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <form onSubmit={handleSubmit} className="space-y-6 text-slate-800">
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-lg text-xs font-semibold uppercase tracking-wider text-center">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <Label htmlFor="fullName" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">Full Name</Label>
          <Input 
            id="fullName" 
            name="fullName" 
            required 
            defaultValue={initialUser.name}
            placeholder="John Doe" 
            className="h-11 rounded-lg border-stone-200 text-sm focus-visible:ring-1 focus-visible:ring-[#b89047] bg-white" 
          />
        </div>
        
        {/* Email is read-only since it is tied to account session */}
        <div>
          <Label htmlFor="email" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">Email Address</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            required 
            readOnly
            defaultValue={initialUser.email}
            className="h-11 rounded-lg border-stone-250 bg-stone-50 text-stone-500 text-sm cursor-not-allowed select-none" 
          />
        </div>

        <div>
          <Label htmlFor="phone" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">Phone Number</Label>
          <Input 
            id="phone" 
            name="phone" 
            type="tel" 
            required 
            defaultValue={initialUser.phone}
            placeholder="+91 9876543210" 
            className="h-11 rounded-lg border-stone-200 text-sm focus-visible:ring-1 focus-visible:ring-[#b89047] bg-white" 
          />
        </div>
      </div>

      <div className="bg-stone-50 border border-stone-200 text-stone-600 p-4 rounded-lg text-xs leading-relaxed">
        <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wider">Payment Method Notice</span>
        Order placements are simulated as paid transactions for demonstration. No actual Razorpay payments are required in this demo system.
      </div>

      <Button 
        type="submit" 
        className="w-full h-11 text-xs font-bold tracking-widest uppercase bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm transition-colors border border-slate-900 mt-2"
        disabled={loading}
      >
        {loading ? "Processing Order..." : "Place Order"}
      </Button>
    </form>
  );
}
