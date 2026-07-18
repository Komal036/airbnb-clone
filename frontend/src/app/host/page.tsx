"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { BookingOut, ListingCard as ListingCardType } from "@/lib/types";
import { formatDateRange, formatPrice, locationLabel } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ToastProvider";

export default function HostDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [listings, setListings] = useState<ListingCardType[] | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [bookings, setBookings] = useState<Record<number, BookingOut[]>>({});

  function loadListings() {
    if (!user) return;
    api.get<ListingCardType[]>(`/users/${user.id}/listings`).then(setListings).catch(() => setListings([]));
  }

  useEffect(loadListings, [user]);

  async function toggleBookings(listingId: number) {
    if (expanded === listingId) {
      setExpanded(null);
      return;
    }
    setExpanded(listingId);
    if (!bookings[listingId] && user) {
      const data = await api.get<BookingOut[]>(`/bookings/listing/${listingId}?host_id=${user.id}`);
      setBookings((prev) => ({ ...prev, [listingId]: data }));
    }
  }

  async function deleteListing(id: number) {
    if (!user) return;
    if (!confirm("Delete this listing? This can't be undone.")) return;
    try {
      await api.delete(`/listings/${id}?host_id=${user.id}`);
      showToast("Listing deleted", "success");
      loadListings();
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Couldn't delete this listing", "error");
    }
  }

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="text-lg font-medium text-ink mb-2">Log in to manage your listings</p>
        <Link href="/login" className="text-rausch underline text-sm">Log in</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">Your listings</h1>
        <Link
          href="/host/new"
          className="flex items-center gap-2 bg-rausch hover:bg-rausch-dark text-white font-medium text-sm px-4 py-2.5 rounded-lg"
        >
          <Plus size={16} /> Create listing
        </Link>
      </div>

      {listings === null && <p className="text-graytext">Loading...</p>}

      {listings !== null && listings.length === 0 && (
        <div className="text-center py-24">
          <p className="font-medium text-ink mb-2">You're not hosting any listings yet</p>
          <Link href="/host/new" className="text-rausch underline text-sm">Create your first listing</Link>
        </div>
      )}

      <div className="space-y-4">
        {listings?.map((listing) => (
          <div key={listing.id} className="border border-hairline rounded-xl2 overflow-hidden">
            <div className="flex gap-4 p-4">
              <div className="relative w-32 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {listing.cover_photo && (
                  <Image src={listing.cover_photo} alt={listing.title} fill sizes="128px" className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink truncate">{listing.title}</p>
                <p className="text-sm text-graytext">{locationLabel(listing.city, listing.state, listing.country)}</p>
                <p className="text-sm text-ink mt-1">{formatPrice(listing.price_per_night)} / night</p>
              </div>
              <div className="flex flex-col gap-2 items-end shrink-0">
                <div className="flex gap-2">
                  <Link href={`/host/${listing.id}/edit`} className="p-2 border border-hairline rounded-full hover:border-ink" aria-label="Edit">
                    <Pencil size={14} />
                  </Link>
                  <button onClick={() => deleteListing(listing.id)} className="p-2 border border-hairline rounded-full hover:border-rausch hover:text-rausch" aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
                <button
                  onClick={() => toggleBookings(listing.id)}
                  className="flex items-center gap-1 text-xs font-medium text-ink underline"
                >
                  Bookings {expanded === listing.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>
            </div>

            {expanded === listing.id && (
              <div className="border-t border-hairline bg-gray-50 p-4">
                {!bookings[listing.id] && <p className="text-sm text-graytext">Loading bookings...</p>}
                {bookings[listing.id]?.length === 0 && <p className="text-sm text-graytext">No bookings yet for this listing.</p>}
                <div className="space-y-2">
                  {bookings[listing.id]?.map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-sm bg-white border border-hairline rounded-lg px-3 py-2">
                      <span className="text-ink">{formatDateRange(b.check_in, b.check_out)}</span>
                      <span className="text-graytext">{b.guests} guest{b.guests > 1 ? "s" : ""}</span>
                      <span className="text-ink font-medium">{formatPrice(b.total_price)}</span>
                      <span className="text-xs text-graytext capitalize">{b.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
