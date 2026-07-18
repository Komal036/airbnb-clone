import { Star } from "lucide-react";

export default function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(rating) ? "fill-ink text-ink" : "fill-gray-200 text-gray-200"}
        />
      ))}
    </div>
  );
}
