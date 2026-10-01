import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/format";

export default async function CustomerOrdersPage() {
  const session = await auth();

  if (!session?.user?.email) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-20 text-center bg-[#FAF9F6] text-slate-800">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-3">Unauthorized</span>
        <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight mb-4">Please Log In</h1>
        <p className="text-sm text-stone-500 mb-8 max-w-md mx-auto">You must be logged in to view your orders.</p>
        <Link 
          href="/login" 
          className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-widest uppercase transition-colors rounded-lg"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { email: session.user.email },
    include: {
      design: {
        include: { images: { where: { isPrimary: true }, take: 1 } }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-20 text-center bg-[#FAF9F6] text-slate-800">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-3">Dashboard</span>
        <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight mb-4">My Orders</h1>
        <p className="text-sm text-stone-500 mb-8 max-w-md mx-auto leading-relaxed">
          You haven&apos;t purchased any designs yet. Explore our portfolio to find your house plan.
        </p>
        <Link 
          href="/designs" 
          className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 hover:bg-slate-800 text-[#b89047] text-xs font-bold tracking-widest uppercase transition-colors rounded-lg border border-slate-900 shadow-md"
        >
          Browse House Designs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 min-h-[60vh] bg-[#FAF9F6] text-slate-800 antialiased font-sans">
      <div className="mb-8 pb-4 border-b border-stone-200">
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#b89047] uppercase block mb-1">Customer Area</span>
        <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight">My Orders</h1>
        <p className="text-xs text-stone-500 mt-1 uppercase font-semibold tracking-wider">
          Manage your architectural design purchases and downloads
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const primaryImage = order.design.images[0];
          
          return (
            <Link key={order.id} href={`/account/orders/${order.id}`} className="block group">
              <div className="bg-white border border-stone-200 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:border-[#b89047]/40 hover:shadow-md transition-all duration-300">
                {/* Image */}
                {primaryImage ? (
                  <div className="w-full sm:w-28 h-20 overflow-hidden shrink-0 bg-stone-100 border border-stone-200 rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={primaryImage.url} 
                      alt={order.design.title} 
                      className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500" 
                    />
                  </div>
                ) : (
                  <div className="w-full sm:w-28 h-20 shrink-0 bg-stone-50 border border-stone-200 flex items-center justify-center rounded-lg">
                    <FileText className="w-6 h-6 text-stone-400 stroke-1" />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-[#b89047] transition-colors truncate">
                      {order.design.title}
                    </h3>
                    {(() => {
                      const isFullyPaid = order.status === "PAID" || order.status === "PROCESSING" || order.status === "READY" || order.status === "COMPLETED";
                      const isFailed = order.status === "FAILED" || order.status === "CANCELLED" || order.status === "REFUNDED";
                      return (
                        <Badge variant="outline" className={`shrink-0 uppercase text-[9px] tracking-wider rounded-md font-semibold px-2 py-0.5 ${
                          isFullyPaid 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-250/20" 
                            : isFailed
                            ? "bg-rose-50 text-rose-800 border-rose-250/20"
                            : "bg-amber-50 text-amber-800 border-amber-250/20"
                        }`}>
                          {order.status.replace("_", " ")}
                        </Badge>
                      );
                    })()}
                  </div>
                  
                  <p className="text-xs text-stone-400 font-mono">
                    Order ID: #{order.invoiceNumber || order.id.slice(0, 8).toUpperCase()} &bull; {new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-bold text-slate-900">
                      {formatPrice(order.amountInr)}
                    </span>
                    <span className="text-xs font-semibold tracking-wider uppercase text-slate-950 flex items-center gap-1">
                      {(() => {
                        const isFullyPaid = order.status === "PAID" || order.status === "PROCESSING" || order.status === "READY" || order.status === "COMPLETED";
                        const isFailed = order.status === "FAILED" || order.status === "CANCELLED" || order.status === "REFUNDED";
                        if (isFullyPaid) return "View Order & Download";
                        if (isFailed) return "View Details";
                        return "View Order & Pay";
                      })()} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
