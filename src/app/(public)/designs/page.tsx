import { getFilteredDesigns, parseArrayParam } from "@/modules/catalog/queries";
import { FilterSidebar } from "./FilterSidebar";
import { CatalogToolbar } from "./CatalogToolbar";
import Link from "next/link";
import { Search, X, RotateCcw, Filter } from "lucide-react";
import { DesignCard } from "@/components/shared/DesignCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Architectural House Designs | Morya Designs",
  description: "Explore our collection of customizable, Vastu-compliant house plans, 3D elevations, and architectural designs.",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// Helper to remove filters from URL query params
function getRemoveFiltersHref(
  currentParams: Record<string, string | string[] | undefined>,
  removals: Array<{ key: string; value?: string }>
) {
  const params = new URLSearchParams();
  const removalMap = new Map<string, string | undefined>();
  removals.forEach((r) => removalMap.set(r.key, r.value));

  for (const [k, v] of Object.entries(currentParams)) {
    if (!v || k === "page") continue;
    if (removalMap.has(k)) {
      const valToRemove = removalMap.get(k);
      if (!valToRemove) {
        continue; // drop entire key
      }
      const values = String(v)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const remaining = values.filter((val) => val.toLowerCase() !== valToRemove.toLowerCase());
      if (remaining.length > 0) {
        params.set(k, remaining.join(","));
      }
    } else {
      params.set(k, Array.isArray(v) ? v.join(",") : String(v));
    }
  }
  const qs = params.toString();
  return `/designs${qs ? `?${qs}` : ""}`;
}

// Helper to build page link preserving existing filters
function getPageHref(
  currentParams: Record<string, string | string[] | undefined>,
  pageNum: number
) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(currentParams)) {
    if (!v || k === "page") continue;
    params.set(k, Array.isArray(v) ? v.join(",") : String(v));
  }
  params.set("page", String(pageNum));
  return `/designs?${params.toString()}`;
}

export default async function DesignsPage(props: { searchParams: SearchParams }) {
  const rawParams = await props.searchParams;

  // Extract params
  const search = typeof rawParams.search === "string" ? rawParams.search : undefined;
  const sort = typeof rawParams.sort === "string" ? rawParams.sort : undefined;
  const bhk = rawParams.bhk;
  const floors = rawParams.floors;
  const minPrice = rawParams.minPrice;
  const maxPrice = rawParams.maxPrice;
  const minPlotArea = rawParams.minPlotArea;
  const maxPlotArea = rawParams.maxPlotArea;
  const plotWidth = rawParams.plotWidth;
  const plotLength = rawParams.plotLength;
  const category = rawParams.category;
  const styleTags = rawParams.styleTags;
  const facing = rawParams.facing;
  const page = rawParams.page ? parseInt(String(rawParams.page), 10) : 1;

  const { designs, totalCount, totalPages } = await getFilteredDesigns({
    search,
    sort,
    bhk,
    floors,
    minPrice,
    maxPrice,
    minPlotArea,
    maxPlotArea,
    plotWidth,
    plotLength,
    category,
    styleTags,
    facing,
    page,
    limit: 12,
  });

  const selectedBhks = parseArrayParam(bhk);
  const selectedFloors = parseArrayParam(floors);
  const selectedCategories = parseArrayParam(category);
  const selectedStyles = parseArrayParam(styleTags);
  const selectedFacings = parseArrayParam(facing);

  const categoriesShortcuts = [
    { label: "1 BHK", bhk: "1", category: "" },
    { label: "2 BHK", bhk: "2", category: "" },
    { label: "3 BHK", bhk: "3", category: "" },
    { label: "4 BHK", bhk: "4", category: "" },
    { label: "5+ BHK", bhk: "5+", category: "" },
    { label: "Villas", bhk: "", category: "Villa" },
    { label: "Duplex", bhk: "", category: "Duplex" },
    { label: "Bungalows", bhk: "", category: "Bungalow" },
  ];

  // Active filter items for pills
  const activeFilters: Array<{
    label: string;
    href: string;
    key: string;
  }> = [];

  if (search) {
    activeFilters.push({
      label: `"${search}"`,
      href: getRemoveFiltersHref(rawParams, [{ key: "search" }]),
      key: "search",
    });
  }

  selectedBhks.forEach((b) => {
    activeFilters.push({
      label: `${b} BHK`,
      href: getRemoveFiltersHref(rawParams, [{ key: "bhk", value: b }]),
      key: `bhk-${b}`,
    });
  });

  selectedFloors.forEach((f) => {
    activeFilters.push({
      label: `${f} ${f === "1" ? "Floor" : "Floors"}`,
      href: getRemoveFiltersHref(rawParams, [{ key: "floors", value: f }]),
      key: `floors-${f}`,
    });
  });

  if (minPrice && maxPrice) {
    activeFilters.push({
      label: `₹${minPrice} - ₹${maxPrice}`,
      href: getRemoveFiltersHref(rawParams, [{ key: "minPrice" }, { key: "maxPrice" }]),
      key: "price-range",
    });
  } else if (minPrice) {
    activeFilters.push({
      label: `Min ₹${minPrice}`,
      href: getRemoveFiltersHref(rawParams, [{ key: "minPrice" }]),
      key: "minPrice",
    });
  } else if (maxPrice) {
    activeFilters.push({
      label: `Max ₹${maxPrice}`,
      href: getRemoveFiltersHref(rawParams, [{ key: "maxPrice" }]),
      key: "maxPrice",
    });
  }

  if (minPlotArea && maxPlotArea) {
    activeFilters.push({
      label: `${minPlotArea} - ${maxPlotArea} sq.ft`,
      href: getRemoveFiltersHref(rawParams, [{ key: "minPlotArea" }, { key: "maxPlotArea" }]),
      key: "area-range",
    });
  } else if (minPlotArea) {
    activeFilters.push({
      label: `≥ ${minPlotArea} sq.ft`,
      href: getRemoveFiltersHref(rawParams, [{ key: "minPlotArea" }]),
      key: "minPlotArea",
    });
  } else if (maxPlotArea) {
    activeFilters.push({
      label: `≤ ${maxPlotArea} sq.ft`,
      href: getRemoveFiltersHref(rawParams, [{ key: "maxPlotArea" }]),
      key: "maxPlotArea",
    });
  }

  if (plotWidth) {
    activeFilters.push({
      label: `Width: ${plotWidth}ft`,
      href: getRemoveFiltersHref(rawParams, [{ key: "plotWidth" }]),
      key: "plotWidth",
    });
  }

  if (plotLength) {
    activeFilters.push({
      label: `Length: ${plotLength}ft`,
      href: getRemoveFiltersHref(rawParams, [{ key: "plotLength" }]),
      key: "plotLength",
    });
  }

  selectedCategories.forEach((cat) => {
    activeFilters.push({
      label: cat,
      href: getRemoveFiltersHref(rawParams, [{ key: "category", value: cat }]),
      key: `cat-${cat}`,
    });
  });

  selectedStyles.forEach((style) => {
    activeFilters.push({
      label: style,
      href: getRemoveFiltersHref(rawParams, [{ key: "styleTags", value: style }]),
      key: `style-${style}`,
    });
  });

  selectedFacings.forEach((fc) => {
    activeFilters.push({
      label: `${fc} Facing`,
      href: getRemoveFiltersHref(rawParams, [{ key: "facing", value: fc }]),
      key: `facing-${fc}`,
    });
  });

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 bg-[#FAF9F6] text-slate-900 antialiased font-sans">
      {/* CATALOG HEADER */}
      <header className="mb-10 pb-8 border-b border-stone-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-2">
              Browse Designs
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-normal text-slate-900 tracking-tight mb-2">
              Architectural House Designs
            </h1>
            <p className="text-sm text-stone-500 leading-relaxed font-medium">
              Explore professionally planned, Vastu-compliant house designs for modern living.
            </p>
          </div>
          <div className="shrink-0 bg-white border border-stone-200 px-5 py-2.5 rounded-xl shadow-xs">
            <span className="text-xs font-bold text-[#b89047] font-mono">
              {totalCount} {totalCount === 1 ? "Design" : "Designs"} Available
            </span>
          </div>
        </div>
      </header>

      {/* QUICK SHORTCUTS STRIP */}
      <section className="mb-8" aria-label="Quick category shortcuts">
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#b89047] uppercase block mb-3">
          Quick Filters
        </span>
        <div className="flex flex-wrap gap-2">
          {categoriesShortcuts.map((item, idx) => {
            const isBhkActive = item.bhk !== "" && selectedBhks.includes(item.bhk);
            const isCatActive = item.category !== "" && selectedCategories.includes(item.category);
            const isActive = isBhkActive || isCatActive;

            // Generate toggle or filter url
            const params = new URLSearchParams();
            for (const [k, v] of Object.entries(rawParams)) {
              if (!v || k === "page") continue;
              params.set(k, Array.isArray(v) ? v.join(",") : String(v));
            }

            if (item.bhk) {
              if (isBhkActive) {
                const remaining = selectedBhks.filter((b) => b !== item.bhk);
                if (remaining.length > 0) params.set("bhk", remaining.join(","));
                else params.delete("bhk");
              } else {
                params.set("bhk", [...selectedBhks, item.bhk].join(","));
              }
            }

            if (item.category) {
              if (isCatActive) {
                const remaining = selectedCategories.filter((c) => c !== item.category);
                if (remaining.length > 0) params.set("category", remaining.join(","));
                else params.delete("category");
              } else {
                params.set("category", [...selectedCategories, item.category].join(","));
              }
            }

            const shortcutHref = `/designs${params.toString() ? `?${params.toString()}` : ""}`;

            return (
              <Link
                key={idx}
                href={shortcutHref}
                className={`px-4 py-2.5 rounded-xl border text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 border-slate-900 text-white shadow-xs font-bold"
                    : "bg-white border-stone-200 text-slate-650 hover:text-slate-900 hover:border-stone-400 shadow-2xs"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {activeFilters.length > 0 && (
            <Link
              href="/designs"
              className="px-4 py-2.5 rounded-xl border border-dashed border-rose-300 bg-rose-50/40 text-rose-700 text-xs font-semibold tracking-wider hover:bg-rose-100/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Clear All Filters
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
          <div className="mb-4">
            <CatalogToolbar />
          </div>

          {/* ACTIVE FILTER PILLS DISPLAY */}
          {activeFilters.length > 0 && (
            <div className="mb-6 p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-2xs flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#b89047]" /> Filters ({activeFilters.length}):
              </span>

              {activeFilters.map((af) => (
                <Link
                  key={af.key}
                  href={af.href}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors group cursor-pointer"
                  title={`Remove ${af.label}`}
                >
                  <span>{af.label}</span>
                  <X className="w-3 h-3 text-stone-400 group-hover:text-rose-500 transition-colors" />
                </Link>
              ))}

              <Link
                href="/designs"
                className="text-[10px] font-bold uppercase tracking-wider text-rose-600 hover:text-rose-700 hover:underline ml-auto pl-2 transition-colors cursor-pointer"
              >
                Clear All
              </Link>
            </div>
          )}

          {/* RESULTS COUNT & STATUS */}
          <div className="mb-6 flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>
              Showing {designs.length} of {totalCount} {totalCount === 1 ? "design" : "designs"}
            </span>
            {totalPages > 1 && (
              <span>
                Page {page} of {totalPages}
              </span>
            )}
          </div>

          {/* ZERO RESULTS EMPTY STATE */}
          {designs.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-6 border border-dashed border-stone-200 rounded-[24px] bg-white shadow-xs animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-5 border border-stone-150">
                <Search className="w-7 h-7 text-stone-400" />
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">No Designs Found</h3>
              <p className="text-xs font-medium text-stone-500 max-w-md mx-auto mb-6 leading-relaxed">
                We couldn&apos;t find any designs matching your selected criteria. Try removing some filters or broadening your budget and plot size options.
              </p>
              <Link
                href="/designs"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-colors shadow-md shadow-slate-900/10 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
              </Link>
            </div>
          ) : (
            /* DESIGN GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
              {designs.map((design) => (
                <DesignCard key={design.id} design={design} />
              ))}
            </div>
          )}

          {/* PAGINATION ROW */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-stone-200 pt-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Showing page {page} of {totalPages} ({totalCount} total designs)
              </span>

              <div className="flex items-center gap-2">
                <Link
                  href={page <= 1 ? "#" : getPageHref(rawParams, page - 1)}
                  aria-disabled={page <= 1}
                  className={`px-4 py-2 border text-xs font-bold tracking-widest uppercase transition-colors rounded-lg ${
                    page <= 1
                      ? "pointer-events-none opacity-40 border-stone-200 text-stone-300 bg-stone-50"
                      : "border-stone-300 hover:bg-stone-50 text-slate-700 bg-white shadow-2xs"
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
                      href={getPageHref(rawParams, pNum)}
                      className={`w-9 h-9 flex items-center justify-center border text-xs font-bold rounded-lg transition-all ${
                        isCurrent
                          ? "bg-slate-900 border-slate-900 text-white shadow-2xs"
                          : "border-stone-200 hover:border-slate-400 text-slate-650 bg-white"
                      }`}
                    >
                      {pNum}
                    </Link>
                  );
                })}

                <Link
                  href={page >= totalPages ? "#" : getPageHref(rawParams, page + 1)}
                  aria-disabled={page >= totalPages}
                  className={`px-4 py-2 border text-xs font-bold tracking-widest uppercase transition-colors rounded-lg ${
                    page >= totalPages
                      ? "pointer-events-none opacity-40 border-stone-200 text-stone-300 bg-stone-50"
                      : "border-stone-300 hover:bg-stone-50 text-slate-700 bg-white shadow-2xs"
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
