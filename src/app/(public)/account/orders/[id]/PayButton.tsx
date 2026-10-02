"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";

interface Props {
  orderId: string;
}

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function PayButton({ orderId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Load Razorpay Checkout SDK
      const scriptLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK. Please check your internet connection.");
      }

      // 2. Call our API to create Razorpay Order on backend
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize payment.");
      }

      // 3. Open Razorpay Checkout modal
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: data.productName,
        description: data.productDescription,
        order_id: data.razorpayOrderId,
        prefill: {
          name: data.prefill.name,
          email: data.prefill.email,
          phone: data.prefill.phone,
        },
        theme: {
          color: "#b89047", // Theme matching Morya Designs warm gold accents
        },
        handler: async function (response: any) {
          setLoading(true);
          try {
            // 4. Send signature details to verification API
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }

            // Reload page on success to show the paid state
            router.refresh();
          } catch (err: any) {
            setError(err.message || "Payment verification failed.");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError("Payment cancelled. Your order is still pending payment.");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setError(response.error?.description || "Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();

    } catch (err: any) {
      setError(err.message || "An error occurred starting payment.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-full animate-in fade-in duration-500">
      {error && (
        <div className="p-4 text-[11px] font-bold uppercase tracking-widest text-rose-700 bg-rose-50 border border-rose-100 rounded-xl text-center shadow-sm flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 duration-300">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}
      
      <Button
        onClick={handlePay}
        disabled={loading}
        className={`w-full h-14 text-xs font-bold tracking-widest uppercase text-white rounded-xl shadow-md transition-all border flex items-center justify-center gap-2 ${
          loading 
            ? "bg-slate-400 border-slate-400 cursor-not-allowed shadow-none" 
            : "bg-slate-900 hover:bg-slate-800 hover:-translate-y-0.5 shadow-slate-900/20 border-slate-900"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" /> 
            <span className="opacity-90">Initializing Payment...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 text-[#b89047]" /> Pay with Razorpay
          </>
        )}
      </Button>
      
      <div className="flex flex-col items-center gap-1.5 pt-1 opacity-70 hover:opacity-100 transition-opacity">
        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider text-center">
          Secure payment powered by Razorpay
        </p>
        <div className="flex gap-2 items-center">
          {/* Subtle trust icons or flags can go here if needed */}
          <span className="text-[8px] tracking-[0.2em] font-bold text-stone-400 uppercase">100% Secure Checkout</span>
        </div>
      </div>
    </div>
  );
}
