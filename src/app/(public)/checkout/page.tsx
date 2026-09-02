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
    <div className="bg-[#FAF9F6] py-12 text-slate-800 antialiased font-sans min-h-[80vh]">
      <div className="mx-auto max-w-[1200px] px-6">
        
        {/* Back Link */}
        <Link 
          href="/designs" 
          className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-[#b89047] hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Designs
        </Link>
        
        {/* Title */}
        <div className="mb-10 pb-4 border-b border-stone-200">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#b89047] uppercase block mb-1">Secure checkout</span>
          <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Order Summary (5 columns on desktop) */}
          <div className="lg:col-span-5 bg-white rounded-lg border border-stone-200 p-6 h-fit shadow-sm space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-stone-100">
              Order Summary
            </h2>
            
            <div className="space-y-4">
              {selectedDesigns.map((design) => {
                const primaryImage = design.images.find((img: any) => img.isPrimary) || design.images[0];
                return (
                  <div key={design.id} className="flex gap-4 pb-4 border-b border-stone-100 last:border-0 last:pb-0">
                    {primaryImage && (
                      <div className="w-20 h-15 rounded-lg overflow-hidden shrink-0 bg-stone-50 border border-stone-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={primaryImage.url} alt={design.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif font-bold text-xs text-slate-900 truncate mb-1">{design.title}</h3>
                      <p className="text-[9px] text-stone-500 font-semibold uppercase tracking-wider mb-0.5">
                        {design.category} &bull; {design.bhk} BHK &bull; {design.facing} Facing
                      </p>
                      <span className="text-[10px] font-bold text-slate-900">{formatPrice(design.priceInr)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="border-t border-stone-100 pt-4 space-y-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              <div className="flex justify-between">
                <span>Design Subtotal</span>
                <span className="text-slate-800 font-mono">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes &amp; Fees</span>
                <span className="text-slate-800">Included</span>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-4 flex justify-between items-end font-serif font-bold text-slate-900">
              <span className="text-xs uppercase tracking-widest text-slate-900 font-semibold font-sans">Total Amount</span>
              <span className="text-lg">{formatPrice(subtotal)}</span>
            </div>
          </div>

          {/* Checkout Form (7 columns on desktop) */}
          <div className="lg:col-span-7 bg-white rounded-lg border border-stone-200 p-8 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-6 pb-2 border-b border-stone-100">
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
  );
}
