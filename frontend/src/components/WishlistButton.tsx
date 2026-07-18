"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "./ToastProvider";

export default function WishlistButton({
  listingId,
  initiallyWishlisted,
  className = "",
}: {
  listingId: number;
  initiallyWishlisted: boolean;
  className?: string;
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [wishlisted, setWishlisted] = useState(initiallyWishlisted);
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast("Log in to save listings to your wishlist", "info");
      return;
    }
    if (busy) return;
    setBusy(true);
    const next = !wishlisted;
    setWishlisted(next); // optimistic
    try {
      if (next) {
        await api.post("/wishlist", { user_id: user.id, listing_id: listingId });
      } else {
        await api.delete(`/wishlist?user_id=${user.id}&listing_id=${listingId}`);
      }
    } catch {
      setWishlisted(!next); // revert on failure
      showToast("Something went wrong, try again", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={`p-1.5 rounded-full hover:scale-110 transition-transform ${className}`}
    >
      <Heart
        size={22}
        className={wishlisted ? "fill-rausch text-rausch" : "fill-black/30 text-white"}
        strokeWidth={1.5}
      />
    </button>
  );
}
