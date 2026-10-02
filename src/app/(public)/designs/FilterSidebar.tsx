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

  // Calculate active filters count for the badge
  let activeCount = 0;
  if (plotWidth) activeCount++;
  if (plotLength) activeCount++;
  if (bhk && bhk !== "all") activeCount++;
  if (floors && floors !== "all") activeCount++;
  if (facing && facing !== "all") activeCount++;
  if (category && category !== "all") activeCount++;
  if (maxPrice[0] < 100000) activeCount++;

  const filterContent = (
    <div className="space-y-8">
      {/* Active Filters Summary (If any) */}
      {activeCount > 0 && (
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/60">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-800">Active Filters</span>
            <button onClick={clearFilters} className="text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors">Clear All</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {plotWidth && <span className="inline-flex items-center gap-1 bg-white border border-stone-200 px-2 py-1 rounded-md text-[10px] font-semibold text-slate-700 shadow-sm">W: {plotWidth}ft <X className="w-3 h-3 cursor-pointer hover:text-rose-500" onClick={() => setPlotWidth("")} /></span>}
            {plotLength && <span className="inline-flex items-center gap-1 bg-white border border-stone-200 px-2 py-1 rounded-md text-[10px] font-semibold text-slate-700 shadow-sm">L: {plotLength}ft <X className="w-3 h-3 cursor-pointer hover:text-rose-500" onClick={() => setPlotLength("")} /></span>}
            {bhk && bhk !== "all" && <span className="inline-flex items-center gap-1 bg-white border border-stone-200 px-2 py-1 rounded-md text-[10px] font-semibold text-slate-700 shadow-sm">{bhk} BHK <X className="w-3 h-3 cursor-pointer hover:text-rose-500" onClick={() => setBhk("")} /></span>}
            {category && category !== "all" && <span className="inline-flex items-center gap-1 bg-white border border-stone-200 px-2 py-1 rounded-md text-[10px] font-semibold text-slate-700 shadow-sm">{category} <X className="w-3 h-3 cursor-pointer hover:text-rose-500" onClick={() => setCategory("")} /></span>}
            {facing && facing !== "all" && <span className="inline-flex items-center gap-1 bg-white border border-stone-200 px-2 py-1 rounded-md text-[10px] font-semibold text-slate-700 shadow-sm">{facing} Facing <X className="w-3 h-3 cursor-pointer hover:text-rose-500" onClick={() => setFacing("")} /></span>}
          </div>
        </div>
      )}

      {/* Plot Dimensions */}
      <div className="space-y-4">
        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Plot Dimensions (ft)</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative w-full group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 group-focus-within:text-[#b89047] transition-colors">W:</span>
            <Input 
              type="number" 
              placeholder="30" 
              value={plotWidth} 
              onChange={(e) => setPlotWidth(e.target.value)}
              className="pl-9 h-11 py-2 w-full text-sm font-semibold rounded-xl border-stone-200 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047] transition-all"
            />
          </div>
          <div className="relative w-full group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 group-focus-within:text-[#b89047] transition-colors">L:</span>
            <Input 
              type="number" 
              placeholder="40" 
              value={plotLength} 
              onChange={(e) => setPlotLength(e.target.value)}
              className="pl-9 h-11 py-2 w-full text-sm font-semibold rounded-xl border-stone-200 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047] transition-all"
            />
          </div>
        </div>
      </div>

      {/* BHK Bedrooms */}
      <div className="space-y-4">
        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Bedrooms (BHK)</Label>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(num => {
            const val = num.toString();
            const isSelected = bhk === val;
            return (
              <Button 
                key={num} 
                variant={isSelected ? "default" : "outline"}
                className={`h-11 text-xs font-bold rounded-xl transition-all duration-300 shadow-sm ${
                  isSelected 
                    ? 'bg-[#b89047] border-[#b89047] text-white hover:bg-[#a67c33]' 
                    : 'border-stone-200 text-slate-600 hover:text-slate-900 hover:border-stone-300 bg-white'
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
      <div className="space-y-4">
        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Floors</Label>
        <Select value={floors} onValueChange={(val) => setFloors(!val || val === "all" ? "" : val)}>
          <SelectTrigger className="h-11 text-xs font-bold uppercase tracking-wider rounded-xl border-stone-200 w-full bg-white shadow-sm focus:ring-2 focus:ring-[#b89047]/20 focus:border-[#b89047] transition-all">
            <SelectValue placeholder="Any Floor" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-stone-200 shadow-lg">
            <SelectItem value="all" className="text-xs uppercase tracking-wider font-semibold py-2.5">Any Floor</SelectItem>
            <SelectItem value="1" className="text-xs uppercase tracking-wider font-semibold py-2.5">G (Single Floor)</SelectItem>
            <SelectItem value="2" className="text-xs uppercase tracking-wider font-semibold py-2.5">G+1 (2 Floors)</SelectItem>
            <SelectItem value="3" className="text-xs uppercase tracking-wider font-semibold py-2.5">G+2 (3 Floors)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Facing Direction */}
      <div className="space-y-4">
        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Facing Direction</Label>
        <Select value={facing} onValueChange={(val) => setFacing(!val || val === "all" ? "" : val)}>
          <SelectTrigger className="h-11 text-xs font-bold uppercase tracking-wider rounded-xl border-stone-200 w-full bg-white shadow-sm focus:ring-2 focus:ring-[#b89047]/20 focus:border-[#b89047] transition-all">
            <SelectValue placeholder="Any Direction" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-stone-200 shadow-lg">
            <SelectItem value="all" className="text-xs uppercase tracking-wider font-semibold py-2.5">Any Direction</SelectItem>
            <SelectItem value="N" className="text-xs uppercase tracking-wider font-semibold py-2.5">North Facing</SelectItem>
            <SelectItem value="S" className="text-xs uppercase tracking-wider font-semibold py-2.5">South Facing</SelectItem>
            <SelectItem value="E" className="text-xs uppercase tracking-wider font-semibold py-2.5">East Facing</SelectItem>
            <SelectItem value="W" className="text-xs uppercase tracking-wider font-semibold py-2.5">West Facing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Design Type / Category */}
      <div className="space-y-4">
        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Design Type</Label>
        <Select value={category} onValueChange={(val) => setCategory(!val || val === "all" ? "" : val)}>
          <SelectTrigger className="h-11 text-xs font-bold uppercase tracking-wider rounded-xl border-stone-200 w-full bg-white shadow-sm focus:ring-2 focus:ring-[#b89047]/20 focus:border-[#b89047] transition-all">
            <SelectValue placeholder="Any Type" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-stone-200 shadow-lg">
            <SelectItem value="all" className="text-xs uppercase tracking-wider font-semibold py-2.5">Any Type</SelectItem>
            <SelectItem value="Villa" className="text-xs uppercase tracking-wider font-semibold py-2.5">Villa</SelectItem>
            <SelectItem value="House Plan" className="text-xs uppercase tracking-wider font-semibold py-2.5">House Plan</SelectItem>
            <SelectItem value="Duplex" className="text-xs uppercase tracking-wider font-semibold py-2.5">Duplex</SelectItem>
            <SelectItem value="Bungalow" className="text-xs uppercase tracking-wider font-semibold py-2.5">Bungalow</SelectItem>
            <SelectItem value="Traditional" className="text-xs uppercase tracking-wider font-semibold py-2.5">Traditional</SelectItem>
            <SelectItem value="Contemporary" className="text-xs uppercase tracking-wider font-semibold py-2.5">Contemporary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Max Price Slider */}
      <div className="space-y-6 pt-2">
        <div className="flex justify-between items-end">
          <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Max Price</Label>
          <span className="text-[13px] font-bold font-serif text-[#b89047]">₹{maxPrice[0].toLocaleString()}</span>
        </div>
        <Slider 
          value={maxPrice} 
          max={100000} 
          step={1000} 
          onValueChange={(val) => setMaxPrice(val as number[])} 
          className="py-1 cursor-pointer [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-[#b89047] [&_[role=slider]]:rounded-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:shadow-md"
        />
      </div>

      {/* Action Buttons */}
      <div className="pt-8 flex flex-col gap-3">
        <Button 
          onClick={applyFilters} 
          className="w-full h-12 text-xs font-bold uppercase tracking-widest bg-slate-900 text-white rounded-xl hover:bg-slate-800 hover:-translate-y-0.5 transition-all shadow-md shadow-slate-900/10"
        >
          Apply Filters
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
          className="w-full h-12 text-[11px] font-bold uppercase tracking-widest bg-white text-slate-800 rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 border border-stone-200 shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#b89047]" /> 
          Filter Designs 
          {activeCount > 0 && (
            <span className="bg-[#b89047] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] ml-1">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {/* 2. Desktop Inline Filters */}
      <div className="hidden lg:block bg-white p-6 rounded-[20px] border border-stone-200/60 shadow-sm sticky top-24">
        <div className="mb-6 pb-4 border-b border-stone-150 flex items-center justify-between">
          <h3 className="font-serif text-[17px] font-bold tracking-wide text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#b89047]" />
            Filters
          </h3>
          {activeCount > 0 && (
            <button onClick={clearFilters} className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-rose-500 transition-colors">
              Reset
            </button>
          )}
        </div>
        {filterContent}
      </div>

      {/* 3. Mobile Collapsible Filter Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden flex justify-end transition-opacity duration-300">
          <div className="w-[340px] max-w-[90vw] h-full bg-white overflow-y-auto relative animate-in slide-in-from-right duration-300 shadow-2xl flex flex-col">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-stone-150 px-6 py-5 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#b89047]" /> Filters
              </h3>
              <button 
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 pb-24">
              {filterContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
