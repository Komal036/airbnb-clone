"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter();
  const params = useSearchParams();

  function goTo(p: number) {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(p));
    router.push(`/?${next.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-2 py-10">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-full border border-hairline disabled:opacity-30 hover:border-ink"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="text-graytext">...</span>}
          <button
            onClick={() => goTo(p)}
            className={`w-9 h-9 rounded-full text-sm font-medium ${
              p === page ? "bg-ink text-white" : "hover:bg-gray-100 text-ink"
            }`}
          >
            {p}
          </button>
        </span>
      ))}

      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-full border border-hairline disabled:opacity-30 hover:border-ink"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
