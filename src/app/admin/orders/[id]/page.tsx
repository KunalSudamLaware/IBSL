import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, FileText, CheckCircle2, Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage(props: PageProps) {
  const params = await props.params;
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      design: {
        include: { images: { where: { isPrimary: true }, take: 1 } }
      },
      user: true,
    }
  });

  if (!order) {
    notFound();
  }

  const primaryImage = order.design.images[0];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 bg-white text-slate-800 antialiased">
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold uppercase tracking-widest text-[#b89047] mb-4 flex items-center gap-1.5">
        <Link href="/admin/dashboard" className="hover:text-slate-900 transition-colors">Admin</Link>
        <span className="text-stone-400">/</span>
        <Link href="/admin/orders" className="hover:text-slate-900 transition-colors">Orders</Link>
        <span className="text-stone-400">/</span>
        <span className="text-slate-900">{order.invoiceNumber || order.id.slice(0, 8)}</span>
      </div>

      {/* Header Info */}
      <div className="flex items-center gap-4 mb-10 pb-4 border-b border-stone-200/60">
        <Link 
          href="/admin/orders" 
          className="w-10 h-10 flex items-center justify-center border border-stone-200 bg-white hover:bg-stone-50 transition-colors rounded-lg"
        >
          <ArrowLeft className="w-4 h-4 text-stone-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight">Order Details</h1>
          <p className="text-xs text-stone-500 uppercase font-semibold mt-1 tracking-wider">Invoice: {order.invoiceNumber || "N/A"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Content (8 Columns) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Design Information Card */}
          <div className="bg-white border border-stone-200 rounded-lg p-6 md:p-8 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-6 pb-2 border-b border-stone-200">
              Design Information
            </h2>
            <div className="flex items-center gap-4">
              {primaryImage ? (
                <div className="w-24 h-18 rounded-lg overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={primaryImage.url} alt={order.design.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-18 rounded-lg shrink-0 bg-stone-50 border border-stone-200 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-stone-300 stroke-1" />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-serif font-semibold text-sm text-slate-900 truncate mb-1">{order.design.title}</h3>
                <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider mb-2">{order.design.category} • {order.design.bhk} BHK</p>
                <Link 
                  href={`/admin/designs/${order.design.id}/edit`} 
                  className="text-xs font-bold uppercase tracking-widest text-[#b89047] hover:text-slate-900 transition-colors inline-block"
                >
                  View in Catalog &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white border border-stone-200 rounded-lg p-6 md:p-8 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-6 pb-2 border-b border-stone-200">
              Order Summary
            </h2>
            <div className="space-y-3 font-semibold text-xs uppercase tracking-wider text-stone-500">
              <div className="flex justify-between">
                <span>Design Price</span>
                <span className="text-slate-800 font-mono">{formatPrice(order.amountInr)}</span>
              </div>
              <div className="flex justify-between items-end font-serif font-bold text-slate-900 pt-4 border-t border-stone-200">
                <span className="text-xs uppercase tracking-widest text-slate-900 font-semibold font-sans">Total Amount</span>
                <span className="text-lg">{formatPrice(order.amountInr)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info (4 Columns) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Status Box */}
          <div className="bg-stone-50/50 border border-stone-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-stone-200">
              Payment Status
            </h2>
            <div className="flex items-center gap-3 mb-4">
              {order.status === "PENDING" ? (
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-200">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
              ) : order.status === "PAID" ? (
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-250/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center border border-rose-250/20">
                  <FileText className="w-4 h-4 text-rose-600" />
                </div>
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-900">{order.status}</p>
                <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">
                  {new Date(order.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            {order.status === "PENDING" && (
              <div className="text-[10px] bg-amber-50 border border-amber-250/20 text-amber-900 p-4 rounded-lg leading-relaxed">
                Awaiting client callback or webhook capturing. Use the public order link to run simulated payment verification.
              </div>
            )}
            {order.status === "PAID" && (
              <div className="mt-4 pt-4 border-t border-stone-250/60 space-y-3 text-[10px] uppercase font-bold tracking-wider text-stone-500">
                <div>
                  <span className="block text-stone-400 font-semibold text-[9px] mb-0.5">Razorpay Order ID</span>
                  <span className="text-slate-900 font-mono">{order.razorpayOrderId}</span>
                </div>
                <div>
                  <span className="block text-stone-400 font-semibold text-[9px] mb-0.5">Razorpay Payment ID</span>
                  <span className="text-slate-900 font-mono">{order.razorpayPaymentId || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-stone-400 font-semibold text-[9px] mb-0.5">Payment Date</span>
                  <span className="text-slate-800">{new Date(order.createdAt).toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}
          </div>

          {/* Customer Details Box */}
          <div className="bg-stone-50/50 border border-stone-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-stone-200">
              Customer Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-900">{order.user?.name || "Guest Checkout"}</p>
                  <p className="text-xs font-medium text-stone-500 mt-1">{order.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
