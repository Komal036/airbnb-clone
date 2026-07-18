"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartCrack } from "lucide-react";
import { api } from "@/lib/api";
import { ListingCard as ListingCardType } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import ListingCard from "@/components/ListingCard";

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<ListingCardType[] | null>(null);

  useEffect(() => {
    if (!user) return;
    api.get<ListingCardType[]>(`/users/${user.id}/wishlist`).then(setItems).catch(() => setItems([]));
  }, [user]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="text-lg font-medium text-ink mb-2">Log in to see your wishlist</p>
        <Link href="/login" className="text-rausch underline text-sm">Log in</Link>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-10">
      <h1 className="text-2xl font-semibold text-ink mb-6">Wishlist</h1>

      {items === null && <p className="text-graytext">Loading...</p>}

      {items !== null && items.length === 0 && (
        <div className="text-center py-24 flex flex-col items-center gap-3">
          <HeartCrack size={40} className="text-graytext" />
          <p className="font-medium text-ink">No saved listings yet</p>
          <Link href="/" className="text-rausch underline text-sm">Start exploring</Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
        {items?.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
