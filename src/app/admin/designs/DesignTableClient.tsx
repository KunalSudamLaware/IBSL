"use client";

import { useState } from "react";
import { DesignStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Eye, Pencil, Tag, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { EditPriceModal } from "./EditPriceModal";
import { formatPrice } from "@/lib/format";

type Design = {
  id: string;
  title: string;
  slug: string;
  category: string;
  plotWidthFt: number;
  plotLengthFt: number;
  plotAreaSqft: number;
  bhk: number;
  floors: number;
  facing: string;
  priceInr: number;
  status: DesignStatus;
  images: { url: string; isPrimary: boolean }[];
};

interface DesignTableClientProps {
  designs: Design[];
}

export function DesignTableClient({ designs }: DesignTableClientProps) {
  const [editingDesign, setEditingDesign] = useState<Design | null>(null);

  return (
    <>
      {/* Edit Price Modal */}
      {editingDesign && (
        <EditPriceModal
          design={editingDesign}
          onClose={() => setEditingDesign(null)}
        />
      )}

      <tbody className="divide-y divide-stone-100">
        {designs.length === 0 ? (
          <tr>
            <td colSpan={7} className="px-6 py-12 text-center text-stone-400 text-xs font-semibold uppercase tracking-widest italic">
              No designs found matching your criteria.
            </td>
          </tr>
        ) : (
          designs.map((design) => (
            <tr key={design.id} className="hover:bg-stone-50/40 transition-colors">
              {/* Image */}
              <td className="px-6 py-4">
                <div className="w-16 h-12 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center">
                  {design.images[0] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={design.images[0].url} alt={design.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-stone-300 stroke-1" />
                  )}
                </div>
              </td>

              {/* Design Name */}
              <td className="px-6 py-4">
                <div className="text-xs font-bold text-slate-900 line-clamp-1">{design.title}</div>
                <div className="text-[10px] text-[#b89047] font-semibold uppercase tracking-wider mt-1">{design.category}</div>
              </td>

              {/* Plot Size */}
              <td className="px-6 py-4">
                <div className="text-xs font-semibold text-slate-800">{design.plotWidthFt}x{design.plotLengthFt} ft</div>
                <div className="text-[10px] text-stone-400 font-semibold mt-1">{design.plotAreaSqft.toLocaleString()} SQ.FT</div>
              </td>

              {/* Specs */}
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 bg-stone-50 border border-stone-200 text-stone-600 rounded-md text-[9px] font-bold uppercase tracking-wider">
                    {design.bhk} BHK
                  </span>
                  <span className="px-2 py-0.5 bg-stone-50 border border-stone-200 text-stone-600 rounded-md text-[9px] font-bold uppercase tracking-wider">
                    {design.floors} Flr
                  </span>
                  <span className="px-2 py-0.5 bg-stone-50 border border-stone-200 text-stone-600 rounded-md text-[9px] font-bold uppercase tracking-wider">
                    {design.facing}
                  </span>
                </div>
              </td>

              {/* Price */}
              <td className="px-6 py-4 text-xs font-bold text-slate-900">
                {formatPrice(design.priceInr)}
              </td>

              {/* Status */}
              <td className="px-6 py-4">
                {design.status === "PUBLISHED" && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-250/20 rounded-md text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5">
                    Published
                  </Badge>
                )}
                {design.status === "DRAFT" && (
                  <Badge variant="outline" className="bg-stone-50 text-stone-700 border-stone-250/20 rounded-md text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5">
                    Draft
                  </Badge>
                )}
                {design.status === "ARCHIVED" && (
                  <Badge variant="outline" className="bg-rose-50 text-rose-800 border-rose-250/20 rounded-md text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5">
                    Archived
                  </Badge>
                )}
              </td>

              {/* Actions */}
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  {/* View public page */}
                  <Link
                    href={`/designs/${design.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View Public Page"
                    className={buttonVariants({ variant: "ghost", size: "icon", className: "text-stone-400 hover:text-slate-900 hover:bg-stone-50 rounded-lg w-8 h-8" })}
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {/* Edit Price (modal) */}
                  <button
                    onClick={() => setEditingDesign(design)}
                    title="Edit Price & Status"
                    className={buttonVariants({ variant: "ghost", size: "icon", className: "text-[#b89047] hover:text-[#c5a880] hover:bg-stone-50 rounded-lg w-8 h-8" })}
                  >
                    <Tag className="w-4 h-4" />
                  </button>

                  {/* Full Edit */}
                  <Link
                    href={`/admin/designs/${design.id}/edit`}
                    title="Full Edit"
                    className={buttonVariants({ variant: "ghost", size: "icon", className: "text-slate-500 hover:text-slate-900 hover:bg-stone-50 rounded-lg w-8 h-8" })}
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </>
  );
}