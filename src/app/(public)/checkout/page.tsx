import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { CheckoutClient } from "./CheckoutClient";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/format";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CheckoutPage(props: PageProps) {
  const session = await auth();

  // 1. Ensure customer is authenticated before checkout
  if (!session?.user?.email) {
    const searchParams = await props.searchParams;
    const redirectParams = new URLSearchParams();
    if (typeof searchParams.design === "string") {
      redirectParams.set("design", searchParams.design);
    }
    if (typeof searchParams.designs === "string") {
      redirectParams.set("designs", searchParams.designs);
    }
    redirect(`/login?callbackUrl=/checkout?${redirectParams.toString()}`);
  }

  const searchParams = await props.searchParams;
  const slug = typeof searchParams.design === "string" ? searchParams.design : null;
  const designsParam = typeof searchParams.designs === "string" ? searchParams.designs : null;

  let selectedDesigns: any[] = [];

  if (slug) {
    const singleDesign = await prisma.design.findUnique({
      where: { slug, status: "PUBLISHED" },
      include: { images: true }
    });
    if (singleDesign) {
      selectedDesigns = [singleDesign];
    }
  } else if (designsParam) {
    const ids = designsParam.split(",").filter(Boolean);
    selectedDesigns = await prisma.design.findMany({
      where: { id: { in: ids }, status: "PUBLISHED" },
      include: { images: true }
    });
  }

  if (selectedDesigns.length === 0) {
    notFound();
  }

  const subtotal = selectedDesigns.reduce((acc, item) => acc + item.priceInr, 0);

  // Fetch logged in customer phone number if available
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { phone: true, name: true }
  });

  const initialUser = {
    name: dbUser?.name || session.user.name || "",
    email: session.user.email,
    phone: dbUser?.phone || "",
  };

  return (
    <div className="bg-[#FAF9F6] py-16 text-slate-800 antialiased font-sans min-h-[85vh] relative overflow-hidden">
      
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-stone-100 to-transparent pointer-events-none -z-10" />

      <div className="mx-auto max-w-[1100px] px-6">
        
        {/* Back Link */}
        <Link 
          href="/designs" 
          className="inline-flex items-center text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Back to Designs
        </Link>
        
        {/* Title */}
        <div className="mb-12 pb-6 border-b border-stone-200 flex items-end justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#b89047] uppercase block mb-2">Secure Payment</span>
            <h1 className="text-3xl md:text-4xl font-serif text-slate-900 font-bold tracking-tight">Checkout</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-white border border-stone-200 px-4 py-2 rounded-lg shadow-sm">
            <Lock className="w-3 h-3 text-[#b89047]" /> SSL Encrypted
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Order Summary (5 columns on desktop) */}
          <div className="lg:col-span-5 w-full order-2 lg:order-1">
            <div className="bg-white rounded-[24px] border border-stone-200/60 p-8 shadow-lg shadow-stone-200/50 sticky top-24">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 pb-4 border-b border-stone-150 mb-6">
                Order Summary
              </h2>
              
              <div className="space-y-5">
                {selectedDesigns.map((design) => {
                  const primaryImage = design.images.find((img: any) => img.isPrimary) || design.images[0];
                  return (
                    <div key={design.id} className="flex gap-4 pb-5 border-b border-stone-100 last:border-0 last:pb-0">
                      {primaryImage && (
                        <div className="w-[84px] h-[64px] rounded-xl overflow-hidden shrink-0 bg-stone-50 border border-stone-200/60 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={primaryImage.url} alt={design.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <h3 className="font-serif font-bold text-sm text-slate-900 truncate mb-1">{design.title}</h3>
                        <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider mb-1.5">
                          {design.category} &bull; {design.bhk} BHK &bull; {design.facing} Facing
                        </p>
                        <span className="text-xs font-bold text-[#b89047] font-mono tracking-tight">{formatPrice(design.priceInr)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="border-t border-stone-150 mt-6 pt-5 space-y-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                <div className="flex justify-between items-center">
                  <span>Design Subtotal</span>
                  <span className="text-slate-800 font-mono text-[11px]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Taxes &amp; Fees</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[9px]">Included</span>
                </div>
              </div>

              <div className="border-t border-stone-150 mt-5 pt-5 flex justify-between items-end font-serif font-bold text-slate-900">
                <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold font-sans">Total Amount</span>
                <span className="text-2xl tracking-tight">{formatPrice(subtotal)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form (7 columns on desktop) */}
          <div className="lg:col-span-7 w-full order-1 lg:order-2">
            <div className="bg-white rounded-[24px] border border-stone-200/60 p-8 md:p-10 shadow-lg shadow-stone-200/50">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 mb-8 pb-4 border-b border-stone-150">
                Customer Information
              </h2>
              <CheckoutClient 
                designIds={selectedDesigns.map(d => d.id)} 
                initialUser={initialUser}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
