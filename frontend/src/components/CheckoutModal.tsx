"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { ListingDetail } from "@/lib/types";
import { formatDateRange, formatPrice } from "@/lib/format";
import Modal from "./Modal";

interface CheckoutDetails {
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
}

export default function CheckoutModal({
  open,
  onClose,
  listing,
  guestId,
  details,
  onBookingConflict,
}: {
  open: boolean;
  onClose: () => void;
  listing: ListingDetail;
  guestId: number;
  details: CheckoutDetails;
  onBookingConflict: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"summary" | "confirmed">("summary");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleClose() {
    setStep("summary");
    setError("");
    onClose();
  }

  async function confirmAndPay() {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/bookings", {
        listing_id: listing.id,
        guest_id: guestId,
        check_in: details.checkIn,
        check_out: details.checkOut,
        guests: details.guests,
      });
      setStep("confirmed");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setError("Those dates were just booked by someone else. Close this and pick different dates.");
        onBookingConflict();
      } else {
        setError(e instanceof ApiError ? e.message : "Something went wrong completing this booking.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "confirmed") {
    return (
      <Modal open={open} onClose={handleClose} title="Booking confirmed">
        <div className="flex flex-col items-center text-center py-6 gap-3">
          <CheckCircle2 size={48} className="text-green-600" />
          <p className="font-semibold text-ink text-lg">You&apos;re all set!</p>
          <p className="text-sm text-graytext max-w-xs">
            Your stay at {listing.title} is confirmed for {formatDateRange(details.checkIn, details.checkOut)}.
          </p>
          <button
            onClick={() => {
              handleClose();
              router.push("/trips");
            }}
            className="mt-2 bg-rausch hover:bg-rausch-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg"
          >
            View my trips
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Confirm and pay" maxWidth="max-w-lg">
      <div className="space-y-5">
        <div className="flex gap-3 pb-4 border-b border-hairline">
          <div className="w-20 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
            {listing.photos[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.photos[0].url} alt={listing.title} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-ink text-sm truncate">{listing.title}</p>
            <p className="text-xs text-graytext">{listing.property_type}</p>
          </div>
        </div>

        <div>
          <p className="font-semibold text-ink mb-2">Your trip</p>
          <div className="flex justify-between text-sm text-ink mb-1">
            <span>Dates</span>
            <span>{formatDateRange(details.checkIn, details.checkOut)}</span>
          </div>
          <div className="flex justify-between text-sm text-ink">
            <span>Guests</span>
            <span>{details.guests} guest{details.guests > 1 ? "s" : ""}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-hairline">
          <p className="font-semibold text-ink mb-2">Price details</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-ink">
              <span>{formatPrice(listing.price_per_night)} x {details.nights} night{details.nights > 1 ? "s" : ""}</span>
              <span>{formatPrice(details.subtotal)}</span>
            </div>
            {details.cleaningFee > 0 && (
              <div className="flex justify-between text-ink">
                <span>Cleaning fee</span>
                <span>{formatPrice(details.cleaningFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink">
              <span>Service fee</span>
              <span>{formatPrice(details.serviceFee)}</span>
            </div>
            <div className="flex justify-between font-semibold text-ink pt-2 border-t border-hairline">
              <span>Total (USD)</span>
              <span>{formatPrice(details.total)}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-hairline">
          <p className="font-semibold text-ink mb-2 flex items-center gap-2">
            <CreditCard size={16} /> Payment method
          </p>
          <div className="border border-hairline rounded-lg p-3 space-y-2 bg-gray-50">
            <input disabled placeholder="Card number - 4242 4242 4242 4242" className="w-full bg-white border border-hairline rounded-md px-3 py-2 text-sm text-graytext" />
            <div className="flex gap-2">
              <input disabled placeholder="MM / YY" className="w-full bg-white border border-hairline rounded-md px-3 py-2 text-sm text-graytext" />
              <input disabled placeholder="CVC" className="w-full bg-white border border-hairline rounded-md px-3 py-2 text-sm text-graytext" />
            </div>
          </div>
          <p className="text-xs text-graytext mt-2 flex items-center gap-1.5">
            <ShieldCheck size={13} /> This checkout is mocked for the assignment - no card is charged and no real payment is processed.
          </p>
        </div>

        {error && <p className="text-sm text-rausch">{error}</p>}

        <button
          onClick={confirmAndPay}
          disabled={submitting}
          className="w-full bg-rausch hover:bg-rausch-dark disabled:opacity-60 text-white font-semibold rounded-lg py-3"
        >
          {submitting ? "Confirming..." : `Confirm and pay ${formatPrice(details.total)}`}
        </button>
      </div>
    </Modal>
  );
}
