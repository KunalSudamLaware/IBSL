"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCcw } from "lucide-react";

export function ReconcileButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleReconcile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/reconcile`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        alert("Payment synchronized successfully.");
        router.refresh();
      } else {
        alert(data.error || data.message || "Reconciliation failed.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReconcile}
      disabled={loading}
      className="mt-3 w-full flex items-center justify-center gap-2 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
      {loading ? "Syncing..." : "Sync Razorpay Payment"}
    </button>
  );
}
