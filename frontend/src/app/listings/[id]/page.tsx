"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Star, MapPin, BedDouble, Bath, Users, MessageCircle, BadgeCheck } from "lucide-react";
import { api } from "@/lib/api";
import { ListingDetail } from "@/lib/types";
import { locationLabel } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import PhotoGallery from "@/components/PhotoGallery";
import BookingWidget from "@/components/BookingWidget";
import ReviewsSection from "@/components/ReviewsSection";
import AmenityIcon from "@/components/AmenityIcon";
import WishlistButton from "@/components/WishlistButton";
import ComingSoonModal from "@/components/ComingSoonModal";
import StaticMapPlaceholder from "@/components/StaticMapPlaceholder";

export default function ListingDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);

  useEffect(() => {
    const query = user ? `?user_id=${user.id}` : "";
    api
      .get<ListingDetail>(`/listings/${params.id}${query}`)
      .then(setListing)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id, user]);

  if (loading) {
    return <div className="max-w-6xl mx-auto px-6 py-16 text-graytext">Loading...</div>;
  }
  if (notFound || !listing) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        <p className="text-lg font-medium text-ink">Listing not found</p>
        <p className="text-graytext text-sm mt-1">It may have been removed by the host.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-2">{listing.title}</h1>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-3 text-sm text-ink">
          {listing.review_count > 0 && (
            <span className="flex items-center gap-1">
              <Star size={13} className="fill-ink" />
              {listing.rating.toFixed(1)} · {listing.review_count} review{listing.review_count === 1 ? "" : "s"}
            </span>
          )}
          <span className="flex items-center gap-1 underline">
            <MapPin size={13} />
            {locationLabel(listing.city, listing.state, listing.country)}
          </span>
        </div>
        <WishlistButton listingId={listing.id} initiallyWishlisted={listing.is_wishlisted} className="border border-hairline" />
      </div>

      <PhotoGallery photos={listing.photos} title={listing.title} />

      <div className="grid md:grid-cols-3 gap-10 mt-8">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between pb-6 border-b border-hairline">
            <div>
              <p className="font-medium text-ink">
                {listing.property_type} hosted by {listing.host.name}
              </p>
              <p className="text-graytext text-sm mt-1">
                {listing.max_guests} guests · {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? "s" : ""} ·{" "}
                {listing.beds} bed{listing.beds !== 1 ? "s" : ""} · {listing.bathrooms} bath{listing.bathrooms !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => setMessageOpen(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-ink underline mt-2"
              >
                <MessageCircle size={14} /> Message host
              </button>
            </div>
            {listing.host.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.host.avatar_url} alt={listing.host.name} className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-200" />
            )}
          </div>

          <div className="py-6 border-b border-hairline flex gap-8 flex-wrap">
            <div className="flex items-center gap-3">
              <Users size={22} className="text-ink" />
              <div>
                <p className="text-sm font-medium text-ink">Sleeps {listing.max_guests}</p>
                <p className="text-xs text-graytext">Great for groups</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BedDouble size={22} className="text-ink" />
              <div>
                <p className="text-sm font-medium text-ink">{listing.beds} bed{listing.beds !== 1 ? "s" : ""}</p>
                <p className="text-xs text-graytext">{listing.bedrooms} bedroom{listing.bedrooms !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Bath size={22} className="text-ink" />
              <div>
                <p className="text-sm font-medium text-ink">{listing.bathrooms} bath{listing.bathrooms !== 1 ? "s" : ""}</p>
                <p className="text-xs text-graytext">Private</p>
              </div>
            </div>
          </div>

          <div className="py-6 border-b border-hairline">
            <p className="text-ink leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          {listing.host.bio && (
            <div className="py-6 border-b border-hairline">
              <p className="font-medium text-ink mb-1">About the host</p>
              <p className="text-graytext text-sm leading-relaxed">{listing.host.bio}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {listing.host.is_superhost && (
                  <span className="inline-block text-xs font-medium bg-rausch/10 text-rausch px-2 py-1 rounded">
                    Superhost
                  </span>
                )}
                <button
                  onClick={() => setIdentityOpen(true)}
                  className="flex items-center gap-1 text-xs font-medium text-graytext underline"
                >
                  <BadgeCheck size={13} /> Identity verification
                </button>
              </div>
            </div>
          )}

          <div className="py-6 border-b border-hairline">
            <p className="font-semibold text-ink mb-4">Where you&apos;ll be</p>
            <StaticMapPlaceholder
              latitude={listing.latitude}
              longitude={listing.longitude}
              locationLabel={locationLabel(listing.city, listing.state, listing.country)}
            />
          </div>

          <div className="py-6 border-b border-hairline">
            <p className="font-semibold text-ink mb-4">What this place offers</p>
            <div className="grid grid-cols-2 gap-y-3">
              {listing.amenities.map((a) => (
                <div key={a.id} className="flex items-center gap-3 text-ink text-sm">
                  <AmenityIcon icon={a.icon} />
                  {a.name}
                </div>
              ))}
            </div>
          </div>

          <ReviewsSection listingId={listing.id} rating={listing.rating} reviewCount={listing.review_count} />
        </div>

        <div>
          <BookingWidget listing={listing} />
        </div>
      </div>

      <ComingSoonModal
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        icon={MessageCircle}
        title="Messaging"
        description="Direct messaging between guests and hosts isn't built in this version - it's flagged as out of scope in the assignment brief."
      />
      <ComingSoonModal
        open={identityOpen}
        onClose={() => setIdentityOpen(false)}
        icon={BadgeCheck}
        title="Identity verification"
        description="ID verification for hosts and guests isn't implemented here - it's flagged as out of scope in the assignment brief."
      />
    </div>
  );
}
