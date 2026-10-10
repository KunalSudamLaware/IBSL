"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Calendar } from "lucide-react";

const OPTIONS = [
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "last_month", label: "Last Month" },
  { value: "last_3_months", label: "Last 3 Months" },
  { value: "last_6_months", label: "Last 6 Months" },
  { value: "last_12_months", label: "Last 12 Months" },
  { value: "this_year", label: "This Year" },
  { value: "all_time", label: "All Time" }
];

function FilterDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const currentVal = searchParams.get("range") || "last_30_days";
  const currentLabel = OPTIONS.find(o => o.value === currentVal)?.label || "Last 30 Days";

  const handleSelect = (val: string) => {
    setIsOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", val);
    router.push("?" + params.toString());
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-bold tracking-wider uppercase text-slate-700 hover:text-slate-900 bg-white border border-stone-250 px-4 py-2.5 rounded-lg flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
      >
        {currentLabel} <span className="text-[10px] text-[#b89047]">{isOpen ? "?" : "?"}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-lg shadow-lg z-50 py-1">
          {OPTIONS.map(opt => {
            const isSelected = opt.value === currentVal;
            const textColor = isSelected ? "text-[#b89047]" : "text-slate-700";
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={"w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 transition-colors " + textColor}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DashboardFilter() {
  return (
    <Suspense fallback={
      <button className="text-xs font-bold tracking-wider uppercase text-slate-700 bg-white border border-stone-250 px-4 py-2.5 rounded-lg flex items-center gap-1 shadow-sm opacity-50 cursor-wait">
        Loading...
      </button>
    }>
      <FilterDropdown />
    </Suspense>
  );
}
