import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { CheckCircle2, Clock, Download, ArrowLeft, FileText, Lock, AlertTriangle, Hammer, PackageCheck, PackageOpen, XCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { generateDownloadToken } from "@/lib/tokens";
import { PayButton } from "./PayButton";
import { DownloadPdfButton } from "./DownloadPdfButton";
import { formatPrice } from "@/lib/format";
import { OrderStatus } from "@prisma/client";

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
  }); 

  if (!order) {
    notFound();
  }

  // Security Check: Order email must match logged-in email, or user is admin
  if (order.email !== session.user.email && session.user.role !== "ADMIN") {
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
  const isFailed = order.status === "FAILED";
  const isCancelled = order.status === "CANCELLED";
  const isRefunded = order.status === "REFUNDED";

  // Timeline logic
  const stages = ["PENDING", "PAID", "PROCESSING", "READY", "COMPLETED"];
  
  // Find current stage index (if it's in the happy path)
  let currentIndex = stages.indexOf(order.status);
  
  // If the status is not in the normal progression (e.g. FAILED, CANCELLED, REFUNDED),
  // we either map it to an error state or stop progress at PENDING.
  if (isFailed || isCancelled || isRefunded) {
    currentIndex = 0; // stop at PENDING visually
  }

  // Determine if the PDF is downloadable. In Morya Designs, PAID or later is usually required.
  const isPaid = currentIndex >= 1; 
  const isFullyPaid = order.status === "PAID" || order.status === "PROCESSING" || order.status === "READY" || order.status === "COMPLETED";

  return (
    <div className="min-h-[75vh] bg-[#FAF9F6] py-12 px-6 flex flex-col items-center justify-center text-slate-850 font-sans">
      <div className="bg-white p-8 md:p-12 rounded-lg border border-stone-200 max-w-4xl w-full shadow-sm">
        
        {/* Status Graphics */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-stone-50 rounded-lg flex items-center justify-center mx-auto mb-4 border border-stone-200">
            {isFullyPaid ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : isFailed || isCancelled || isRefunded ? (
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            ) : (
              <Clock className="w-6 h-6 text-[#b89047]" />
            )}
          </div>
          
          <span className="text-[9px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-1">
            {isFullyPaid ? "Receipt" : "Invoice"}
          </span>
          
          <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight">
            {order.status === "COMPLETED" ? "Order Completed" :
             order.status === "READY" ? "Design Ready" :
             order.status === "PROCESSING" ? "Processing Order" :
             order.status === "PAID" ? "Payment Confirmed" : 
             isFailed ? "Payment Failed" : 
             isCancelled ? "Order Cancelled" :
             isRefunded ? "Order Refunded" :
             "Order Created"}
          </h1>
          
          <p className="text-xs text-stone-550 uppercase font-semibold mt-2 tracking-wider">
            {isFullyPaid 
              ? "Your transaction was successful." 
              : isFailed 
              ? "The transaction could not be verified. Please try again." 
              : isCancelled || isRefunded
              ? "This order is no longer active."
              : "Payment Pending. Complete payment to proceed."}
          </p>
        </div>

        {/* TRACKING TIMELINE */}
        {!isFailed && !isCancelled && !isRefunded && (
          <div className="mb-12 py-8 px-4 bg-stone-50 border border-stone-200 rounded-xl overflow-hidden">
            <h3 className="text-center text-xs font-bold uppercase tracking-widest text-slate-900 mb-8">Order Tracking</h3>
            
            <div className="relative max-w-2xl mx-auto">
              {/* Connecting line */}
              <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-stone-200 hidden md:block">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                  style={{ width: `${Math.max(0, (currentIndex / (stages.length - 1)) * 100)}%` }}
                />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-0 relative z-10">
                {/* 1. Pending */}
                <div className="flex flex-col items-center flex-1 w-full md:w-auto text-center relative group">
                  <div className="md:hidden absolute left-8 top-10 bottom-[-40px] w-0.5 bg-stone-200 -z-10" />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-3 bg-white transition-colors duration-300 ${
                    currentIndex >= 0 ? "border-emerald-500 text-emerald-600" : "border-stone-300 text-stone-400"
                  }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${currentIndex >= 0 ? "text-slate-900" : "text-stone-400"}`}>Pending</span>
                </div>

                {/* 2. Confirmed */}
                <div className="flex flex-col items-center flex-1 w-full md:w-auto text-center relative group">
                  <div className="md:hidden absolute left-8 top-10 bottom-[-40px] w-0.5 bg-stone-200 -z-10" />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-3 bg-white transition-colors duration-300 ${
                    currentIndex >= 1 ? "border-emerald-500 text-emerald-600" : "border-stone-300 text-stone-400"
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${currentIndex >= 1 ? "text-slate-900" : "text-stone-400"}`}>Confirmed</span>
                </div>

                {/* 3. Processing */}
                <div className="flex flex-col items-center flex-1 w-full md:w-auto text-center relative group">
                  <div className="md:hidden absolute left-8 top-10 bottom-[-40px] w-0.5 bg-stone-200 -z-10" />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-3 bg-white transition-colors duration-300 ${
                    currentIndex >= 2 ? "border-emerald-500 text-emerald-600" : "border-stone-300 text-stone-400"
                  }`}>
                    <Hammer className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${currentIndex >= 2 ? "text-slate-900" : "text-stone-400"}`}>Processing</span>
                </div>

                {/* 4. Ready */}
                <div className="flex flex-col items-center flex-1 w-full md:w-auto text-center relative group">
                  <div className="md:hidden absolute left-8 top-10 bottom-[-40px] w-0.5 bg-stone-200 -z-10" />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-3 bg-white transition-colors duration-300 ${
                    currentIndex >= 3 ? "border-emerald-500 text-emerald-600" : "border-stone-300 text-stone-400"
                  }`}>
                    <PackageOpen className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${currentIndex >= 3 ? "text-slate-900" : "text-stone-400"}`}>Design Ready</span>
                </div>

                {/* 5. Completed */}
                <div className="flex flex-col items-center flex-1 w-full md:w-auto text-center relative group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-3 bg-white transition-colors duration-300 ${
                    currentIndex >= 4 ? "border-emerald-500 text-emerald-600" : "border-stone-300 text-stone-400"
                  }`}>
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${currentIndex >= 4 ? "text-slate-900" : "text-stone-400"}`}>Completed</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Summary */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-stone-200 pb-6">
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
                isFullyPaid ? "bg-emerald-50 text-emerald-800 border border-emerald-250/20" :
                isFailed || isCancelled || isRefunded ? "bg-rose-50 text-rose-800 border border-rose-250/20" :
                "bg-amber-50 text-amber-800 border border-amber-250/20"
              }`}>
                {isFullyPaid ? "PAID" : order.status}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Order Status</p>
              <span className="inline-flex items-center text-[10px] font-bold text-slate-900 uppercase">
                {order.status.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Design Details row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b border-stone-100">
            {primaryImage && (
              <div className="w-full sm:w-20 h-32 sm:h-16 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
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
            
            {isFullyPaid ? <DownloadPdfButton orderId={order.id} /> : (
              <div className="flex items-center justify-between p-3 border border-stone-200 rounded-lg bg-white text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#b89047]" /> Documentation & Plot Layout (PDF)
                </span>
                <span className="text-stone-400 uppercase tracking-wider text-[9px] font-bold flex items-center gap-1 select-none">
                  Locked <Lock className="w-3.5 h-3.5 text-stone-300" />
                </span>
              </div>
            )}
          </div>

          {/* Payment Action block if PENDING */}
          {order.status === "PENDING" && (
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
            className="w-full sm:w-1/2 inline-flex items-center justify-center px-4 py-2.5 border border-stone-300 text-slate-700 text-xs font-bold tracking-widest uppercase rounded-lg hover:bg-stone-50 h-11 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> View My Orders
          </Link>
          <Link 
            href="/designs" 
            className="w-full sm:w-1/2 inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-[#b89047] text-xs font-bold tracking-widest uppercase rounded-lg h-11 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
