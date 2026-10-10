"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Loader2 } from "lucide-react";
import { useTransition, useState, useEffect, useRef } from "react";

export function CatalogToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input value if searchParam changes externally
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentParam = searchParams.get("search") || "";
      if (search.trim() !== currentParam) {
        const params = new URLSearchParams(searchParams.toString());
        if (search.trim()) {
          params.set("search", search.trim());
        } else {
          params.delete("search");
        }
        params.delete("page"); // Reset page on new search
        startTransition(() => {
          router.push(`/designs${params.toString() ? `?${params.toString()}` : ""}`);
        });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, searchParams, router]);

  const handleSortChange = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page");
    startTransition(() => {
      router.push(`/designs?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setSearch("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-2">
      {/* Search Input */}
      <div 
        className={`relative flex-1 rounded-xl transition-all duration-300 ${
          isFocused 
            ? "shadow-[0_0_0_2px_rgba(184,144,71,0.2)] bg-white ring-1 ring-[#b89047]" 
            : "shadow-xs bg-white hover:border-stone-300 ring-1 ring-stone-200"
        }`}
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
          {isPending ? (
            <Loader2 className="w-4 h-4 text-[#b89047] animate-spin" />
          ) : (
            <Search className={`w-4 h-4 transition-colors duration-300 ${isFocused ? "text-[#b89047]" : "text-stone-400"}`} />
          )}
        </div>
        
        <Input 
          ref={inputRef}
          className="pl-12 pr-10 h-12 text-sm border-none bg-transparent shadow-none focus-visible:ring-0 placeholder:text-stone-400 font-medium"
          placeholder="Search by design name, keyword, or features..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Clear Button */}
        {search && (
          <button 
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-rose-500 bg-stone-50 hover:bg-rose-50 rounded-full transition-colors focus:outline-none cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      
      {/* Sort Select */}
      <div className="w-full sm:w-[250px] shrink-0">
        <Select 
          value={searchParams.get("sort") || "newest"} 
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="h-12 text-xs font-bold uppercase tracking-wider rounded-xl border-stone-200 bg-white shadow-xs focus:ring-2 focus:ring-[#b89047]/20 focus:border-[#b89047] transition-all">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-stone-200 shadow-lg">
            <SelectItem value="newest" className="text-xs uppercase tracking-wider font-semibold py-2.5">Sort by: Newest</SelectItem>
            <SelectItem value="price_asc" className="text-xs uppercase tracking-wider font-semibold py-2.5">Price: Low to High</SelectItem>
            <SelectItem value="price_desc" className="text-xs uppercase tracking-wider font-semibold py-2.5">Price: High to Low</SelectItem>
            <SelectItem value="area_desc" className="text-xs uppercase tracking-wider font-semibold py-2.5">Plot: Large to Small</SelectItem>
            <SelectItem value="area_asc" className="text-xs uppercase tracking-wider font-semibold py-2.5">Plot: Small to Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
