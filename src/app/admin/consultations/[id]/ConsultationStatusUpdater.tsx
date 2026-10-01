"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  id: string;
  initialStatus: string;
  initialNotes: string;
}

export function ConsultationStatusUpdater({ id, initialStatus, initialNotes }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/consultations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: notes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update consultation.");
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 shadow-sm sticky top-24">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-6 pb-3 border-b border-stone-200">
        Update Status & Notes
      </h3>

      <div className="space-y-6">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-2">Status</label>
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-11 border border-stone-200 rounded-lg px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b89047] bg-white"
          >
            <option value="PENDING">PENDING</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-2">Internal Admin Notes</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add internal notes (customers cannot see this)..."
            className="w-full h-32 border border-stone-200 rounded-lg p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b89047] resize-none"
          />
        </div>

        {error && <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">{error}</div>}
        {success && <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Successfully Updated!</div>}

        <Button 
          onClick={handleUpdate} 
          disabled={loading}
          className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded-lg"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
