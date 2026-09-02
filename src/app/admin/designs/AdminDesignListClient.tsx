"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminDesignListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", search);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
      <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <Input
          placeholder="Search designs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white border-stone-200"
        />
      </form>

      <div className="flex gap-4 w-full sm:w-auto">
        <Select
          defaultValue={searchParams.get("status") || "ALL"}
          onValueChange={(val) => updateFilter("status", val || "")}
        >
          <SelectTrigger className="w-full sm:w-36 bg-white border-stone-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select
          defaultValue={searchParams.get("sort") || "newest"}
          onValueChange={(val) => updateFilter("sort", val || "")}
        >
          <SelectTrigger className="w-full sm:w-48 bg-white border-stone-200">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="price_asc">Price Low → High</SelectItem>
            <SelectItem value="price_desc">Price High → Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
