import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDesignBySlug } from "@/modules/catalog/queries";
import { ImageGallery } from "./ImageGallery";
import { ProductActions } from "./ProductActions";
import { CustomerReviews } from "./CustomerReviews";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck, Download, ChevronRight, Lock, Clock, HeadphonesIcon, ArrowRight, FileDown, Compass, FileCheck } from "lucide-react";
import Script from "next/script";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const design = await getDesignBySlug(params.slug);

  if (!design) {
    return { title: "Design Not Found" };
  }

  const desc = design.description || `Buy ${design.plotWidthFt}x${design.plotLengthFt} sqft house design. ${design.bhk} BHK, ${design.facing} facing.`;

  return {
    title: `${design.title} - House Design | Morya Design Firm`,
    description: desc,
    openGraph: {
      title: design.title,
      description: desc,
      images: design.images.length > 0 ? [design.images[0].url] : [],
    },
  };
}

export default async function DesignDetailPage(props: PageProps) {
  const params = await props.params;
  const design = await getDesignBySlug(params.slug);

  if (!design) {
    notFound();
  }

  // Fetch related designs (same category or facing, excluding current)
  const relatedDesigns = await prisma.design.findMany({
    where: { 
      status: "PUBLISHED", 
      id: { not: design.id },
      OR: [
        { category: design.category },
        { facing: design.facing }
      ]
    },
    take: 3,
    include: {
      images: {
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: design.title,
    image: design.images.map((img) => img.url),
    description: design.description,
    offers: {
      "@type": "Offer",
      price: design.priceInr,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };

  const deliverableLabels: Record<string, string> = {
    DWG: "Architectural Floor Plan (DWG CAD)",
    PDF: "PDF Documentation & Floor Plan",
    THREE_D: "3D View / Front Elevation",
  };

  // Inspect database features dynamically
  const isVastu = design.styleTags.some(tag => tag.toLowerCase().includes("vastu"));
  const hasThreeD = design.files.some(f => f.fileType === "THREE_D");
  const hasStructural = design.files.some(f => f.fileType === "DWG");
  const fileFormatsList = design.files.map(f => f.fileType).join(", ") || "PDF, DWG";

  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="mx-auto max-w-[1200px] px-6 py-12 bg-[#FAF9F6] text-slate-800 antialiased font-sans">
        
        {/* Breadcrumb */}
        <div className="flex flex-col gap-3 mb-8 pb-4 border-b border-stone-200">
          <Link href="/designs" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-[#b89047] hover:text-slate-900 transition-colors w-fit">
            &larr; Back to Designs
          </Link>
          <div className="flex items-center text-xs text-stone-500 font-semibold uppercase tracking-wider">
            <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-stone-400" />
            <Link href="/designs" className="hover:text-slate-800 transition-colors">Designs</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-stone-400" />
            <span className="text-slate-900 line-clamp-1">{design.title}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Image Gallery & Description */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Gallery Wrapper */}
            <div className="bg-white rounded-lg border border-stone-200 p-2 shadow-sm">
              <ImageGallery images={design.images} />
            </div>
            
            {/* Description */}
            <section className="bg-white rounded-lg border border-stone-200 p-8 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6 pb-2 border-b border-stone-150">
                About This Design
              </h2>
              <div className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap">
                {design.description || "A premium architectural house plan tailored for modern living."}
              </div>
            </section>

            {/* Specifications */}
            <section className="bg-white rounded-lg border border-stone-200 p-8 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6 pb-2 border-b border-stone-150">
                Specifications &amp; Features
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {[
                  { label: "Plot Size", val: `${design.plotWidthFt} Ã— ${design.plotLengthFt} ft` },
                  { label: "Plot Area", val: `${design.plotAreaSqft.toLocaleString()} sq.ft` },
                  { label: "Built-up Area", val: `${design.builtUpAreaSqft.toLocaleString()} sq.ft` },
                  { label: "Bedrooms", val: `${design.bhk} BHK` },
                  { label: "Floors", val: `${design.floors}` },
                  {
                    label: "Facing",
                    val: design.facing === 'N' ? 'North' : design.facing === 'S' ? 'South' : design.facing === 'E' ? 'East' : 'West'
                  },
                  { label: "Category", val: design.category },
                  { label: "Vastu Compliant", val: isVastu ? "Yes (Vastu Standard)" : "Vastu Friendly" },
                  { label: "3D Elevation", val: hasThreeD ? "Available" : "On Request" },
                  { label: "Structural Drawings", val: hasStructural ? "Included" : "On Request" },
                  { label: "File Formats", val: fileFormatsList },
                  { label: "Style Tags", val: design.styleTags.join(', ') || "Modern" }
                ].map((spec, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">{spec.label}</span>
                    <span className="text-xs font-semibold text-slate-900">{spec.val}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Buy Options */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              
              {/* Checkout Info Box */}
              <div className="bg-white rounded-lg border border-stone-200 p-8 shadow-sm">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#b89047] uppercase block mb-3">Instant Blueprint Access</span>
                <h1 className="text-2xl font-serif font-bold text-slate-900 leading-tight mb-4">{design.title}</h1>
                
                {/* Spec badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-none rounded-md text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
                    {design.bhk} BHK
                  </Badge>
                  <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-none rounded-md text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
                    {design.facing === 'N' ? 'North' : design.facing === 'S' ? 'South' : design.facing === 'E' ? 'East' : 'West'} Facing
                  </Badge>
                  <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-none rounded-md text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
                    {design.floors} Floor{design.floors > 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="mb-6 pt-4 border-t border-stone-100">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Fixed Price</span>
                  <div className="text-3xl font-bold text-slate-900">
                    {formatPrice(design.priceInr)}
                  </div>
                </div>

                {/* Purchase Actions (Wishlist + Cart + Buy Now) */}
                <ProductActions 
                  designId={design.id}
                  designSlug={design.slug}
                  priceInr={design.priceInr}
                />

                <div className="mt-6 flex flex-col gap-3 pt-6 border-t border-stone-100">
                  <div className="flex items-center gap-2.5 text-stone-600 text-xs font-semibold uppercase tracking-wider">
                    <Lock className="w-4 h-4 text-emerald-600 shrink-0" /> Secure Checkout
                  </div>
                  <div className="flex items-center gap-2.5 text-stone-600 text-xs font-semibold uppercase tracking-wider">
                    <Download className="w-4 h-4 text-[#b89047] shrink-0" /> Instant Digital Delivery
                  </div>
                  <div className="flex items-center gap-2.5 text-stone-600 text-xs font-semibold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0" /> Premium Architecture Quality
                  </div>
                </div>
              </div>

              {/* What's Included Card */}
              <div className="bg-stone-50/50 rounded-lg border border-stone-200 p-8 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-stone-200">
                  What&apos;s Included
                </h3>
                <ul className="space-y-3.5">
                  {design.files.length > 0 ? (
                    design.files.map((file) => (
                      <li key={file.fileType} className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-[#b89047] shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                          {deliverableLabels[file.fileType] || file.fileType}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-stone-400 font-medium italic text-xs uppercase tracking-wider">
                      Digital deliverables will be available after purchase.
                    </li>
                  )}
                </ul>
                <div className="mt-6">
                  <button className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white hover:bg-stone-100 text-slate-800 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors border border-stone-200 shadow-sm">
                    <FileDown className="w-4 h-4 text-[#b89047]" /> View Sample Blueprint (Watermarked)
                  </button>
                </div>
                </div>
                {/* Trust Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-stone-200 rounded-lg p-4 flex flex-col items-center justify-center text-center gap-2">
                  <Clock className="w-5 h-5 text-stone-450" />
                  <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Instant Access</span>
                </div>
                <div className="bg-white border border-stone-200 rounded-lg p-4 flex flex-col items-center justify-center text-center gap-2">
                  <HeadphonesIcon className="w-5 h-5 text-stone-450" />
                  <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Support</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <CustomerReviews />

        {/* Related Designs */}
        {relatedDesigns.length > 0 && (
          <div className="mt-20 pt-12 border-t border-stone-200">
            <div className="mb-10 text-left">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#b89047] uppercase block mb-1">More Like This</span>
              <h2 className="text-2xl font-serif text-slate-900 font-normal tracking-tight">Related Designs</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {relatedDesigns.map((relDesign) => {
                const primaryImage = relDesign.images[0];
                return (
                  <div 
                    key={relDesign.id} 
                    className="group bg-white border border-stone-200 overflow-hidden hover:border-[#b89047]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full rounded-lg"
                  >
                    <Link href={`/designs/${relDesign.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-stone-100 border-b border-stone-200 rounded-t-lg">
                      {primaryImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                          src={primaryImage.url} 
                          alt={relDesign.title} 
                          className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <FileDown className="w-10 h-10 stroke-1" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 z-10">
                        <Badge variant="secondary" className="bg-slate-900/90 text-white border-none rounded-md text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1">
                          {relDesign.category}
                        </Badge>
                      </div>
                    </Link>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold tracking-wider uppercase text-[#b89047]">{relDesign.facing} Facing</span>
                        <span className="text-xs font-medium text-stone-500">{relDesign.plotWidthFt}Ã—{relDesign.plotLengthFt} ft Plot</span>
                      </div>
                      
                      <Link href={`/designs/${relDesign.slug}`} className="block mb-4">
                        <h3 className="text-base font-serif font-semibold text-slate-900 group-hover:text-[#b89047] transition-colors line-clamp-2 min-h-[44px] rounded-lg">
                          {relDesign.title}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center gap-4 text-xs font-medium text-stone-500 uppercase tracking-wider mb-6">
                        <span>{relDesign.bhk} BHK</span>
                        <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                        <span>{relDesign.floors} {relDesign.floors > 1 ? "Floors" : "Floor"}</span>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-stone-400">Fixed Price</span>
                          <span className="font-serif font-bold text-base text-slate-900">{formatPrice(relDesign.priceInr)}</span>
                        </div>
                        <Link 
                          href={`/designs/${relDesign.slug}`}
                          className="text-xs font-semibold tracking-widest uppercase text-slate-950 hover:text-[#b89047] transition-colors flex items-center gap-1.5"
                        >
                          View Details <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
