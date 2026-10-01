"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DesignStatus } from "@prisma/client";
import { X, IndianRupee, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/format";

interface EditPriceModalProps {
  design: {
    id: string;
    title: string;
    priceInr: number;
    status: DesignStatus;
  };
  onClose: () => void;
}

export function EditPriceModal({ design, onClose }: EditPriceModalProps) {
  const router = useRouter();
  const [price, setPrice] = useState(String(design.priceInr));
  const [discountPrice, setDiscountPrice] = useState("");
  const [status, setStatus] = useState<DesignStatus>(design.status);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    const priceNum = parseInt(price.replace(/,/g, ""), 10);
    const discountNum = discountPrice ? parseInt(discountPrice.replace(/,/g, ""), 10) : null;

    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Price must be a positive number greater than 0.");
      return;
    }
    if (discountNum !== null && (isNaN(discountNum) || discountNum >= priceNum)) {
      setError("Discount price must be less than the original price.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/designs/${design.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceInr: priceNum,
          discountPriceInr: discountNum,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update. Please try again.");
        return;
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => onClose(), 1400);
    } catch {
      setError("Network error. Unable to reach the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md mx-4 bg-white rounded-xl border border-stone-200 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-stone-50/60">
          <div>
            <span className="text-[9px] font-bold tracking-[0.22em] text-[#b89047] uppercase block mb-0.5">
              Quick Edit
            </span>
            <h2 className="text-base font-serif text-slate-900 font-normal leading-tight line-clamp-1">
              {design.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-slate-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-xs font-semibold text-rose-700 uppercase tracking-wider">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Price updated successfully!
            </div>
          )}

          {/* Price */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Price (₹) <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                type="number"
                min={1}
                step={100}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-9 h-11 rounded-lg border-stone-200 text-sm focus-visible:ring-1 focus-visible:ring-[#b89047] bg-white"
                placeholder="35000"
              />
            </div>
            <p className="text-[10px] text-stone-400 font-semibold">
              Current: {formatPrice(design.priceInr)}
            </p>
          </div>

          {/* Discount Price */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Discount Price (₹) — Optional
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                type="number"
                min={0}
                step={100}
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="pl-9 h-11 rounded-lg border-stone-200 text-sm focus-visible:ring-1 focus-visible:ring-[#b89047] bg-white"
                placeholder="Leave blank if no discount"
              />
            </div>
            <p className="text-[10px] text-stone-400 font-semibold">
              Must be less than the original price.
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Status
            </Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as DesignStatus)}
            >
              <SelectTrigger className="h-11 rounded-lg border-stone-200 bg-white focus:ring-1 focus:ring-[#b89047]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/40 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="h-10 px-5 text-xs font-bold uppercase tracking-widest border-stone-200 text-slate-700 hover:bg-stone-100 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || success}
            className="h-10 px-6 text-xs font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-2"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {loading ? "Saving..." : success ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}