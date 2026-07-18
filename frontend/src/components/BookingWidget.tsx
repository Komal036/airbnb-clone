"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { AvailabilityOut, ListingDetail } from "@/lib/types";
import { formatPrice, nightsBetween } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "./ToastProvider";

function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd;
}

export default function BookingWidget({ listing }: { listing: ListingDetail }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [booked, setBooked] = useState<AvailabilityOut["booked_ranges"]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    api
      .get<AvailabilityOut>(`/listings/${listing.id}/availability`)
      .then((r) => setBooked(r.booked_ranges))
      .catch(() => setBooked([]));
  }, [listing.id]);

  const nights = checkIn && checkOut ? Math.max(0, nightsBetween(checkIn, checkOut)) : 0;
  const subtotal = nights * listing.price_per_night;
  const serviceFee = Math.round(subtotal * listing.service_fee_pct * 100) / 100;
  const total = Math.round((subtotal + listing.cleaning_fee + serviceFee) * 100) / 100;

  function validateDates(inDate: string, outDate: string): string {
    if (!inDate || !outDate) return "";
    if (inDate >= outDate) return "Check-out must be after check-in";
    const conflict = booked.some((b) => rangesOverlap(inDate, outDate, b.check_in, b.check_out));
    if (conflict) return "Those dates overlap with an existing booking";
    return "";
  }

  function onDatesChange(nextIn: string, nextOut: string) {
    setCheckIn(nextIn);
    setCheckOut(nextOut);
    setDateError(validateDates(nextIn, nextOut));
  }

  async function handleReserve() {
    if (!user) {
      showToast("Log in to book this stay", "info");
      router.push("/login");
      return;
    }
    const err = validateDates(checkIn, checkOut);
    if (err || !checkIn || !checkOut) {
      setDateError(err || "Choose your check-in and check-out dates");
      return;
    }
    if (guests > listing.max_guests) {
      showToast(`This listing sleeps a maximum of ${listing.max_guests} guests`, "error");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/bookings", {
        listing_id: listing.id,
        guest_id: user.id,
        check_in: checkIn,
        check_out: checkOut,
        guests,
      });
      showToast("Booking confirmed! Check My Trips for details.", "success");
      router.push("/trips");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        showToast("Those dates were just booked by someone else - try different dates", "error");
        api.get<AvailabilityOut>(`/listings/${listing.id}/availability`).then((r) => setBooked(r.booked_ranges));
      } else {
        showToast(e instanceof ApiError ? e.message : "Couldn't complete the booking", "error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border border-hairline rounded-xl2 shadow-card p-6 sticky top-24">
      <div className="flex items-baseline justify-between mb-4">
        <p className="text-lg">
          <span className="font-semibold text-ink">{formatPrice(listing.price_per_night)}</span>{" "}
          <span className="text-graytext text-sm">night</span>
        </p>
        {listing.review_count > 0 && (
          <span className="flex items-center gap-1 text-sm text-ink">
            <Star size={13} className="fill-ink" />
            {listing.rating.toFixed(1)} · {listing.review_count} review{listing.review_count === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="border border-hairline rounded-lg overflow-hidden mb-3">
        <div className="grid grid-cols-2 divide-x divide-hairline">
          <div className="px-3 py-2">
            <label className="block text-[10px] font-semibold text-ink uppercase">Check-in</label>
            <input
              type="date"
              value={checkIn}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => onDatesChange(e.target.value, checkOut)}
              className="w-full text-sm outline-none"
            />
          </div>
          <div className="px-3 py-2">
            <label className="block text-[10px] font-semibold text-ink uppercase">Checkout</label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || new Date().toISOString().slice(0, 10)}
              onChange={(e) => onDatesChange(checkIn, e.target.value)}
              className="w-full text-sm outline-none"
            />
          </div>
        </div>
        <div className="border-t border-hairline px-3 py-2">
          <label className="block text-[10px] font-semibold text-ink uppercase">Guests</label>
          <input
            type="number"
            min={1}
            max={listing.max_guests}
            value={guests}
            onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
            className="w-full text-sm outline-none"
          />
        </div>
      </div>

      {dateError && <p className="text-xs text-rausch mb-3">{dateError}</p>}

      <button
        onClick={handleReserve}
        disabled={submitting}
        className="w-full bg-rausch hover:bg-rausch-dark disabled:opacity-60 text-white font-semibold rounded-lg py-3 transition-colors"
      >
        {submitting ? "Booking..." : "Reserve"}
      </button>

      <p className="text-center text-xs text-graytext mt-3">You won&apos;t be charged yet</p>

      {nights > 0 && (
        <div className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between text-ink">
            <span className="underline">
              {formatPrice(listing.price_per_night)} x {nights} night{nights > 1 ? "s" : ""}
            </span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {listing.cleaning_fee > 0 && (
            <div className="flex justify-between text-ink">
              <span className="underline">Cleaning fee</span>
              <span>{formatPrice(listing.cleaning_fee)}</span>
            </div>
          )}
          <div className="flex justify-between text-ink">
            <span className="underline">Service fee</span>
            <span>{formatPrice(serviceFee)}</span>
          </div>
          <div className="flex justify-between font-semibold text-ink pt-3 border-t border-hairline">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
