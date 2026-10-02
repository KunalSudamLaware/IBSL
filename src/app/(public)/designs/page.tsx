import { getFilteredDesigns } from "@/modules/catalog/queries";
import { FilterSidebar } from "./FilterSidebar";
import { CatalogToolbar } from "./CatalogToolbar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Facing } from "@prisma/client";
import { FileDown, ArrowRight, Heart, Search } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { DesignCard } from "@/components/shared/DesignCard";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function DesignsPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  // Extract params
  const search = searchParams.search ? (searchParams.search as string) : undefined;
  const sort = searchParams.sort ? (searchParams.sort as string) : undefined;
  const plotWidth = searchParams.plotWidth ? parseInt(searchParams.plotWidth as string, 10) : undefined;
  const plotLength = searchParams.plotLength ? parseInt(searchParams.plotLength as string, 10) : undefined;
  const maxPrice = searchParams.maxPrice ? parseInt(searchParams.maxPrice as string, 10) : undefined;
  const bhk = searchParams.bhk ? parseInt(searchParams.bhk as string, 10) : undefined;
  const facing = searchParams.facing ? (searchParams.facing as Facing) : undefined;
  const category = searchParams.category ? (searchParams.category as string) : undefined;
  const page = searchParams.page ? parseInt(searchParams.page as string, 10) : 1;

  const { designs, totalCount, totalPages } = await getFilteredDesigns({
    search,
    sort,
    plotWidth,
    plotLength,
    maxPrice,
    bhk,
    facing,
    category,
    page,
    limit: 12,
  });

  const categoriesShortcuts = [
    { label: "2 BHK", bhk: "2", category: "" },
    { label: "3 BHK", bhk: "3", category: "" },
    { label: "4 BHK", bhk: "4", category: "" },
    { label: "Villas", bhk: "", category: "Villa" },
    { label: "Duplex", bhk: "", category: "Duplex" },
    { label: "Bungalows", bhk: "", category: "Bungalow" },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 bg-[#FAF9F6] text-slate-900 antialiased font-sans">
      
      {/* CATALOG HEADER */}
      <header className="mb-12 pb-8 border-b border-stone-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-2">Design Marketplace</span>
            <h1 className="text-3xl md:text-4xl font-serif font-normal text-slate-900 tracking-tight mb-2">Architectural House Designs</h1>
            <p className="text-sm text-stone-500 leading-relaxed font-medium">
              Explore professionally planned house designs for modern Indian homes.
            </p>
          </div>
          <div className="shrink-0 bg-white border border-stone-200 px-5 py-2.5 rounded-lg shadow-sm">
            <span className="text-sm font-bold text-[#b89047] font-mono">{totalCount}+ Designs Available</span>
          </div>
        </div>
      </header>

      {/* CATEGORY SHORTCUTS SECTION */}
      <section className="mb-10">
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#b89047] uppercase block mb-3">Find Your Perfect Home</span>
        <div className="flex flex-wrap gap-2.5">
          {categoriesShortcuts.map((item, idx) => {
            const isBhkActive = bhk?.toString() === item.bhk && item.bhk !== "";
            const isCatActive = category === item.category && item.category !== "";
            const isActive = isBhkActive || isCatActive;
            
            // Build URL search params
            const params = new URLSearchParams();
            if (item.bhk) params.set("bhk", item.bhk);
            if (item.category) params.set("category", item.category);

            return (
              <Link 
                key={idx}
                href={`/designs?${params.toString()}`}
                className={`px-5 py-3 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  isActive 
                    ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                    : "bg-white border-stone-200 text-slate-650 hover:text-slate-900 hover:border-slate-800 shadow-sm"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {(bhk || category) && (
            <Link 
              href="/designs"
              className="px-5 py-3 rounded-lg border border-dashed border-rose-350 bg-rose-50/20 text-rose-700 text-xs font-semibold uppercase tracking-wider hover:bg-rose-50 transition-colors"
            >
              Clear Category Filter
            </Link>
          )}
        </div>
      </section>

      {/* Main Grid + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar (3 columns on large screens) */}
        <aside className="lg:col-span-3 w-full">
          <FilterSidebar />
        </aside>

        {/* Design Grid Area (9 columns on large screens) */}
        <main className="lg:col-span-9 w-full flex flex-col">
          
          {/* Search + Sort Toolbar */}
          <div className="mb-8">
            <CatalogToolbar />
          </div>

          {designs.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-24 px-6 border border-dashed border-stone-200 rounded-[20px] bg-white shadow-sm animate-in fade-in zoom-in-95 duration-500">
              <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-6 border border-stone-150">
                <Search className="w-6 h-6 text-stone-400" />
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-900 mb-3">No Designs Found</h3>
              <p className="text-sm font-medium text-stone-500 max-w-md mx-auto mb-8 leading-relaxed">
                We couldn&apos;t find any designs matching your exact requirements. Try adjusting your filters or searching for different features.
              </p>
              <Link 
                href="/designs"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-colors shadow-md shadow-slate-900/10"
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
              {designs.map((design) => {
                const primaryImage = design.images[0];
                return (
                  <DesignCard key={design.id} design={design} />
                );
              })}
            </div>
          )}
          
          {/* Pagination or Load More bottom row */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-stone-200 pt-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Showing {designs.length} of {totalCount} designs
              </span>
              
              <div className="flex items-center gap-2">
                <Link 
                  href={page <= 1 ? "#" : `?page=${page - 1}`} 
                  className={`px-5 py-2.5 border text-xs font-bold tracking-widest uppercase transition-colors rounded-lg ${
                    page <= 1 ? 'pointer-events-none opacity-40 border-stone-200 text-stone-300 bg-stone-50' : 'border-stone-300 hover:bg-stone-50 text-slate-700 bg-white'
                  }`}
                >
                  Previous
                </Link>
                
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  const isCurrent = page === pNum;
                  return (
                    <Link
                      key={pNum}
                      href={`?page=${pNum}`}
                      className={`w-10 h-10 flex items-center justify-center border text-xs font-bold rounded-lg transition-all ${
                        isCurrent 
                          ? "bg-slate-900 border-slate-900 text-white" 
                          : "border-stone-200 hover:border-slate-400 text-slate-650 bg-white"
                      }`}
                    >
                      {pNum}
                    </Link>
                  );
                })}

                <Link 
                  href={page >= totalPages ? "#" : `?page=${page + 1}`} 
                  className={`px-5 py-2.5 border text-xs font-bold tracking-widest uppercase transition-colors rounded-lg ${
                    page >= totalPages ? 'pointer-events-none opacity-40 border-stone-200 text-stone-300 bg-stone-50' : 'border-stone-300 hover:bg-stone-50 text-slate-700 bg-white'
                  }`}
                >
                  Next
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
