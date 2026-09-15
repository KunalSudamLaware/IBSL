import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { CheckCircle2, Clock, Download, ArrowLeft, FileText, Lock, AlertTriangle } from "lucide-react";
import { auth } from "@/lib/auth";
import { generateDownloadToken } from "@/lib/tokens";
import { PayButton } from "./PayButton";
import { formatPrice } from "@/lib/format";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderConfirmationPage(props: PageProps) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return (
      <div className="min-h-[70vh] bg-stone-50/50 py-12 px-6 flex flex-col items-center justify-center text-slate-800">
        <div className="bg-white p-8 rounded-lg border border-stone-200 max-w-md w-full shadow-sm text-center">
          <Lock className="w-12 h-12 text-[#b89047] mx-auto mb-4" />
          <h1 className="text-xl font-serif text-slate-900 mb-2 font-serif">Login Required</h1>
          <p className="text-xs text-stone-500 mb-6 uppercase tracking-wider font-semibold">You must be logged in to view this order details.</p>
          <Link href="/login" className="w-full inline-flex items-center justify-center px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-widest uppercase rounded-lg">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const params = await props.params;
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      design: {
        include: { 
          images: { where: { isPrimary: true }, take: 1 },
          files: true
        }
      }
    }
}); if (!order || (order.userId !== session.user.id && session.user.role !== "ADMIN")) { return notFound(); } if (!order) {
    notFound();
  }

  // Security Check: Order email must match logged-in email
  if (order.email !== session.user.email) {
    return (
      <div className="min-h-[70vh] bg-stone-50/50 py-12 px-6 flex flex-col items-center justify-center text-slate-800">
        <div className="bg-white p-8 rounded-lg border border-stone-200 max-w-md w-full shadow-sm text-center">
          <Lock className="w-12 h-12 text-rose-600 mx-auto mb-4" />
          <h1 className="text-xl font-serif text-slate-900 mb-2 font-serif">Access Denied</h1>
          <p className="text-xs text-stone-500 mb-6 uppercase tracking-wider font-semibold">You do not have permission to view this order.</p>
          <Link href="/" className="w-full inline-flex items-center justify-center px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-widest uppercase rounded-lg">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const primaryImage = order.design.images[0];
  const isPaid = order.status === "PAID";
  const isFailed = order.status === "FAILED";

  const fileTypeLabels: Record<string, string> = {
    DWG: "Architectural Floor Plan (DWG CAD)",
    PDF: "Documentation & Plot Layout (PDF)",
    THREE_D: "3D Front Elevation (ZIP Model)",
  };

  return (
    <div className="min-h-[75vh] bg-[#FAF9F6] py-12 px-6 flex flex-col items-center justify-center text-slate-850 font-sans">
      <div className="bg-white p-8 md:p-12 rounded-lg border border-stone-200 max-w-2xl w-full shadow-sm">
        
        {/* Status Graphics */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-stone-50 rounded-lg flex items-center justify-center mx-auto mb-4 border border-stone-200">
            {isPaid ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : isFailed ? (
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            ) : (
              <Clock className="w-6 h-6 text-[#b89047]" />
            )}
          </div>
          
          <span className="text-[9px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-1">
            {isPaid ? "Receipt" : "Invoice"}
          </span>
          
          <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight font-serif">
            {isPaid ? "Purchase Confirmed" : isFailed ? "Payment Failed" : "Order Created"}
          </h1>
          
          <p className="text-xs text-stone-550 uppercase font-semibold mt-2 tracking-wider">
            {isPaid 
              ? "Your files are ready for secure download." 
              : isFailed 
              ? "The transaction could not be verified. Please try again." 
              : "Payment Pending. Complete payment to access your files."}
          </p>
        </div>

        {/* Invoice Summary */}
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4 border-b border-stone-200 pb-6">
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Order ID</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-900 truncate">
                {order.invoiceNumber || order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Date</p>
              <p className="text-xs font-semibold text-slate-800">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Payment Status</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                isPaid ? "bg-emerald-50 text-emerald-800 border border-emerald-250/20" :
                isFailed ? "bg-rose-50 text-rose-800 border border-rose-250/20" :
                "bg-amber-50 text-amber-800 border border-amber-250/20"
              }`}>
                {isPaid ? "PAID" : isFailed ? "FAILED" : "PENDING"}
              </span>
            </div>
          </div>

          {/* Design Details row */}
          <div className="flex items-center gap-4 py-4 border-b border-stone-100">
            {primaryImage && (
              <div className="w-20 h-16 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={primaryImage.url} alt={order.design.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">{order.design.title}</h3>
              <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider mt-1">
                {order.design.bhk} BHK &bull; {order.design.plotWidthFt}x{order.design.plotLengthFt} ft &bull; {order.design.facing} Facing
              </p>
            </div>
            <div className="font-serif font-bold text-slate-900 text-base">
              {formatPrice(order.amountInr)}
            </div>
          </div>

          {/* Deliverable Downloads list */}
          <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 flex items-center gap-1">
              <Download className="w-4 h-4 text-[#b89047]" /> Deliverables
            </h3>
            
            {order.design.files.length === 0 ? (
              <p className="text-xs text-stone-400 font-medium italic">File not available yet.</p>
            ) : (
              <div className="space-y-2">
                {order.design.files.map((file) => {
                  const downloadToken = generateDownloadToken(order.id, file.id);
                  const downloadUrl = `/api/downloads/${downloadToken}`;
                  return (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border border-stone-200 rounded-lg bg-white text-xs font-semibold text-slate-700"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#b89047]" /> {fileTypeLabels[file.fileType] || file.fileType}
                      </span>
                      
                      {isPaid ? (
                        <a
                          href={downloadUrl}
                          className="text-[#b89047] hover:text-slate-900 uppercase tracking-wider text-[10px] font-bold flex items-center gap-1 transition-colors"
                        >
                          Download <Download className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-stone-400 uppercase tracking-wider text-[9px] font-bold flex items-center gap-1 select-none">
                          Locked <Lock className="w-3.5 h-3.5 text-stone-300" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment Action block if PENDING */}
          {!isPaid && !isFailed && (
            <div className="pt-4">
              <PayButton orderId={order.id} />
            </div>
          )}

          {/* Customer Details Box */}
          <div className="bg-white p-6 rounded-lg border border-stone-200 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Customer Details</h4>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-stone-500">Email Address</span>
              <span className="text-slate-800">{order.email}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-stone-200">
          <Link 
            href="/account/orders" 
            className="w-full sm:w-1/2 inline-flex items-center justify-center px-4 py-2.5 border border-stone-300 text-slate-700 text-xs font-bold tracking-widest uppercase rounded-lg hover:bg-stone-50 h-11 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> View My Orders
          </Link>
          <Link 
            href="/designs" 
            className="w-full sm:w-1/2 inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-[#b89047] text-xs font-bold tracking-widest uppercase rounded-lg h-11 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
