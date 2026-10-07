import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { CheckCircle2, Clock, Download, ArrowLeft, FileText, Lock, AlertTriangle, Hammer, PackageCheck, PackageOpen, XCircle, Check } from "lucide-react";
import { auth } from "@/lib/auth";
import { generateDownloadToken } from "@/lib/tokens";
import { PayButton } from "./PayButton";
import { DownloadPdfButton } from "./DownloadPdfButton";
import { OrderFeedbackClient } from "./OrderFeedbackClient";
import { formatPrice } from "@/lib/format";
import { OrderStatus } from "@prisma/client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderConfirmationPage(props: PageProps) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return (
      <div className="min-h-[75vh] bg-[#FAF9F6] py-12 px-6 flex flex-col items-center justify-center text-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-stone-100 to-transparent pointer-events-none -z-10" />
        <div className="bg-white p-10 rounded-[24px] border border-stone-200/60 max-w-md w-full shadow-lg shadow-stone-200/50 text-center animate-in fade-in zoom-in-95 duration-500">
          <Lock className="w-12 h-12 text-[#b89047] mx-auto mb-5" />
          <h1 className="text-2xl font-serif font-bold text-slate-900 mb-2 tracking-tight">Login Required</h1>
          <p className="text-[11px] text-stone-500 mb-8 uppercase tracking-widest font-bold">You must be logged in to view this order details.</p>
          <Link href="/login" className="w-full inline-flex items-center justify-center px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-all hover:-translate-y-0.5 shadow-md shadow-slate-900/10">
            Login to Continue
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
      <div className="min-h-[75vh] bg-[#FAF9F6] py-12 px-6 flex flex-col items-center justify-center text-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-stone-100 to-transparent pointer-events-none -z-10" />
        <div className="bg-white p-10 rounded-[24px] border border-stone-200/60 max-w-md w-full shadow-lg shadow-stone-200/50 text-center animate-in fade-in zoom-in-95 duration-500">
          <AlertTriangle className="w-12 h-12 text-rose-600 mx-auto mb-5" />
          <h1 className="text-2xl font-serif font-bold text-slate-900 mb-2 tracking-tight">Access Denied</h1>
          <p className="text-[11px] text-stone-500 mb-8 uppercase tracking-widest font-bold">You do not have permission to view this order.</p>
          <Link href="/" className="w-full inline-flex items-center justify-center px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-all hover:-translate-y-0.5 shadow-md shadow-slate-900/10">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const userReview = await prisma.review.findUnique({
    where: {
      userId_designId: {
        userId: session.user.id,
        designId: order.designId
      }
    },
    include: {
      user: { select: { name: true } }
    }
  });

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
    <div className="min-h-[85vh] bg-[#FAF9F6] py-16 px-6 flex flex-col items-center justify-center text-slate-850 font-sans relative overflow-hidden">
      
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-stone-100 to-transparent pointer-events-none -z-10" />

      <div className="bg-white p-8 md:p-12 rounded-[24px] border border-stone-200/60 max-w-4xl w-full shadow-xl shadow-stone-200/50 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
        
        {/* Status Graphics */}
        <div className="text-center mb-12 relative z-10">
          {isFullyPaid && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-50 -z-10 animate-in zoom-in duration-1000" />
          )}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm transition-transform hover:scale-105 duration-300 ${
            isFullyPaid ? "bg-emerald-50 border-2 border-emerald-200" : 
            isFailed || isCancelled || isRefunded ? "bg-rose-50 border-2 border-rose-200" : 
            "bg-amber-50 border-2 border-[#b89047]/30"
          }`}>
            {isFullyPaid ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            ) : isFailed || isCancelled || isRefunded ? (
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            ) : (
              <Clock className="w-8 h-8 text-[#b89047]" />
            )}
          </div>
          
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-2">
            {isFullyPaid ? "Order Receipt" : "Pending Invoice"}
          </span>
          
          <h1 className="text-3xl md:text-4xl font-serif text-slate-900 font-bold tracking-tight">
            {order.status === "COMPLETED" ? "Order Completed" :
             order.status === "READY" ? "Design Ready" :
             order.status === "PROCESSING" ? "Processing Order" :
             order.status === "PAID" ? "Payment Successful" : 
             isFailed ? "Payment Failed" : 
             isCancelled ? "Order Cancelled" :
             isRefunded ? "Order Refunded" :
             "Secure Checkout"}
          </h1>
          
          <p className="text-[11px] text-stone-500 uppercase font-bold mt-3 tracking-widest max-w-[400px] mx-auto leading-relaxed">
            {isFullyPaid 
              ? "Your transaction was successful. Thank you for your purchase!" 
              : isFailed 
              ? "The transaction could not be verified. Please try again." 
              : isCancelled || isRefunded
              ? "This order is no longer active."
              : "Payment Pending. Complete your payment to unlock your design files."}
          </p>
        </div>

        {/* TRACKING TIMELINE */}
        {!isFailed && !isCancelled && !isRefunded && (
          <div className="mb-14 py-8 px-6 bg-stone-50/80 border border-stone-200/80 rounded-2xl overflow-hidden shadow-inner relative animate-in fade-in zoom-in-95 duration-700 delay-150">
            <h3 className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 mb-10">Order Progress</h3>
            
            <div className="relative max-w-2xl mx-auto">
              {/* Connecting line */}
              <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-stone-200 hidden md:block rounded-full">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.max(0, (currentIndex / (stages.length - 1)) * 100)}%` }}
                />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-0 relative z-10">
                {/* 1. Pending */}
                <div className="flex flex-col items-center flex-1 w-full md:w-auto text-center relative group">
                  <div className="md:hidden absolute left-8 top-10 bottom-[-40px] w-1 bg-stone-200 -z-10 rounded-full" />
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 mb-3 bg-white transition-all duration-500 shadow-sm ${
                    currentIndex >= 0 ? "border-emerald-500 text-emerald-500 scale-110" : "border-stone-200 text-stone-300"
                  }`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${currentIndex >= 0 ? "text-slate-900" : "text-stone-400"}`}>Pending</span>
                </div>

                {/* 2. Confirmed */}
                <div className="flex flex-col items-center flex-1 w-full md:w-auto text-center relative group">
                  <div className="md:hidden absolute left-8 top-10 bottom-[-40px] w-1 bg-stone-200 -z-10 rounded-full" />
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 mb-3 bg-white transition-all duration-500 shadow-sm ${
                    currentIndex >= 1 ? "border-emerald-500 text-emerald-500 scale-110" : "border-stone-200 text-stone-300"
                  }`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${currentIndex >= 1 ? "text-slate-900" : "text-stone-400"}`}>Confirmed</span>
                </div>

                {/* 3. Processing */}
                <div className="flex flex-col items-center flex-1 w-full md:w-auto text-center relative group">
                  <div className="md:hidden absolute left-8 top-10 bottom-[-40px] w-1 bg-stone-200 -z-10 rounded-full" />
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 mb-3 bg-white transition-all duration-500 shadow-sm ${
                    currentIndex >= 2 ? "border-emerald-500 text-emerald-500 scale-110" : "border-stone-200 text-stone-300"
                  }`}>
                    <Hammer className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${currentIndex >= 2 ? "text-slate-900" : "text-stone-400"}`}>Processing</span>
                </div>

                {/* 4. Ready */}
                <div className="flex flex-col items-center flex-1 w-full md:w-auto text-center relative group">
                  <div className="md:hidden absolute left-8 top-10 bottom-[-40px] w-1 bg-stone-200 -z-10 rounded-full" />
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 mb-3 bg-white transition-all duration-500 shadow-sm ${
                    currentIndex >= 3 ? "border-emerald-500 text-emerald-500 scale-110" : "border-stone-200 text-stone-300"
                  }`}>
                    <PackageOpen className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${currentIndex >= 3 ? "text-slate-900" : "text-stone-400"}`}>Design Ready</span>
                </div>

                {/* 5. Completed */}
                <div className="flex flex-col items-center flex-1 w-full md:w-auto text-center relative group">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 mb-3 bg-white transition-all duration-500 shadow-sm ${
                    currentIndex >= 4 ? "border-emerald-500 text-emerald-500 scale-110" : "border-stone-200 text-stone-300"
                  }`}>
                    <Check className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${currentIndex >= 4 ? "text-slate-900" : "text-stone-400"}`}>Completed</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Summary */}
        <div className="space-y-6 lg:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-stone-200/60 pb-8">
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Order ID</p>
              <p className="text-[13px] font-bold uppercase tracking-wider text-slate-900 truncate">
                {order.invoiceNumber || order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Date</p>
              <p className="text-[13px] font-bold text-slate-900">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Payment Status</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                isFullyPaid ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                isFailed || isCancelled || isRefunded ? "bg-rose-50 text-rose-700 border border-rose-200" :
                "bg-amber-50 text-[#b89047] border border-[#b89047]/20"
              }`}>
                {isFullyPaid ? "PAID" : order.status}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Order Status</p>
              <span className="inline-flex items-center text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                {order.status.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Design Details row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 py-6 border-b border-stone-150">
            {primaryImage && (
              <div className="w-full sm:w-[120px] h-48 sm:h-[90px] rounded-xl overflow-hidden bg-stone-50 border border-stone-200/60 shrink-0 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={primaryImage.url} alt={order.design.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="text-base font-serif font-bold text-slate-900 truncate mb-1">{order.design.title}</h3>
              <p className="text-[11px] text-stone-500 font-bold uppercase tracking-widest mt-1">
                {order.design.bhk} BHK &bull; {order.design.plotWidthFt}x{order.design.plotLengthFt} ft &bull; {order.design.facing} Facing
              </p>
            </div>
            <div className="font-sans font-bold text-slate-900 text-2xl tracking-tight">
              {formatPrice(order.amountInr)}
            </div>
          </div>

          {/* Payment Action block if PENDING */}
          {order.status === "PENDING" && (
            <div className="py-4">
              <PayButton orderId={order.id} />
            </div>
          )}

          {/* Deliverable Downloads list */}
          <div className="bg-stone-50/80 p-6 md:p-8 rounded-2xl border border-stone-200/60 space-y-5 shadow-sm">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-[#b89047]" /> Design Deliverables
            </h3>
            
            {/* Order Receipt */}
            {!isFailed && !isCancelled && !isRefunded && (
              <DownloadPdfButton 
                orderId={order.id} 
                endpoint={`/api/orders/${order.id}/pdf`} 
                label="Order Receipt" 
              />
            )}

            {/* Purchased Design PDF */}
            {(() => {
              const hasPdf = order.design.files.some(f => f.fileType === "PDF");
              
              if (!hasPdf) {
                return (
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-stone-200/80 rounded-xl bg-white text-xs font-bold text-slate-700 shadow-sm gap-3 sm:gap-0">
                      <span className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-[#b89047]" /> Design PDF
                      </span>
                      <span className="text-stone-400 uppercase tracking-widest text-[10px] font-bold flex items-center gap-1.5 select-none bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                        PDF NOT AVAILABLE YET <Lock className="w-3.5 h-3.5 text-stone-300" />
                      </span>
                    </div>
                    <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider ml-1 mt-1 block">
                      The design PDF is not available yet. Please check again later.
                    </span>
                  </div>
                );
              }

              if (isFullyPaid) {
                return (
                  <DownloadPdfButton 
                    orderId={order.id} 
                    endpoint={`/api/orders/${order.id}/design-pdf`} 
                    label="Design PDF Ready" 
                  />
                );
              }

              return (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-stone-200/80 rounded-xl bg-white text-xs font-bold text-slate-700 shadow-sm gap-3 sm:gap-0">
                  <span className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#b89047]" /> ?? Design PDF Locked
                  </span>
                  <span className="text-stone-400 uppercase tracking-widest text-[10px] font-bold flex items-center gap-1.5 select-none bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                    Complete payment to access your design <Lock className="w-3.5 h-3.5 text-stone-300" />
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Feedback Section */}
          <OrderFeedbackClient 
            orderId={order.id}
            designId={order.designId}
            isPaid={isFullyPaid}
            existingReview={userReview}
          />

          {/* Customer Details Box */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/60 space-y-4 shadow-sm hidden">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Customer Details</h4>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-stone-500">Email Address</span>
              <span className="text-slate-800">{order.email}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-8 border-t border-stone-200/60 lg:px-6">
          <Link 
            href="/account/orders" 
            className="w-full sm:w-1/2 inline-flex items-center justify-center px-4 py-3 border-2 border-stone-200 text-slate-700 text-[11px] font-bold tracking-widest uppercase rounded-xl hover:bg-stone-50 hover:border-stone-300 h-14 transition-all">
            View My Orders
          </Link>
          <Link 
            href="/designs" 
            className="w-full sm:w-1/2 inline-flex items-center justify-center px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold tracking-widest uppercase rounded-xl h-14 transition-all hover:-translate-y-0.5 shadow-md shadow-slate-900/10 gap-2">
            Continue Browsing <ArrowLeft className="w-4 h-4 rotate-180 text-[#b89047]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
