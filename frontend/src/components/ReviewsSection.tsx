"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { BookingOut, ReviewOut } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "./ToastProvider";
import StarRating from "./StarRating";

export default function ReviewsSection({
  listingId,
  rating,
  reviewCount,
}: {
  listingId: number;
  rating: number;
  reviewCount: number;
}) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<ReviewOut[]>([]);
  const [eligibleBooking, setEligibleBooking] = useState<BookingOut | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<ReviewOut[]>(`/listings/${listingId}/reviews`).then(setReviews).catch(() => setReviews([]));
  }, [listingId]);

  useEffect(() => {
    if (!user) {
      setEligibleBooking(null);
      return;
    }
    api
      .get<BookingOut[]>(`/bookings/user/${user.id}`)
      .then((bookings) => {
        const match = bookings.find((b) => b.listing.id === listingId && b.status === "completed");
        setEligibleBooking(match || null);
      })
      .catch(() => setEligibleBooking(null));
  }, [user, listingId]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const created = await api.post<ReviewOut>(
        `/listings/${listingId}/reviews?guest_id=${user.id}`,
        { booking_id: eligibleBooking?.id, rating: newRating, comment }
      );
      setReviews((prev) => [created, ...prev]);
      setFormOpen(false);
      setComment("");
      showToast("Thanks for sharing your review!", "success");
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Couldn't submit your review", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="py-8 border-t border-hairline">
      <h2 className="text-xl font-semibold text-ink flex items-center gap-2 mb-6">
        <Star size={18} className="fill-ink" />
        {reviewCount > 0
          ? `${rating.toFixed(1)} · ${reviewCount} review${reviewCount === 1 ? "" : "s"}`
          : "No reviews yet"}
      </h2>

      {eligibleBooking && !formOpen && (
        <button
          onClick={() => setFormOpen(true)}
          className="mb-6 border border-ink text-ink text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          Leave a review for your stay
        </button>
      )}

      {formOpen && (
        <form onSubmit={submitReview} className="mb-8 border border-hairline rounded-xl2 p-5 space-y-3">
          <p className="font-medium text-ink">Rate your stay</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} onClick={() => setNewRating(n)}>
                <Star size={24} className={n <= newRating ? "fill-rausch text-rausch" : "fill-gray-200 text-gray-200"} />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details of your stay"
            rows={3}
            className="w-full border border-hairline rounded-lg px-3 py-2 text-sm outline-none focus:border-ink"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-ink text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit review"}
            </button>
            <button type="button" onClick={() => setFormOpen(false)} className="text-sm font-medium text-graytext">
              Cancel
            </button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-graytext text-sm">Be the first to review this stay after your trip.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
          {reviews.map((r) => (
            <div key={r.id}>
              <div className="flex items-center gap-3 mb-2">
                {r.guest.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.guest.avatar_url} alt={r.guest.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                )}
                <div>
                  <p className="font-medium text-ink text-sm">{r.guest.name}</p>
                  <p className="text-xs text-graytext">{new Date(r.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
                </div>
              </div>
              <StarRating rating={r.rating} size={12} />
              {r.comment && <p className="text-sm text-ink mt-2 leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
