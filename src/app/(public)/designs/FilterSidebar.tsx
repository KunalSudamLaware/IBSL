"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BHK_OPTIONS,
  FLOOR_OPTIONS,
  CATEGORY_OPTIONS,
  STYLE_OPTIONS,
  FACING_OPTIONS,
  parseArrayParam,
} from "@/modules/catalog/constants";
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  IndianRupee,
  Ruler,
  Layers,
  Compass,
  Palette,
  Check,
  Building,
} from "lucide-react";

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Filter local states
  const [selectedBhks, setSelectedBhks] = useState<string[]>([]);
  const [selectedFloors, setSelectedFloors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedFacings, setSelectedFacings] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minPlotArea, setMinPlotArea] = useState("");
  const [maxPlotArea, setMaxPlotArea] = useState("");
  const [plotWidth, setPlotWidth] = useState("");
  const [plotLength, setPlotLength] = useState("");

  // Sync state with URL search params whenever URL changes
  useEffect(() => {
    setSelectedBhks(parseArrayParam(searchParams.get("bhk")));
    setSelectedFloors(parseArrayParam(searchParams.get("floors")));
    setSelectedCategories(parseArrayParam(searchParams.get("category")));
    setSelectedStyles(parseArrayParam(searchParams.get("styleTags")));
    setSelectedFacings(parseArrayParam(searchParams.get("facing")).map((f) => f.toUpperCase()));
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setMinPlotArea(searchParams.get("minPlotArea") || "");
    setMaxPlotArea(searchParams.get("maxPlotArea") || "");
    setPlotWidth(searchParams.get("plotWidth") || "");
    setPlotLength(searchParams.get("plotLength") || "");
  }, [searchParams]);

  // Construct query string from states
  const buildQueryString = useCallback(
    (overrides?: Partial<{
      bhk: string[];
      floors: string[];
      category: string[];
      styleTags: string[];
      facing: string[];
      minPrice: string;
      maxPrice: string;
      minPlotArea: string;
      maxPlotArea: string;
      plotWidth: string;
      plotLength: string;
    }>) => {
      const bhks = overrides?.bhk ?? selectedBhks;
      const flrs = overrides?.floors ?? selectedFloors;
      const cats = overrides?.category ?? selectedCategories;
      const styles = overrides?.styleTags ?? selectedStyles;
      const facings = overrides?.facing ?? selectedFacings;
      const minP = overrides?.minPrice !== undefined ? overrides.minPrice : minPrice;
      const maxP = overrides?.maxPrice !== undefined ? overrides.maxPrice : maxPrice;
      const minA = overrides?.minPlotArea !== undefined ? overrides.minPlotArea : minPlotArea;
      const maxA = overrides?.maxPlotArea !== undefined ? overrides.maxPlotArea : maxPlotArea;
      const pW = overrides?.plotWidth !== undefined ? overrides.plotWidth : plotWidth;
      const pL = overrides?.plotLength !== undefined ? overrides.plotLength : plotLength;

      const params = new URLSearchParams(searchParams.toString());

      // Helper to set or delete
      const setOrDelete = (key: string, val: string | null | undefined) => {
        if (val && val.trim() !== "") {
          params.set(key, val.trim());
        } else {
          params.delete(key);
        }
      };

      setOrDelete("bhk", bhks.length > 0 ? bhks.join(",") : null);
      setOrDelete("floors", flrs.length > 0 ? flrs.join(",") : null);
      setOrDelete("category", cats.length > 0 ? cats.join(",") : null);
      setOrDelete("styleTags", styles.length > 0 ? styles.join(",") : null);
      setOrDelete("facing", facings.length > 0 ? facings.join(",") : null);
      setOrDelete("minPrice", minP);
      setOrDelete("maxPrice", maxP);
      setOrDelete("minPlotArea", minA);
      setOrDelete("maxPlotArea", maxA);
      setOrDelete("plotWidth", pW);
      setOrDelete("plotLength", pL);

      // Always reset pagination to page 1 on filter changes
      params.delete("page");

      return params.toString();
    },
    [
      selectedBhks,
      selectedFloors,
      selectedCategories,
      selectedStyles,
      selectedFacings,
      minPrice,
      maxPrice,
      minPlotArea,
      maxPlotArea,
      plotWidth,
      plotLength,
      searchParams,
    ]
  );

  const applyFilters = () => {
    const qs = buildQueryString();
    startTransition(() => {
      router.push(`/designs${qs ? `?${qs}` : ""}`);
    });
    setMobileOpen(false);
  };

  const clearAllFilters = () => {
    setSelectedBhks([]);
    setSelectedFloors([]);
    setSelectedCategories([]);
    setSelectedStyles([]);
    setSelectedFacings([]);
    setMinPrice("");
    setMaxPrice("");
    setMinPlotArea("");
    setMaxPlotArea("");
    setPlotWidth("");
    setPlotLength("");

    // Keep search and sort if present, or reset fully
    const params = new URLSearchParams();
    const currentSearch = searchParams.get("search");
    const currentSort = searchParams.get("sort");
    if (currentSearch) params.set("search", currentSearch);
    if (currentSort) params.set("sort", currentSort);

    startTransition(() => {
      router.push(`/designs${params.toString() ? `?${params.toString()}` : ""}`);
    });
    setMobileOpen(false);
  };

  // Toggle helpers for multi-select arrays
  const toggleBhk = (val: string) => {
    setSelectedBhks((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const toggleFloor = (val: string) => {
    setSelectedFloors((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const toggleCategory = (val: string) => {
    setSelectedCategories((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const toggleStyle = (val: string) => {
    setSelectedStyles((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const toggleFacing = (val: string) => {
    setSelectedFacings((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  // Quick preset handlers
  const handleBudgetPreset = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handlePlotAreaPreset = (min: string, max: string) => {
    setMinPlotArea(min);
    setMaxPlotArea(max);
  };

  // Calculate total active filter items count
  const activeCount =
    selectedBhks.length +
    selectedFloors.length +
    selectedCategories.length +
    selectedStyles.length +
    selectedFacings.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (minPlotArea ? 1 : 0) +
    (maxPlotArea ? 1 : 0) +
    (plotWidth ? 1 : 0) +
    (plotLength ? 1 : 0);

  const filterContent = (
    <div className="space-y-7">
      {/* 1. Active Filters Summary Bar */}
      {activeCount > 0 && (
        <div className="bg-stone-50/80 p-4 rounded-xl border border-stone-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
              <span>Active Filters</span>
              <span className="bg-[#b89047] text-white text-[9px] px-1.5 py-0.5 rounded-full font-mono">
                {activeCount}
              </span>
            </span>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[10px] font-bold uppercase tracking-widest text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Clear All
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {selectedBhks.map((b) => (
              <span
                key={`act-bhk-${b}`}
                className="inline-flex items-center gap-1 bg-white border border-stone-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700 shadow-2xs"
              >
                {b} BHK
                <button
                  type="button"
                  onClick={() => toggleBhk(b)}
                  className="text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                  aria-label={`Remove ${b} BHK filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {selectedFloors.map((f) => (
              <span
                key={`act-flr-${f}`}
                className="inline-flex items-center gap-1 bg-white border border-stone-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700 shadow-2xs"
              >
                {f} {f === "1" ? "Floor" : "Floors"}
                <button
                  type="button"
                  onClick={() => toggleFloor(f)}
                  className="text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                  aria-label={`Remove ${f} floors filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1 bg-white border border-stone-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700 shadow-2xs">
                ₹{minPrice || "0"} - ₹{maxPrice || "Any"}
                <button
                  type="button"
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  className="text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                  aria-label="Remove price filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(minPlotArea || maxPlotArea) && (
              <span className="inline-flex items-center gap-1 bg-white border border-stone-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700 shadow-2xs">
                {minPlotArea || "0"} - {maxPlotArea || "Any"} sqft
                <button
                  type="button"
                  onClick={() => {
                    setMinPlotArea("");
                    setMaxPlotArea("");
                  }}
                  className="text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                  aria-label="Remove plot area filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(plotWidth || plotLength) && (
              <span className="inline-flex items-center gap-1 bg-white border border-stone-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700 shadow-2xs">
                {plotWidth ? `${plotWidth}'W` : ""} {plotLength ? `${plotLength}'L` : ""}
                <button
                  type="button"
                  onClick={() => {
                    setPlotWidth("");
                    setPlotLength("");
                  }}
                  className="text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                  aria-label="Remove dimensions filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCategories.map((c) => (
              <span
                key={`act-cat-${c}`}
                className="inline-flex items-center gap-1 bg-white border border-stone-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700 shadow-2xs"
              >
                {c}
                <button
                  type="button"
                  onClick={() => toggleCategory(c)}
                  className="text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                  aria-label={`Remove ${c} category filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {selectedStyles.map((s) => (
              <span
                key={`act-style-${s}`}
                className="inline-flex items-center gap-1 bg-white border border-stone-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700 shadow-2xs"
              >
                {s}
                <button
                  type="button"
                  onClick={() => toggleStyle(s)}
                  className="text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                  aria-label={`Remove ${s} style filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {selectedFacings.map((fc) => (
              <span
                key={`act-fc-${fc}`}
                className="inline-flex items-center gap-1 bg-white border border-stone-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700 shadow-2xs"
              >
                {fc} Facing
                <button
                  type="button"
                  onClick={() => toggleFacing(fc)}
                  className="text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                  aria-label={`Remove ${fc} facing filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 2. BHK Multi-Select Filters */}
      <fieldset className="space-y-3">
        <div className="flex items-center justify-between">
          <legend className="text-[11px] font-bold uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#b89047]" /> Bedrooms (BHK)
          </legend>
          <span className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider">
            Multi-Select
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 bg-stone-50/50 p-3 rounded-xl border border-stone-150">
          {BHK_OPTIONS.map((opt) => {
            const isChecked = selectedBhks.includes(opt.value);
            const inputId = `bhk-checkbox-${opt.value}`;
            return (
              <label
                key={opt.value}
                htmlFor={inputId}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 select-none ${
                  isChecked
                    ? "bg-white border border-[#b89047]/60 shadow-2xs"
                    : "hover:bg-white/70 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id={inputId}
                    checked={isChecked}
                    onCheckedChange={() => toggleBhk(opt.value)}
                    aria-label={`Filter by ${opt.label}`}
                    className="data-checked:bg-[#b89047] data-checked:border-[#b89047]"
                  />
                  <span
                    className={`text-xs font-semibold ${
                      isChecked ? "text-slate-900 font-bold" : "text-slate-650"
                    }`}
                  >
                    {opt.label}
                  </span>
                </div>
                {isChecked && (
                  <span className="text-[10px] text-[#b89047] font-bold flex items-center gap-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* 3. Budget Range (Min / Max INR) */}
      <fieldset className="space-y-3">
        <legend className="text-[11px] font-bold uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
          <IndianRupee className="w-3.5 h-3.5 text-[#b89047]" /> Budget Range (INR)
        </legend>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
              ₹
            </span>
            <Input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              aria-label="Minimum budget in INR"
              className="pl-7 h-10 text-xs font-semibold rounded-xl border-stone-200 bg-white shadow-2xs focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
              ₹
            </span>
            <Input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              aria-label="Maximum budget in INR"
              className="pl-7 h-10 text-xs font-semibold rounded-xl border-stone-200 bg-white shadow-2xs focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047]"
            />
          </div>
        </div>

        {/* Quick Budget Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { label: "< ₹10k", min: "", max: "10000" },
            { label: "₹10k - ₹25k", min: "10000", max: "25000" },
            { label: "₹25k - ₹40k", min: "25000", max: "40000" },
            { label: "₹40k+", min: "40000", max: "" },
          ].map((preset, idx) => {
            const isMatch = minPrice === preset.min && maxPrice === preset.max;
            return (
              <button
                type="button"
                key={idx}
                onClick={() =>
                  isMatch ? handleBudgetPreset("", "") : handleBudgetPreset(preset.min, preset.max)
                }
                className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all cursor-pointer ${
                  isMatch
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-white border-stone-200 text-stone-600 hover:border-slate-400"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 4. Plot Size (Area in Sq.Ft & Dimensions) */}
      <fieldset className="space-y-3">
        <legend className="text-[11px] font-bold uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
          <Ruler className="w-3.5 h-3.5 text-[#b89047]" /> Plot Size (Sq. Ft)
        </legend>

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder="Min Sq.Ft"
            value={minPlotArea}
            onChange={(e) => setMinPlotArea(e.target.value)}
            aria-label="Minimum plot area in square feet"
            className="h-10 text-xs font-semibold rounded-xl border-stone-200 bg-white shadow-2xs focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047]"
          />
          <Input
            type="number"
            placeholder="Max Sq.Ft"
            value={maxPlotArea}
            onChange={(e) => setMaxPlotArea(e.target.value)}
            aria-label="Maximum plot area in square feet"
            className="h-10 text-xs font-semibold rounded-xl border-stone-200 bg-white shadow-2xs focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047]"
          />
        </div>

        {/* Quick Area Presets */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "< 1,000", min: "", max: "1000" },
            { label: "1,000 - 2,000", min: "1000", max: "2000" },
            { label: "2,000 - 3,500", min: "2000", max: "3500" },
            { label: "3,500+", min: "3500", max: "" },
          ].map((preset, idx) => {
            const isMatch = minPlotArea === preset.min && maxPlotArea === preset.max;
            return (
              <button
                type="button"
                key={idx}
                onClick={() =>
                  isMatch ? handlePlotAreaPreset("", "") : handlePlotAreaPreset(preset.min, preset.max)
                }
                className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all cursor-pointer ${
                  isMatch
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-white border-stone-200 text-stone-600 hover:border-slate-400"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Plot Dimensions (Width & Length in ft) */}
        <div className="pt-2 border-t border-stone-100">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2 block">
            Plot Dimensions (ft)
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-stone-400">
                W:
              </span>
              <Input
                type="number"
                placeholder="Width"
                value={plotWidth}
                onChange={(e) => setPlotWidth(e.target.value)}
                aria-label="Plot width in feet"
                className="pl-7 h-10 text-xs font-semibold rounded-xl border-stone-200 bg-white shadow-2xs focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047]"
              />
            </div>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-stone-400">
                L:
              </span>
              <Input
                type="number"
                placeholder="Length"
                value={plotLength}
                onChange={(e) => setPlotLength(e.target.value)}
                aria-label="Plot length in feet"
                className="pl-7 h-10 text-xs font-semibold rounded-xl border-stone-200 bg-white shadow-2xs focus-visible:ring-[#b89047]/20 focus-visible:border-[#b89047]"
              />
            </div>
          </div>
        </div>
      </fieldset>

      {/* 5. Number of Floors */}
      <fieldset className="space-y-3">
        <legend className="text-[11px] font-bold uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#b89047]" /> Number of Floors
        </legend>

        <div className="grid grid-cols-2 gap-2 bg-stone-50/50 p-2.5 rounded-xl border border-stone-150">
          {FLOOR_OPTIONS.map((opt) => {
            const isChecked = selectedFloors.includes(opt.value);
            const inputId = `floor-checkbox-${opt.value}`;
            return (
              <label
                key={opt.value}
                htmlFor={inputId}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 select-none ${
                  isChecked
                    ? "bg-white border border-[#b89047]/60 shadow-2xs"
                    : "hover:bg-white/70 border border-transparent"
                }`}
              >
                <Checkbox
                  id={inputId}
                  checked={isChecked}
                  onCheckedChange={() => toggleFloor(opt.value)}
                  aria-label={`Filter by ${opt.label}`}
                  className="data-checked:bg-[#b89047] data-checked:border-[#b89047]"
                />
                <span
                  className={`text-xs ${
                    isChecked ? "font-bold text-slate-900" : "font-medium text-slate-650"
                  }`}
                >
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* 6. Architectural Style (styleTags) */}
      <fieldset className="space-y-3">
        <legend className="text-[11px] font-bold uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-[#b89047]" /> Architectural Style
        </legend>

        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
          {STYLE_OPTIONS.map((style) => {
            const isSelected = selectedStyles.includes(style);
            return (
              <button
                type="button"
                key={style}
                onClick={() => toggleStyle(style)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[#b89047] border-[#b89047] text-white shadow-2xs font-bold"
                    : "bg-white border-stone-200 text-slate-650 hover:border-stone-400 hover:text-slate-900"
                }`}
                aria-pressed={isSelected}
              >
                {style}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 7. Design Category / Property Type */}
      <fieldset className="space-y-3">
        <legend className="text-[11px] font-bold uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-[#b89047]" /> Property Category
        </legend>

        <div className="grid grid-cols-2 gap-2 bg-stone-50/50 p-2.5 rounded-xl border border-stone-150">
          {CATEGORY_OPTIONS.map((cat) => {
            const isChecked = selectedCategories.includes(cat);
            const inputId = `category-checkbox-${cat.replace(/\s+/g, "-")}`;
            return (
              <label
                key={cat}
                htmlFor={inputId}
                className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-all duration-200 select-none ${
                  isChecked
                    ? "bg-white border border-[#b89047]/60 shadow-2xs"
                    : "hover:bg-white/70 border border-transparent"
                }`}
              >
                <Checkbox
                  id={inputId}
                  checked={isChecked}
                  onCheckedChange={() => toggleCategory(cat)}
                  aria-label={`Filter by ${cat}`}
                  className="data-checked:bg-[#b89047] data-checked:border-[#b89047]"
                />
                <span
                  className={`text-xs ${
                    isChecked ? "font-bold text-slate-900" : "font-medium text-slate-650"
                  }`}
                >
                  {cat}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* 8. Facing Direction */}
      <fieldset className="space-y-3">
        <legend className="text-[11px] font-bold uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#b89047]" /> Facing Direction
        </legend>

        <div className="grid grid-cols-2 gap-2">
          {FACING_OPTIONS.map((opt) => {
            const isSelected = selectedFacings.includes(opt.value);
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => toggleFacing(opt.value)}
                className={`h-10 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? "bg-slate-900 border-slate-900 text-white shadow-2xs"
                    : "bg-white border-stone-200 text-slate-650 hover:border-slate-400 hover:text-slate-900"
                }`}
                aria-pressed={isSelected}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-[#b89047]" />}
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 9. Action Buttons */}
      <div className="pt-4 flex flex-col gap-2.5 border-t border-stone-150">
        <Button
          type="button"
          onClick={applyFilters}
          disabled={isPending}
          className="w-full h-12 text-xs font-bold uppercase tracking-widest bg-slate-900 text-white rounded-xl hover:bg-slate-800 hover:-translate-y-0.5 transition-all shadow-md shadow-slate-900/10 cursor-pointer"
        >
          {isPending ? "Applying..." : "Apply Filters"}
        </Button>

        {activeCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={clearAllFilters}
            className="w-full h-10 text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl transition-colors cursor-pointer"
          >
            Clear All Filters
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="text-slate-800">
      {/* 1. Mobile Filter Button Toggle */}
      <div className="lg:hidden w-full mb-6">
        <Button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="w-full h-12 text-[11px] font-bold uppercase tracking-widest bg-white text-slate-800 rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 border border-stone-200 shadow-sm cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#b89047]" />
          Filter Designs
          {activeCount > 0 && (
            <span className="bg-[#b89047] text-white px-2 py-0.5 rounded-full text-[10px] font-mono ml-1">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {/* 2. Desktop Sticky Sidebar */}
      <div className="hidden lg:block bg-white p-6 rounded-[24px] border border-stone-200/70 shadow-sm sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
        <div className="mb-6 pb-4 border-b border-stone-150 flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold tracking-wide text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#b89047]" />
            Filters
          </h3>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Reset All
            </button>
          )}
        </div>
        {filterContent}
      </div>

      {/* 3. Mobile Collapsible Filter Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs lg:hidden flex justify-end transition-opacity duration-300">
          <div className="w-[360px] max-w-[92vw] h-full bg-white overflow-y-auto relative animate-in slide-in-from-right duration-300 shadow-2xl flex flex-col">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-stone-150 px-6 py-5 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#b89047]" /> Filters
                {activeCount > 0 && (
                  <span className="bg-[#b89047] text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                    {activeCount}
                  </span>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer"
                aria-label="Close filters drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 pb-28">{filterContent}</div>
          </div>
        </div>
      )}
    </div>
  );
}
