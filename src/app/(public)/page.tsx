import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Ruler, ShieldCheck, FileDown, ArrowRight, LayoutDashboard, Cuboid, Check, Star, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Morya Designs | Premium Architectural House Plans",
  description: "Discover professionally designed house plans, Vastu-friendly layouts, 3D elevations, and architectural drawings — all in one place.",
};

export const dynamic = "force-dynamic";

type FeaturedDesign = Prisma.DesignGetPayload<{
  include: { images: true };
}>;

export default async function HomePage() {
  // Fetch Featured Designs (up to 3 latest published)
  // try/catch guards against Neon idle-connection timeouts during build
  let featuredDesigns: FeaturedDesign[] = [];

  try {
    featuredDesigns = await prisma.design.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });
  } catch (e) {
    console.warn("[HomePage] DB fetch failed, rendering with empty designs:", e);
  }


  return (
    <div className="flex flex-col relative w-full bg-[#FAF9F6] text-slate-900 antialiased font-sans">
      
      {/* ------------------------------------------------------------------ */}
      {/* 2. HERO SECTION */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative pt-16 pb-16 overflow-hidden border-b border-stone-200 bg-[#FAF9F6]">
        {/* Subtle structural grid line background overlay */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Side: Content */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Eyebrow */}
              <span className="text-xs font-bold tracking-[0.25em] text-[#b89047] uppercase mb-4 block">
                MORYA DESIGN FIRM
              </span>
              
              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal text-slate-900 leading-[1.1] mb-6 tracking-tight">
                DESIGN YOUR<br />
                <span className="text-[#b89047] font-semibold">DREAM HOME</span><br />
                WITH CONFIDENCE.
              </h1>
              
              {/* Description */}
              <p className="text-base text-slate-650 leading-relaxed max-w-xl mb-8 font-sans">
                Discover professionally designed house plans, Vastu-friendly layouts, 3D elevations, and architectural drawings — all in one place.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-8">
                <Link 
                  href="/designs" 
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 rounded-lg border border-slate-900"
                >
                  Explore House Designs <ArrowRight className="w-4 h-4 text-[#b89047]" />
                </Link>
                <Link 
                  href="#how-it-works" 
                  className="w-full sm:w-auto px-8 py-4 bg-white border border-stone-300 hover:border-slate-800 hover:bg-stone-50 text-slate-900 text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center rounded-lg shadow-sm"
                >
                  View How It Works
                </Link>
              </div>

              {/* Small Trust Indicators */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#b89047]" /> Professional Designs
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#b89047]" /> Vastu-Friendly
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#b89047]" /> Digital Delivery
                </span>
              </div>
            </div>

            {/* Right Side: Large Architectural Image Area */}
            <div className="lg:col-span-5 relative w-full flex justify-center">
              <div className="relative w-full max-w-[450px] aspect-[4/5] bg-stone-100 border border-stone-200 rounded-[16px] overflow-hidden shadow-lg group">
                {/* Visual Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                  alt="Modern architectural Villa facade design" 
                  className="w-full h-full object-cover transform scale-101 group-hover:scale-103 transition-transform duration-700 ease-out"
                />
                
                {/* Subtle dark gradient overlay to protect card visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none"></div>

                {/* Floating Information Card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-lg border border-stone-150/80 shadow-md flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[9px] font-bold text-[#b89047] uppercase tracking-widest block mb-0.5">FEATURED DESIGN</span>
                      <h3 className="font-serif font-bold text-sm text-slate-900">Modern 3BHK Villa</h3>
                    </div>
                    <span className="font-serif font-bold text-sm text-slate-900">₹15,000</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-2">
                    <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Plot: 40 × 60 ft</span>
                    <Link 
                      href="/designs/modern-3bhk-villa" 
                      className="text-[10px] font-bold uppercase tracking-widest text-[#b89047] hover:text-slate-900 transition-colors flex items-center gap-1"
                    >
                      View Design <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. TRUST / STATS STRIP */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-10 bg-white border-b border-stone-200 relative z-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 items-center">
            
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="font-serif text-3xl font-bold text-slate-900 mb-1">50+</span>
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">HOUSE DESIGNS</span>
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="font-serif text-3xl font-bold text-slate-900 mb-1">VASTU</span>
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">FRIENDLY OPTIONS</span>
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="font-serif text-3xl font-bold text-slate-900 mb-1">3D</span>
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">ELEVATIONS</span>
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="font-serif text-3xl font-bold text-slate-900 mb-1">DIGITAL</span>
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">DELIVERY</span>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. FEATURED HOUSE DESIGNS */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 bg-[#FAF9F6] border-b border-stone-200">
        <div className="max-w-[1200px] mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-3">Portfolio Highlights</span>
            <h2 className="text-3xl md:text-4xl font-serif text-slate-900 font-normal tracking-tight mb-3">Featured House Designs</h2>
            <p className="text-xs text-stone-500 leading-relaxed uppercase font-semibold tracking-wider">
              Explore professionally designed house plans created for modern Indian homes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch mb-16">
            {featuredDesigns.map((design) => {
              const primaryImage = design.images[0];
              return (
                <div 
                  key={design.id} 
                  className="group bg-white border border-stone-200 overflow-hidden hover:border-[#b89047]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full rounded-lg"
                >
                  <Link href={`/designs/${design.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-stone-100 border-b border-stone-200 rounded-t-lg">
                    {primaryImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={primaryImage.url} 
                        alt={design.title} 
                        className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <FileDown className="w-10 h-10 stroke-1" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 z-10">
                      <Badge variant="secondary" className="bg-slate-900/90 text-white border-none rounded-md text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1">
                        {design.category}
                      </Badge>
                    </div>
                  </Link>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-semibold tracking-wider uppercase text-[#b89047]">{design.facing} Facing</span>
                      <span className="text-xs font-medium text-stone-500">{design.plotWidthFt}×{design.plotLengthFt} ft Plot</span>
                    </div>
                    
                    <Link href={`/designs/${design.slug}`} className="block mb-4">
                      <h3 className="text-base font-serif font-semibold text-slate-900 group-hover:text-[#b89047] transition-colors line-clamp-2 min-h-[44px]">
                        {design.title}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center gap-4 text-xs font-medium text-stone-500 uppercase tracking-wider mb-6">
                      <span>{design.bhk} BHK</span>
                      <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                      <span>{design.floors} {design.floors > 1 ? "Floors" : "Floor"}</span>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-stone-400">Fixed Price</span>
                        <span className="font-serif font-bold text-base text-slate-900">{formatPrice(design.priceInr)}</span>
                      </div>
                      <Link 
                        href={`/designs/${design.slug}`}
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

          <div className="text-center">
            <Link 
              href="/designs" 
              className="inline-flex items-center justify-center px-8 py-4 text-xs font-semibold tracking-widest uppercase text-slate-900 border border-stone-300 hover:border-slate-900 transition-colors bg-white rounded-lg shadow-sm"
            >
              View All Designs &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 6. WHY CHOOSE MORYA DESIGNS */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-[1200px] mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-3">Studio Philosophy</span>
            <h2 className="text-3xl md:text-4xl font-serif text-slate-900 font-normal tracking-tight mb-3">WHY CHOOSE MORYA DESIGNS?</h2>
            <p className="text-xs text-stone-500 leading-relaxed uppercase font-semibold tracking-wider">
              Everything you need to move from idea to construction-ready planning.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                num: "01",
                title: "PROFESSIONAL DESIGNS",
                description: "Carefully designed architectural plans for modern homes.",
                icon: LayoutDashboard
              },
              {
                num: "02",
                title: "VASTU-FRIENDLY",
                description: "Layouts designed with Vastu principles in mind.",
                icon: ShieldCheck
              },
              {
                num: "03",
                title: "MULTIPLE OPTIONS",
                description: "Choose from different plot sizes, BHK configurations, and styles.",
                icon: Cuboid
              },
              {
                num: "04",
                title: "DIGITAL ACCESS",
                description: "Purchase and access your architectural files digitally.",
                icon: FileDown
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="bg-stone-50/40 p-8 border border-stone-200/50 hover:border-[#b89047]/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between rounded-lg group"
              >
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-serif text-2xl font-semibold text-[#b89047]/65">{feature.num}</span>
                    <feature.icon className="w-5 h-5 text-stone-400 group-hover:text-[#b89047] transition-colors" />
                  </div>
                  <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase mb-3">{feature.title}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 7. HOW IT WORKS */}
      {/* ------------------------------------------------------------------ */}
      <section id="how-it-works" className="py-20 bg-[#FAF9F6] border-b border-stone-200 scroll-mt-[72px]">
        <div className="max-w-[1200px] mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-3">Process</span>
            <h2 className="text-3xl md:text-4xl font-serif text-slate-900 font-normal tracking-tight mb-3">HOW IT WORKS</h2>
            <p className="text-xs text-stone-500 leading-relaxed uppercase font-semibold tracking-wider">
              Find and purchase your ideal house plan in four simple steps.
            </p>
          </div>

          <div className="relative">
            {/* Desktop timeline horizontal connecting line */}
            <div className="hidden md:block absolute top-[28px] left-[12%] right-[12%] h-[1px] bg-stone-200 -z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "BROWSE",
                  description: "Explore house plans based on your requirements."
                },
                {
                  step: "02",
                  title: "COMPARE",
                  description: "Compare plot size, BHK, facing, price and design details."
                },
                {
                  step: "03",
                  title: "PURCHASE",
                  description: "Select your preferred design and complete checkout."
                },
                {
                  step: "04",
                  title: "DOWNLOAD",
                  description: "Access your purchased architectural files digitally."
                }
              ].map((step, i) => (
                <div key={i} className="relative z-10 flex flex-col md:items-center text-left md:text-center group p-5 md:p-0 bg-white md:bg-transparent border md:border-none border-stone-200 rounded-lg">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-lg flex items-center justify-center text-xs font-bold tracking-widest font-mono mb-6 transition-all duration-300 border border-slate-800 mx-0 md:mx-auto group-hover:bg-[#b89047] group-hover:border-[#b89047]">
                    {step.step}
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 tracking-[0.15em] uppercase mb-3">{step.step} — {step.title}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed max-w-[200px] md:mx-auto">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 8. FINAL CALL TO ACTION */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        {/* Subtle grid background for the dark CTA section */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        
        <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-4">Start Planning Today</span>
          <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight mb-4 uppercase">
            READY TO PLAN YOUR DREAM HOME?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed mb-8">
            Find the right architectural design for your plot, lifestyle, and vision.
          </p>
          <Link 
            href="/designs" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#b89047] hover:bg-[#c5a880] text-slate-950 text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-lg shadow-md"
          >
            EXPLORE HOUSE DESIGNS <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

    </div>
  );
}
