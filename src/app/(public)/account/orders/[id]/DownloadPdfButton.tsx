"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";

export function DownloadPdfButton({ orderId }: { orderId: string }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/pdf`);
      
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || "Failed to download PDF");
      }

      // Read as blob
      const blob = await response.blob();
      
      // Get filename from Content-Disposition header if available
      let filename = `Morya-Designs-Order-${orderId.slice(0, 8).toUpperCase()}.pdf`;
      const disposition = response.headers.get('content-disposition');
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const matches = /filename="([^"]+)"/.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1];
        }
      }

      // Create a temporary link to download the blob
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between p-3 border border-stone-200 rounded-lg bg-white text-xs font-semibold text-slate-700">
        <span className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#b89047]" /> Documentation & Plot Layout (PDF)
        </span>
        
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="text-[#b89047] hover:text-slate-900 uppercase tracking-wider text-[10px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
        >
          {downloading ? (
            <>Downloading... <Loader2 className="w-3.5 h-3.5 animate-spin" /></>
          ) : (
            <>Download <Download className="w-3.5 h-3.5" /></>
          )}
        </button>
      </div>
      {error && (
        <p className="text-[10px] font-bold text-rose-600 tracking-wider">
          {error}
        </p>
      )}
    </div>
  );
}
