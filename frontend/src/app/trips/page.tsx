"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Luggage } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { BookingOut } from "@/lib/types";
import { formatDateRange, formatPrice, locationLabel } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ToastProvider";

export default function TripsPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [trips, setTrips] = useState<BookingOut[] | null>(null);

  useEffect(() => {
    if (!user) return;
    api
      .get<BookingOut[]>(`/bookings/user/${user.id}`)
      .then(setTrips)
      .catch(() => setTrips([]));
  }, [user]);

  async function cancelTrip(id: number) {
    if (!user) return;
    try {
      await api.post(`/bookings/${id}/cancel?guest_id=${user.id}`);
      setTrips((prev) => prev && prev.map((t) => (t.id === id ? { ...t, status: "cancelled" } : t)));
      showToast("Booking cancelled", "success");
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Couldn't cancel this booking", "error");
    }
  }

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="text-lg font-medium text-ink mb-2">Log in to see your trips</p>
        <Link href="/login" className="text-rausch underline text-sm">Log in</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-ink mb-6">My trips</h1>

      {trips === null && <p className="text-graytext">Loading...</p>}

      {trips !== null && trips.length === 0 && (
        <div className="text-center py-24 flex flex-col items-center gap-3">
          <Luggage size={40} className="text-graytext" />
          <p className="font-medium text-ink">No trips booked yet</p>
          <Link href="/" className="text-rausch underline text-sm">Start exploring</Link>
        </div>
      )}

      <div className="space-y-4">
        {trips?.map((trip) => (
          <div key={trip.id} className="flex gap-4 border border-hairline rounded-xl2 p-4">
            <Link href={`/listings/${trip.listing.id}`} className="relative w-32 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
              {trip.listing.cover_photo && (
                <Image src={trip.listing.cover_photo} alt={trip.listing.title} fill sizes="128px" className="object-cover" />
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link href={`/listings/${trip.listing.id}`} className="font-medium text-ink hover:underline">
                    {trip.listing.title}
                  </Link>
                  <p className="text-sm text-graytext">
                    {locationLabel(trip.listing.city, trip.listing.state, trip.listing.country)}
                  </p>
                </div>
                <StatusBadge status={trip.status} />
              </div>
              <p className="text-sm text-ink mt-2">{formatDateRange(trip.check_in, trip.check_out)}</p>
              <p className="text-sm text-graytext">
                {trip.guests} guest{trip.guests > 1 ? "s" : ""} · {formatPrice(trip.total_price)} total
              </p>
              {trip.status === "confirmed" && (
                <button
                  onClick={() => cancelTrip(trip.id)}
                  className="text-xs font-medium text-graytext underline mt-2 hover:text-rausch"
                >
                  Cancel booking
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-gray-100 text-graytext",
    completed: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${styles[status] || "bg-gray-100 text-graytext"}`}>
      {status[0].toUpperCase() + status.slice(1)}
    </span>
  );
}
