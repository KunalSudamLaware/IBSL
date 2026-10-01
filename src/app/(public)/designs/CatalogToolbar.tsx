"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useTransition, useState, useEffect } from "react";

export function CatalogToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (searchParams.get("search") || "")) {
        const params = new URLSearchParams(searchParams.toString());
        if (search) params.set("search", search);
        else params.delete("search");
        params.delete("page"); // Reset page on new search
        startTransition(() => {
          router.push(`?${params.toString()}`);
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, searchParams, router]);

  const handleSortChange = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <Input 
          className="pl-11 pr-4 h-11 text-sm rounded-lg border-stone-200 focus-visible:ring-1 focus-visible:ring-[#b89047]"
          placeholder="Search by plan name, BHK, or keyword..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      {/* Sort Select */}
      <div className="w-full sm:w-[240px] shrink-0">
        <Select 
          value={searchParams.get("sort") || "newest"} 
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="h-11 text-xs font-semibold uppercase tracking-wider rounded-lg border-stone-200 focus:ring-1 focus:ring-[#b89047]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="newest" className="text-xs uppercase tracking-wider font-semibold">Sort by: Newest</SelectItem>
            <SelectItem value="price_asc" className="text-xs uppercase tracking-wider font-semibold">Price: Low to High</SelectItem>
            <SelectItem value="price_desc" className="text-xs uppercase tracking-wider font-semibold">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
