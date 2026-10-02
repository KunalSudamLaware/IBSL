export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 bg-[#FAF9F6]">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-48 bg-stone-200/50 rounded mb-8 animate-pulse"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Side: Images Skeleton */}
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-[4/3] bg-stone-200/50 rounded-[24px] animate-pulse"></div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-24 h-24 bg-stone-200/50 rounded-xl shrink-0 animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Right Side: Details Skeleton */}
        <div className="lg:col-span-5 flex flex-col pt-2">
          <div className="h-6 w-24 bg-stone-200/50 rounded mb-4 animate-pulse"></div>
          <div className="h-10 w-3/4 bg-stone-200/50 rounded mb-6 animate-pulse"></div>
          <div className="h-4 w-full bg-stone-200/50 rounded mb-3 animate-pulse"></div>
          <div className="h-4 w-5/6 bg-stone-200/50 rounded mb-10 animate-pulse"></div>
          
          <div className="space-y-6 mb-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-stone-200/50 rounded-xl animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-16 bg-stone-200/50 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-stone-200/50 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-auto p-8 border border-stone-200/60 rounded-[24px] bg-white">
            <div className="h-3 w-20 bg-stone-200/50 rounded mb-4 animate-pulse"></div>
            <div className="h-10 w-40 bg-stone-200/50 rounded mb-8 animate-pulse"></div>
            <div className="h-14 w-full bg-stone-200/50 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
