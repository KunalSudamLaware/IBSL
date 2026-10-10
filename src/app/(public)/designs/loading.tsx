export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 bg-[#FAF9F6] min-h-[70vh]">
      {/* Header Skeleton */}
      <div className="mb-10 pb-8 border-b border-stone-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="h-3 w-28 bg-stone-200/60 rounded-full animate-pulse" />
            <div className="h-9 w-72 bg-stone-200/60 rounded-lg animate-pulse" />
            <div className="h-4 w-96 bg-stone-200/60 rounded animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-stone-200/60 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Quick Filters Strip Skeleton */}
      <div className="mb-8 space-y-3">
        <div className="h-3 w-24 bg-stone-200/60 rounded-full animate-pulse" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-9 w-20 bg-stone-200/60 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>

      {/* Main Grid + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Skeleton */}
        <aside className="lg:col-span-3 w-full">
          <div className="bg-white p-6 rounded-[24px] border border-stone-200/70 shadow-xs space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-stone-150">
              <div className="h-5 w-20 bg-stone-200/60 rounded animate-pulse" />
              <div className="h-4 w-12 bg-stone-200/60 rounded animate-pulse" />
            </div>

            {/* BHK Skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-28 bg-stone-200/60 rounded animate-pulse" />
              <div className="space-y-2 bg-stone-50/50 p-3 rounded-xl border border-stone-150">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-6 w-full bg-stone-200/50 rounded animate-pulse" />
                ))}
              </div>
            </div>

            {/* Budget Skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-24 bg-stone-200/60 rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-stone-200/50 rounded-xl animate-pulse" />
                <div className="h-10 bg-stone-200/50 rounded-xl animate-pulse" />
              </div>
            </div>

            {/* Plot Size Skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-28 bg-stone-200/60 rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-stone-200/50 rounded-xl animate-pulse" />
                <div className="h-10 bg-stone-200/50 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </aside>

        {/* Content Skeleton */}
        <main className="lg:col-span-9 w-full flex flex-col">
          {/* Toolbar Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="h-12 flex-1 bg-white border border-stone-200 rounded-xl animate-pulse" />
            <div className="h-12 w-full sm:w-[250px] bg-white border border-stone-200 rounded-xl animate-pulse" />
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white border border-stone-200 rounded-[16px] overflow-hidden flex flex-col shadow-xs"
              >
                <div className="aspect-[4/3] bg-stone-100 animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <div className="h-3 w-16 bg-stone-100 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-stone-100 rounded animate-pulse" />
                  </div>
                  <div className="h-5 w-3/4 bg-stone-200/50 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-stone-100 rounded animate-pulse" />
                  <div className="pt-4 mt-4 border-t border-stone-100 flex justify-between items-center">
                    <div className="h-5 w-20 bg-stone-200/50 rounded animate-pulse" />
                    <div className="h-8 w-24 bg-stone-200/50 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
