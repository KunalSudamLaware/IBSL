"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";

interface Image {
  id: string;
  url: string;
  altText: string | null;
}

interface Props {
  images: Image[];
}

export function ImageGallery({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!images?.length) {
    return (
      <div className="aspect-[4/3] bg-stone-50 flex items-center justify-center rounded-lg border border-stone-200">
        <span className="text-stone-400 text-xs font-semibold uppercase tracking-wider">No images available</span>
      </div>
    );
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Main Image */}
        <div 
          className="group relative aspect-[4/3] bg-stone-50 rounded-lg overflow-hidden border border-stone-200 cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={images[activeIndex].url} 
            alt={images[activeIndex].altText || "Design Preview"} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity pointer-events-none">
            <span className="bg-white/95 text-slate-900 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest shadow-xl flex items-center gap-2">
              <Maximize2 className="w-4 h-4" /> Expand Gallery
            </span>
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "relative shrink-0 w-24 h-18 rounded-lg overflow-hidden border-2 transition-all duration-200 bg-stone-50",
                  activeIndex === idx ? "border-[#b89047]" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 bg-black/95 border-none flex flex-col justify-center">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={images[activeIndex].url} 
              alt={images[activeIndex].altText || "Fullscreen preview"} 
              className="max-w-full max-h-full object-contain"
            />
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={handlePrev}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-[#b89047] text-white rounded-full transition-all"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                  onClick={handleNext}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-[#b89047] text-white rounded-full transition-all"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}