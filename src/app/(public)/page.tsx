import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Ruler, ShieldCheck, FileDown, ArrowRight, LayoutDashboard, Cuboid, Check, Star, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { DesignCard } from "@/components/shared/DesignCard";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";

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
      {/* 2. HERO SECTION (UPGRADED) */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative pt-24 pb-28 md:pt-32 md:pb-36 overflow-hidden border-b border-stone-200 bg-gradient-to-b from-[#FAF9F6] to-white">
        {/* Subtle structural grid line background overlay */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Decorative background blurs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#b89047]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-900/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
            
            {/* Left Side: Content */}
            <div className="lg:col-span-6 flex flex-col items-start text-left animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm mb-6">
                <Star className="w-3.5 h-3.5 text-[#b89047] fill-[#b89047]" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-slate-800 uppercase">Premium Architecture</span>
              </div>
              
              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-slate-900 leading-[1.15] mb-6 tracking-tight">
                Find the perfect <br/>
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#b89047] font-semibold italic pr-2">house design</span>
                  <span className="absolute bottom-1.5 left-0 w-full h-3 bg-[#b89047]/10 -z-0 rounded-sm transform -rotate-1"></span>
                </span><br />
                for your family.
              </h1>
              
              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg mb-10 font-sans">
                Discover professionally crafted house plans, 3D elevations, and Vastu-compliant layouts designed to bring your dream home to life.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-10">
                <Link 
                  href="/designs" 
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/20 flex items-center justify-center gap-2 rounded-lg border border-slate-900 group"
                >
                  Explore Designs <ArrowRight className="w-4 h-4 text-[#b89047] group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="#how-it-works" 
                  className="w-full sm:w-auto px-8 py-4 bg-white border border-stone-200 hover:border-[#b89047]/50 hover:bg-stone-50 text-slate-800 text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center justify-center rounded-lg shadow-sm"
                >
                  Get Started
                </Link>
              </div>

              {/* Small Trust Indicators */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-600 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> 100% Ready-to-build
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Instant Download
                </span>
              </div>
            </div>

            {/* Right Side: Large Architectural Image Area */}
            <div className="lg:col-span-6 relative w-full flex justify-center lg:justify-end animate-in fade-in zoom-in-95 duration-1000 delay-200 fill-mode-both">
              <div className="relative w-full max-w-[500px] aspect-[4/5] sm:aspect-square lg:aspect-[4/5] bg-stone-100 rounded-[24px] overflow-hidden shadow-2xl group border border-white/50">
                
                {/* Visual Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                  alt="Modern architectural Villa facade design" 
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
                />
                
                {/* Gradient overlay for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none"></div>

                {/* Floating Architectural Details Badge (Top Right) */}
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-white shadow-xl transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                      <Ruler className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Dimension</p>
                      <p className="font-serif font-bold text-sm text-slate-900">40' × 60' ft</p>
                    </div>
                  </div>
                </div>

                {/* Main Floating Info Card (Bottom Left) */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-xl border border-white shadow-xl transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[9px] font-bold text-[#b89047] uppercase tracking-widest block mb-1">FEATURED PLAN</span>
                      <h3 className="font-serif font-bold text-lg text-slate-900">Modern 3BHK Villa</h3>
                    </div>
                    <span className="font-mono font-bold text-base text-slate-900 bg-stone-100 px-2 py-1 rounded-md">₹15,000</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-stone-100 mt-2">
                    <div className="flex gap-4 text-[10px] text-stone-600 font-bold uppercase tracking-wider">
                      <span>3 Beds</span>
                      <span className="w-1 h-1 bg-stone-300 rounded-full my-auto"></span>
                      <span>2 Baths</span>
                      <span className="w-1 h-1 bg-stone-300 rounded-full my-auto"></span>
                      <span>Vastu</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#b89047]/10 flex items-center justify-center group-hover:bg-[#b89047] transition-colors duration-300">
                      <ArrowRight className="w-4 h-4 text-[#b89047] group-hover:text-white transition-colors" />
                    </div>
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
      <section className="py-14 bg-white border-b border-stone-200 relative z-20 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 items-center divide-x-0 md:divide-x divide-stone-100">
            
            <ScrollReveal delay={100} className="flex flex-col items-center text-center">
              <span className="font-serif text-4xl lg:text-5xl font-bold text-slate-900 mb-2">
                <AnimatedCounter value={50} suffix="+" />
              </span>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">HOUSE DESIGNS</span>
            </ScrollReveal>

            <ScrollReveal delay={200} className="flex flex-col items-center text-center">
              <span className="font-serif text-4xl lg:text-5xl font-bold text-slate-900 mb-2">100%</span>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">VASTU FRIENDLY</span>
            </ScrollReveal>

            <ScrollReveal delay={300} className="flex flex-col items-center text-center">
              <span className="font-serif text-4xl lg:text-5xl font-bold text-slate-900 mb-2 flex items-center">
                <Cuboid className="w-8 h-8 lg:w-10 lg:h-10 text-slate-900 mr-2 stroke-[1.5]" /> 3D
              </span>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">ELEVATIONS</span>
            </ScrollReveal>

            <ScrollReveal delay={400} className="flex flex-col items-center text-center">
              <span className="font-serif text-4xl lg:text-5xl font-bold text-slate-900 mb-2 flex items-center">
                <FileDown className="w-8 h-8 lg:w-10 lg:h-10 text-slate-900 mr-2 stroke-[1.5]" /> 24/7
              </span>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">DIGITAL DELIVERY</span>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. FEATURED HOUSE DESIGNS */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 bg-[#FAF9F6] border-b border-stone-200">
        <div className="max-w-[1200px] mx-auto px-6">
          
          <ScrollReveal direction="up" className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-3">Portfolio Highlights</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 font-normal tracking-tight mb-4">Featured House Designs</h2>
            <p className="text-[11px] text-stone-500 leading-relaxed uppercase font-bold tracking-widest max-w-lg mx-auto">
              Explore professionally designed house plans created for modern Indian homes.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch mb-16">
            {featuredDesigns.map((design, index) => (
              <ScrollReveal key={design.id} delay={index * 150} direction="up" className="h-full">
                <DesignCard design={design} />
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal direction="up" delay={200} className="text-center">
            <Link 
              href="/designs" 
              className="inline-flex items-center justify-center px-10 py-4 text-xs font-bold tracking-widest uppercase text-slate-900 border border-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 rounded-xl shadow-sm hover:shadow-lg group"
            >
              View All Designs <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 6. WHY CHOOSE MORYA DESIGNS */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 bg-white border-b border-stone-200 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-stone-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-stone-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          
          <ScrollReveal direction="up" className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-3">Studio Philosophy</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 font-normal tracking-tight mb-4">Why Choose Morya Designs?</h2>
            <p className="text-[11px] text-stone-500 leading-relaxed uppercase font-bold tracking-widest max-w-lg mx-auto">
              Everything you need to move from idea to construction-ready planning, with premium quality and absolute clarity.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                num: "01",
                title: "PROFESSIONAL",
                subtitle: "ARCHITECTURAL DESIGNS",
                description: "Carefully crafted, highly detailed architectural plans suitable for modern homes, ensuring optimal space utilization.",
                icon: LayoutDashboard
              },
              {
                num: "02",
                title: "VASTU-FRIENDLY",
                subtitle: "TRADITIONAL COMPLIANCE",
                description: "Layouts designed following core Vastu principles to bring positive energy, harmony, and peace to your family.",
                icon: ShieldCheck
              },
              {
                num: "03",
                title: "WIDE VARIETY",
                subtitle: "MULTIPLE CONFIGURATIONS",
                description: "Choose from an extensive collection of plot sizes, BHK layouts, and facade styles tailored to your exact needs.",
                icon: Cuboid
              },
              {
                num: "04",
                title: "INSTANT ACCESS",
                subtitle: "DIGITAL DELIVERY",
                description: "Purchase securely and instantly download your high-resolution architectural files in PDF format, ready for printing.",
                icon: FileDown
              }
            ].map((feature, i) => (
              <ScrollReveal key={i} delay={i * 150} direction="up" className="h-full">
                <div 
                  className="bg-white p-8 border border-stone-200/60 hover:border-[#b89047]/40 hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-500 ease-out flex flex-col h-full rounded-[20px] group relative overflow-hidden hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none transform group-hover:scale-110">
                    <feature.icon className="w-32 h-32 text-slate-900" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-8 relative z-10">
                      <span className="font-serif text-3xl font-normal text-[#b89047]/60 group-hover:text-[#b89047] transition-colors">{feature.num}</span>
                      <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center group-hover:bg-[#b89047]/10 group-hover:border-[#b89047]/20 transition-colors">
                        <feature.icon className="w-5 h-5 text-stone-500 group-hover:text-[#b89047] transition-colors" />
                      </div>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-xs font-bold tracking-widest text-slate-900 uppercase mb-1">{feature.title}</h3>
                      <p className="text-[9px] font-bold tracking-widest text-[#b89047] uppercase mb-4">{feature.subtitle}</p>
                      <p className="text-[13px] text-stone-500 leading-relaxed font-sans">{feature.description}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 7. HOW IT WORKS */}
      {/* ------------------------------------------------------------------ */}
      <section id="how-it-works" className="py-24 bg-[#FAF9F6] border-b border-stone-200 scroll-mt-[72px] relative">
        <div className="max-w-[1200px] mx-auto px-6">
          
          <ScrollReveal direction="up" className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-3">Process</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 font-normal tracking-tight mb-4">How It Works</h2>
            <p className="text-[11px] text-stone-500 leading-relaxed uppercase font-bold tracking-widest max-w-lg mx-auto">
              Find, purchase, and download your ideal house plan in four simple steps.
            </p>
          </ScrollReveal>

          <div className="relative max-w-5xl mx-auto">
            {/* Desktop timeline horizontal connecting line */}
            <div className="hidden md:block absolute top-[45px] left-[12%] right-[12%] h-[2px] bg-stone-200 -z-0">
              <div className="absolute top-0 left-0 h-full bg-[#b89047] w-0 transition-all duration-1000 group-hover:w-full"></div>
            </div>

            {/* Mobile timeline vertical connecting line */}
            <div className="block md:hidden absolute top-[10%] bottom-[10%] left-[34px] w-[2px] bg-stone-200 -z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 relative z-10">
              {[
                {
                  step: "01",
                  title: "BROWSE",
                  description: "Explore our extensive portfolio of architectural plans based on your plot requirements."
                },
                {
                  step: "02",
                  title: "COMPARE",
                  description: "Review detailed specifications including plot size, BHK, facing, and estimated costs."
                },
                {
                  step: "03",
                  title: "PURCHASE",
                  description: "Select your preferred design and complete our secure, seamless checkout process."
                },
                {
                  step: "04",
                  title: "DOWNLOAD",
                  description: "Instantly access and download your purchased high-resolution architectural PDF files."
                }
              ].map((step, i) => (
                <ScrollReveal key={i} delay={i * 200} direction="up" className="flex flex-row md:flex-col md:items-center text-left md:text-center group gap-6 md:gap-0">
                  <div className="relative shrink-0">
                    <div className="w-[70px] h-[70px] md:w-[90px] md:h-[90px] bg-white rounded-2xl flex items-center justify-center text-lg md:text-xl font-serif font-bold text-slate-900 md:mb-6 transition-all duration-500 border border-stone-200 shadow-sm group-hover:bg-slate-900 group-hover:text-white group-hover:-translate-y-2 group-hover:shadow-xl">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1 mt-1 md:mt-0">
                    <h3 className="text-xs font-bold text-slate-900 tracking-widest uppercase mb-2 group-hover:text-[#b89047] transition-colors">{step.title}</h3>
                    <p className="text-[13px] text-stone-500 leading-relaxed max-w-[220px] md:mx-auto">{step.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 8. FINAL CALL TO ACTION */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative py-32 bg-slate-900 text-white overflow-hidden">
        {/* Subtle grid background for the dark CTA section */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Decorative blur elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#b89047]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          <ScrollReveal direction="up" delay={100} className="w-full">
            <span className="inline-block py-1.5 px-3 border border-[#b89047]/30 bg-[#b89047]/10 rounded-full text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase mb-8">Start Planning Today</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal tracking-tight mb-6 uppercase">
              Ready to plan your <br className="hidden sm:block" />
              <span className="text-[#b89047] italic font-semibold">Dream Home?</span>
            </h2>
            <p className="text-[13px] sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed mb-12 font-sans">
              Find the perfect architectural design for your plot, lifestyle, and vision. Instantly download high-quality, ready-to-build floor plans.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200}>
            <Link 
              href="/designs" 
              className="inline-flex items-center justify-center px-10 py-5 bg-[#b89047] hover:bg-[#c5a880] text-slate-950 text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-xl shadow-[0_0_40px_rgba(184,144,71,0.2)] hover:shadow-[0_0_60px_rgba(184,144,71,0.4)] hover:-translate-y-1 group"
            >
              Explore House Designs <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
}
