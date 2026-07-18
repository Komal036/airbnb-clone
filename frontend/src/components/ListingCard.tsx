"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { ListingCard as ListingCardType } from "@/lib/types";
import { formatPrice, locationLabel } from "@/lib/format";
import WishlistButton from "./WishlistButton";

export default function ListingCard({ listing }: { listing: ListingCardType }) {
  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="relative aspect-square rounded-xl2 overflow-hidden bg-gray-100">
        {listing.cover_photo ? (
          <Image
            src={listing.cover_photo}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        <WishlistButton
          listingId={listing.id}
          initiallyWishlisted={listing.is_wishlisted}
          className="absolute top-3 right-3"
        />
      </div>

      <div className="mt-2 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-ink truncate">{locationLabel(listing.city, listing.state, listing.country)}</p>
          {listing.review_count > 0 && (
            <span className="flex items-center gap-1 text-sm text-ink shrink-0">
              <Star size={13} className="fill-ink" />
              {listing.rating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="text-graytext text-sm truncate">{listing.property_type}</p>
        <p className="text-ink text-sm pt-1">
          <span className="font-semibold">{formatPrice(listing.price_per_night)}</span> night
        </p>
      </div>
    </Link>
  );
}
