export interface UserOut {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  is_superhost: boolean;
}

export interface PhotoOut {
  id: number;
  url: string;
  position: number;
}

export interface AmenityOut {
  id: number;
  name: string;
  icon: string | null;
}

export interface ListingCard {
  id: number;
  title: string;
  property_type: string;
  city: string;
  state: string | null;
  country: string;
  price_per_night: number;
  cover_photo: string | null;
  rating: number;
  review_count: number;
  is_wishlisted: boolean;
}

export interface ListingDetail {
  id: number;
  title: string;
  description: string;
  property_type: string;
  city: string;
  state: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  price_per_night: number;
  cleaning_fee: number;
  service_fee_pct: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  host: UserOut;
  photos: PhotoOut[];
  amenities: AmenityOut[];
  rating: number;
  review_count: number;
  is_wishlisted: boolean;
}

export interface PaginatedListings {
  items: ListingCard[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BookingOut {
  id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  nightly_rate: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: string;
  created_at: string;
  listing: ListingCard;
}

export interface ReviewOut {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  guest: UserOut;
}

export interface AvailabilityOut {
  booked_ranges: { check_in: string; check_out: string }[];
}
