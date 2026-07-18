"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Grid2X2 } from "lucide-react";
import { PhotoOut } from "@/lib/types";

export default function PhotoGallery({ photos, title }: { photos: PhotoOut[]; title: string }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return <div className="aspect-[16/7] bg-gray-200 rounded-xl2" />;
  }

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-xl2 overflow-hidden h-[420px] relative">
        <button className="col-span-2 row-span-2 relative" onClick={() => openAt(0)}>
          <Image src={photos[0].url} alt={title} fill sizes="50vw" className="object-cover hover:brightness-90 transition" />
        </button>
        {photos.slice(1, 5).map((p, i) => (
          <button key={p.id} className="relative" onClick={() => openAt(i + 1)}>
            <Image src={p.url} alt={title} fill sizes="25vw" className="object-cover hover:brightness-90 transition" />
          </button>
        ))}
        {photos.length > 1 && (
          <button
            onClick={() => openAt(0)}
            className="absolute bottom-4 right-4 bg-white border border-ink text-ink text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 shadow-soft hover:bg-gray-50"
          >
            <Grid2X2 size={16} /> Show all photos
          </button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 bg-white z-[200] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
            <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
            <span className="text-sm text-graytext">
              {index + 1} / {photos.length}
            </span>
          </div>
          <div className="flex-1 relative flex items-center justify-center px-4">
            <button
              onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
              className="absolute left-4 p-2 rounded-full border border-hairline bg-white hover:bg-gray-50 z-10"
              aria-label="Previous photo"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="relative w-full h-full max-w-4xl">
              <Image src={photos[index].url} alt={title} fill sizes="80vw" className="object-contain" />
            </div>
            <button
              onClick={() => setIndex((i) => (i + 1) % photos.length)}
              className="absolute right-4 p-2 rounded-full border border-hairline bg-white hover:bg-gray-50 z-10"
              aria-label="Next photo"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
