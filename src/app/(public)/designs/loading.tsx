import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 bg-[#FAF9F6] min-h-[70vh]">
      <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
        {/* Skeleton Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-6">
          <div className="h-10 bg-stone-200/50 rounded-lg animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-6 w-24 bg-stone-200/50 rounded animate-pulse"></div>
            <div className="h-4 bg-stone-200/50 rounded animate-pulse"></div>
            <div className="h-4 bg-stone-200/50 rounded animate-pulse"></div>
            <div className="h-4 w-2/3 bg-stone-200/50 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Skeleton Grid */}
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-32 bg-stone-200/50 rounded animate-pulse"></div>
            <div className="h-10 w-40 bg-stone-200/50 rounded-lg animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-[16px] overflow-hidden flex flex-col">
                <div className="aspect-[4/3] bg-stone-100 animate-pulse"></div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <div className="h-3 w-16 bg-stone-100 rounded animate-pulse"></div>
                    <div className="h-3 w-20 bg-stone-100 rounded animate-pulse"></div>
                  </div>
                  <div className="h-5 w-3/4 bg-stone-200/50 rounded animate-pulse"></div>
                  <div className="h-3 w-1/2 bg-stone-100 rounded animate-pulse"></div>
                  <div className="pt-4 mt-4 border-t border-stone-100 flex justify-between">
                    <div className="h-6 w-20 bg-stone-200/50 rounded animate-pulse"></div>
                    <div className="h-8 w-24 bg-stone-200/50 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
