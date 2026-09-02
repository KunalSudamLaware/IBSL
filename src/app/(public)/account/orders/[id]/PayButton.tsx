"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";

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

            // Reload page on success
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
    <div className="space-y-3 w-full">
      {error && (
        <div className="p-3 text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-100 rounded-lg text-center leading-relaxed">
          {error}
        </div>
      )}
      
      <Button
        onClick={handlePay}
        disabled={loading}
        className="w-full h-12 bg-[#b89047] hover:bg-[#b89047]/90 text-white text-xs font-bold tracking-widest uppercase rounded-lg shadow-md hover:shadow-lg transition-all border border-[#b89047] flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Preparing Checkout...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" /> Pay with Razorpay
          </>
        )}
      </Button>
      <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider text-center">
        Demo test mode. Use simulated cards/netbanking credentials to process.
      </p>
    </div>
  );
}
