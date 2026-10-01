"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, X } from "lucide-react";

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mobile drawer open state
  const [mobileOpen, setMobileOpen] = useState(false);

  const [plotWidth, setPlotWidth] = useState(searchParams.get("plotWidth") || "");
  const [plotLength, setPlotLength] = useState(searchParams.get("plotLength") || "");
  const [bhk, setBhk] = useState(searchParams.get("bhk") || "");
  const [floors, setFloors] = useState(searchParams.get("floors") || "");
  const [facing, setFacing] = useState(searchParams.get("facing") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  
  const initialMaxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice") as string, 10) : 100000;
  const [maxPrice, setMaxPrice] = useState([initialMaxPrice]);

  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "") {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });
      
      return newSearchParams.toString();
    },
    [searchParams]
  );

  const applyFilters = () => {
    const qs = createQueryString({
      plotWidth: plotWidth || null,
      plotLength: plotLength || null,
      bhk: bhk !== "all" && bhk !== "" ? bhk : null,
      floors: floors !== "all" && floors !== "" ? floors : null,
      facing: facing !== "all" && facing !== "" ? facing : null,
      category: category !== "all" && category !== "" ? category : null,
      maxPrice: maxPrice[0] < 100000 ? maxPrice[0] : null,
      page: "1", // reset page on filter change
    });
    router.push(`/designs?${qs}`);
    setMobileOpen(false);
  };

  const clearFilters = () => {
    setPlotWidth("");
    setPlotLength("");
    setBhk("");
    setFloors("");
    setFacing("");
    setCategory("");
    setMaxPrice([100000]);
    router.push(`/designs`);
    setMobileOpen(false);
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Plot Dimensions */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate-800">Plot Dimensions (ft)</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400">W:</span>
            <Input 
              type="number" 
              placeholder="30" 
              value={plotWidth} 
              onChange={(e) => setPlotWidth(e.target.value)}
              className="pl-9 h-11 py-2 w-full text-sm rounded-lg border-stone-200 bg-white focus-visible:ring-1 focus-visible:ring-[#b89047]"
            />
          </div>
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400">L:</span>
            <Input 
              type="number" 
              placeholder="40" 
              value={plotLength} 
              onChange={(e) => setPlotLength(e.target.value)}
              className="pl-9 h-11 py-2 w-full text-sm rounded-lg border-stone-200 bg-white focus-visible:ring-1 focus-visible:ring-[#b89047]"
            />
          </div>
        </div>
      </div>

      {/* BHK Bedrooms */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate-800">Bedrooms (BHK)</Label>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(num => {
            const val = num.toString();
            const isSelected = bhk === val;
            return (
              <Button 
                key={num} 
                variant={isSelected ? "default" : "outline"}
                className={`h-11 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                  isSelected 
                    ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800' 
                    : 'border-stone-200 text-slate-650 hover:text-slate-900 hover:border-slate-400 bg-white'
                }`}
                onClick={() => setBhk(isSelected ? "" : val)}
              >
                {num}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Floors */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate-800">Floors</Label>
        <Select value={floors} onValueChange={(val) => setFloors(!val || val === "all" ? "" : val)}>
          <SelectTrigger className="h-11 text-xs font-semibold uppercase tracking-wider rounded-lg border-stone-200 w-full bg-white focus:ring-1 focus:ring-[#b89047]">
            <SelectValue placeholder="Any Floor" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="all" className="text-xs uppercase tracking-wider font-semibold">Any Floor</SelectItem>
            <SelectItem value="1" className="text-xs uppercase tracking-wider font-semibold">G (Single Floor)</SelectItem>
            <SelectItem value="2" className="text-xs uppercase tracking-wider font-semibold">G+1 (2 Floors)</SelectItem>
            <SelectItem value="3" className="text-xs uppercase tracking-wider font-semibold">G+2 (3 Floors)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Facing Direction */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate-800">Facing Direction</Label>
        <Select value={facing} onValueChange={(val) => setFacing(!val || val === "all" ? "" : val)}>
          <SelectTrigger className="h-11 text-xs font-semibold uppercase tracking-wider rounded-lg border-stone-200 w-full bg-white focus:ring-1 focus:ring-[#b89047]">
            <SelectValue placeholder="Any Direction" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="all" className="text-xs uppercase tracking-wider font-semibold">Any Direction</SelectItem>
            <SelectItem value="N" className="text-xs uppercase tracking-wider font-semibold">North Facing</SelectItem>
            <SelectItem value="S" className="text-xs uppercase tracking-wider font-semibold">South Facing</SelectItem>
            <SelectItem value="E" className="text-xs uppercase tracking-wider font-semibold">East Facing</SelectItem>
            <SelectItem value="W" className="text-xs uppercase tracking-wider font-semibold">West Facing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Design Type / Category */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate-800">Design Type</Label>
        <Select value={category} onValueChange={(val) => setCategory(!val || val === "all" ? "" : val)}>
          <SelectTrigger className="h-11 text-xs font-semibold uppercase tracking-wider rounded-lg border-stone-200 w-full bg-white focus:ring-1 focus:ring-[#b89047]">
            <SelectValue placeholder="Any Type" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="all" className="text-xs uppercase tracking-wider font-semibold">Any Type</SelectItem>
            <SelectItem value="Villa" className="text-xs uppercase tracking-wider font-semibold">Villa</SelectItem>
            <SelectItem value="House Plan" className="text-xs uppercase tracking-wider font-semibold">House Plan</SelectItem>
            <SelectItem value="Duplex" className="text-xs uppercase tracking-wider font-semibold">Duplex</SelectItem>
            <SelectItem value="Bungalow" className="text-xs uppercase tracking-wider font-semibold">Bungalow</SelectItem>
            <SelectItem value="Traditional" className="text-xs uppercase tracking-wider font-semibold">Traditional</SelectItem>
            <SelectItem value="Contemporary" className="text-xs uppercase tracking-wider font-semibold">Contemporary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Max Price Slider */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-end">
          <Label className="text-xs font-semibold uppercase tracking-wider text-slate-800">Price Range</Label>
          <span className="text-xs font-bold font-mono text-[#b89047]">Up to ₹{maxPrice[0].toLocaleString()}</span>
        </div>
        <Slider 
          value={maxPrice} 
          max={100000} 
          step={1000} 
          onValueChange={(val) => setMaxPrice(val as number[])} 
          className="py-1 cursor-pointer [&_[role=slider]]:bg-slate-900 [&_[role=slider]]:border-[#b89047] [&_[role=slider]]:rounded-lg [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
        />
      </div>

      {/* Action Buttons */}
      <div className="pt-6 border-t border-stone-250/50 flex flex-col gap-3">
        <Button 
          onClick={applyFilters} 
          className="w-full h-11 text-xs font-bold uppercase tracking-widest bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors border border-slate-900"
        >
          Apply Filters
        </Button>
        <Button 
          variant="outline" 
          onClick={clearFilters} 
          className="w-full h-11 text-xs font-bold uppercase tracking-widest border-stone-300 text-slate-600 rounded-lg hover:bg-stone-50 hover:text-slate-900 transition-colors bg-white"
        >
          Reset All
        </Button>
      </div>
    </div>
  );

  return (
    <div className="text-slate-800">
      {/* 1. Mobile Filter Button Toggle */}
      <div className="lg:hidden w-full mb-6">
        <Button 
          onClick={() => setMobileOpen(true)}
          className="w-full h-11 text-xs font-semibold uppercase tracking-widest bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 border border-slate-900 shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#b89047]" /> Filter Plans
        </Button>
      </div>

      {/* 2. Desktop Inline Filters */}
      <div className="hidden lg:block bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
        <div className="mb-6 pb-2 border-b border-stone-150">
          <h3 className="font-serif text-base font-semibold tracking-wide text-slate-900 uppercase">
            Filter Plans
          </h3>
        </div>
        {filterContent}
      </div>

      {/* 3. Mobile Collapsible Filter Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="w-[310px] h-full bg-white p-6 overflow-y-auto relative animate-in slide-in-from-right duration-200 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-150">
                <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-slate-900">Filters</h3>
                <button 
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
                >
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              </div>
              {filterContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
