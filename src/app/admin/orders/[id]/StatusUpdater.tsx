"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { OrderStatus } from "@prisma/client";

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
}

export function StatusUpdater({ orderId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(currentStatus);

  const handleUpdate = async () => {
    if (status === currentStatus) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const statuses: OrderStatus[] = [
    "PENDING", "PAID", "PROCESSING", "READY", "COMPLETED", "FAILED", "REFUNDED", "CANCELLED"
  ];

  return (
    <div className="mt-6 pt-4 border-t border-stone-200">
      <h3 className="text-[9px] font-bold uppercase tracking-widest text-stone-500 mb-2">Update Order Status</h3>
      <div className="flex gap-2">
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="flex-1 h-10 border border-stone-300 rounded-lg text-xs font-semibold px-3 bg-white text-slate-800"
        >
          {statuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button 
          onClick={handleUpdate}
          disabled={loading || status === currentStatus}
          className="h-10 px-4 bg-slate-900 text-white rounded-lg text-xs font-bold tracking-widest uppercase disabled:opacity-50 min-w-[90px]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Update"}
        </button>
      </div>
    </div>
  );
}
