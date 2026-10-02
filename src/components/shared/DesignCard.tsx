import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { ArrowRight, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "./WishlistButton";
import { Prisma } from "@prisma/client";

type DesignWithPrimaryImage = Prisma.DesignGetPayload<{
  include: { images: { where: { isPrimary: true }; take: 1 } };
}>;

interface DesignCardProps {
  design: DesignWithPrimaryImage;
  className?: string;
}

export function DesignCard({ design, className = "" }: DesignCardProps) {
  const primaryImage = design.images[0];

  return (
    <div 
      className={`group bg-white border border-stone-200 overflow-hidden hover:border-[#b89047]/40 hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-500 ease-out hover:-translate-y-1 flex flex-col justify-between h-full rounded-[16px] relative animate-in fade-in slide-in-from-bottom-8 ${className}`}
    >
      
      {/* Heart/Favorite Button overlayed on top right */}
      <div className="absolute top-4 right-4 z-20">
        <WishlistButton designId={design.id} />
      </div>

      {/* Image Block */}
      <Link href={`/designs/${design.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-stone-100 rounded-t-[16px]">
        {primaryImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={primaryImage.url} 
            alt={design.title} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <FileDown className="w-10 h-10 stroke-1" />
          </div>
        )}
        
        {/* Subtle Dark Overlay on Hover */}
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-500"></div>

        {/* Badge Area */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {design.status === "PUBLISHED" && (
             <Badge variant="secondary" className="bg-white/95 text-slate-900 border-none rounded-md text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 shadow-sm backdrop-blur-sm">
              Featured
            </Badge>
          )}
          <Badge variant="secondary" className="bg-slate-900/90 text-white border-none rounded-md text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 shadow-sm">
            {design.category}
          </Badge>
        </div>
      </Link>
      
      {/* Content Block */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#b89047]">{design.facing} Facing</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 bg-stone-50 px-2 py-0.5 rounded-sm">{design.plotWidthFt}×{design.plotLengthFt} ft Plot</span>
        </div>
        
        <Link href={`/designs/${design.slug}`} className="block mb-4">
          <h3 className="text-lg font-serif font-bold text-slate-900 group-hover:text-[#b89047] transition-colors line-clamp-2 min-h-[56px] leading-snug">
            {design.title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-6">
          <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#b89047]"></span> {design.bhk} BHK</span>
          <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#b89047]"></span> {design.floors} {design.floors > 1 ? "Floors" : "Floor"}</span>
        </div>
        
        <div className="mt-auto pt-5 border-t border-stone-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Fixed Price</span>
            <span className="font-mono font-bold text-base text-slate-900">{formatPrice(design.priceInr)}</span>
          </div>
          <Link 
            href={`/designs/${design.slug}`}
            className="group/btn relative overflow-hidden px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:bg-[#b89047] flex items-center gap-2 shadow-sm"
          >
            <span className="relative z-10">Details</span>
            <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
