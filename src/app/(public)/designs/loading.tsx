import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="container mx-auto py-24 px-4 flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="w-12 h-12 text-slate-300 animate-spin mb-4" />
      <h2 className="text-xl font-serif font-bold text-slate-800">Loading designs...</h2>
      <p className="text-stone-500">Fetching the latest architectural catalog.</p>
    </div>
  );
}
