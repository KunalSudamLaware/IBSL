import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export default function DesignNotFound() {
  return (
    <div className="container mx-auto py-24 px-4 text-center max-w-xl">
      <div className="bg-slate-50 border rounded-2xl p-12 shadow-sm">
        <div className="w-16 h-16 bg-white border rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <SearchX className="w-8 h-8 text-slate-400" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-slate-800 mb-4">Design Not Found</h1>
        <p className="text-stone-500 mb-8">
          The architectural design you are looking for does not exist or has been removed from our catalog.
        </p>
        <Link 
          href="/designs" 
          className={buttonVariants({ className: "bg-slate-800 hover:bg-slate-700 text-white font-medium px-8 py-6 rounded-xl shadow-sm text-base" })}
        >
          Browse All Designs
        </Link>
      </div>
    </div>
  );
}
