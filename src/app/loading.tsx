import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-24 min-h-[50vh]">
      <div className="animate-in fade-in duration-500 delay-150 flex flex-col items-center">
        <Loader2 className="w-10 h-10 text-[#b89047] animate-spin mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400">Loading...</p>
      </div>
    </div>
  );
}
