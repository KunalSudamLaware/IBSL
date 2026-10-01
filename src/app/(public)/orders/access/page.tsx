import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyOrderAccessToken, generateDownloadToken } from "@/lib/tokens";
import { buttonVariants } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

type PageProps = {
  searchParams: Promise<{ token: string | undefined }>;
}

export default async function GuestOrderAccessPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;
  
  if (!token) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center bg-white text-slate-800 font-sans">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-3">Security Alert</span>
        <h1 className="text-3xl font-serif text-slate-900 font-normal mb-2">Missing Access Token</h1>
        <p className="text-sm text-stone-500 mb-6">Please use the secure link provided in your order email.</p>
      </div>
    );
  }

  const tokenData = verifyOrderAccessToken(token);
  if (!tokenData) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center bg-white text-slate-800">
        <span className="text-[10px] font-bold tracking-[0.25em] text-rose-600 uppercase block mb-3">Expired Link</span>
        <h1 className="text-3xl font-serif text-slate-900 font-normal mb-2">Link Expired or Invalid</h1>
        <p className="text-sm text-stone-500 mb-8 max-w-md mx-auto">This magic link has expired for your security. Please log in to your account to access your downloads.</p>
        <a 
          href="/login" 
          className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 hover:bg-slate-800 text-[#b89047] text-xs font-bold tracking-widest uppercase transition-colors rounded-lg"
        >
          Log In to Account
        </a>
      </div>
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: tokenData.orderId, status: "PAID" },
    include: {
      design: {
        include: { files: true }
      }
    }
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 bg-white text-slate-800">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-stone-200/60">
        <div>
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#b89047] uppercase block mb-1">Downloads Portal</span>
          <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight">Your Order Access</h1>
          <p className="text-xs text-stone-550 mt-1 uppercase font-semibold tracking-wider font-mono">
            Order #{order.invoiceNumber} • Paid on {order.createdAt.toLocaleDateString("en-IN")}
          </p>
        </div>
        <a 
          href={`/api/orders/${order.id}/invoice`} 
          className={buttonVariants({ variant: "outline", className: "shrink-0 gap-2 text-xs font-bold tracking-widest uppercase rounded-lg border-stone-300 hover:bg-stone-50 h-11" })}
        >
          <FileText className="w-4 h-4 text-[#b89047]" />
          Download Invoice
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Card: Design Summary (4 Columns) */}
        <div className="lg:col-span-4 bg-stone-50/50 rounded-lg border border-stone-200 p-6 h-fit shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-stone-200">
            Design Summary
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Design Title</p>
              <p className="text-sm font-bold text-slate-900">{order.design.title}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#b89047] uppercase tracking-widest mb-1">Category</p>
              <Badge variant="secondary" className="bg-slate-900/90 text-white border-none rounded-md text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1 mt-0.5">
                {order.design.category}
              </Badge>
            </div>
            <div className="pt-4 border-t border-stone-200/80">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Total Paid</p>
              <p className="text-xl font-bold font-serif text-slate-900">{formatPrice(order.amountInr)}</p>
            </div>
          </div>
        </div>

        {/* Right Content: Deliverables list (8 Columns) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-stone-200 p-8 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">Deliverables</h2>
          <p className="text-xs text-stone-500 uppercase font-semibold tracking-wider mb-6 pb-2 border-b border-stone-200">
            Click below to securely download your purchased architectural files
          </p>
          
          <div className="space-y-4">
            {order.design.files.map(file => {
              // Generate a fresh 15-minute secure download token for each file
              const downloadToken = generateDownloadToken(order.id, file.id, 15);
              const isCAD = file.fileType === "DWG";
              
              return (
                <div 
                  key={file.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-stone-200 rounded-lg gap-4 bg-stone-50/20 hover:border-[#b89047]/30 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center border border-stone-200 bg-white text-slate-500 group-hover:text-[#b89047] rounded-lg transition-colors">
                      <FileText className="w-5 h-5 stroke-1" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-900">{file.fileType} Format File</p>
                      <p className="text-[10px] text-stone-400 font-semibold tracking-wider uppercase mt-0.5">Size: {(file.sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <a 
                    href={`/api/downloads/${downloadToken}`} 
                    className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold tracking-widest uppercase transition-all duration-300 rounded-lg border border-slate-900 gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-[#b89047]" />
                    Download {file.fileType}
                  </a>
                </div>
              );
            })}
            
            {order.design.files.length === 0 && (
              <p className="text-stone-400 font-semibold uppercase tracking-wider text-xs italic">
                No files are currently attached to this design.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
