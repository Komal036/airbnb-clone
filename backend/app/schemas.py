"""
Pydantic schemas - these define what the API accepts and returns.
Kept separate from the SQLAlchemy models (models.py) on purpose: the
DB shape and the wire shape aren't always the same thing, and keeping
them apart makes it obvious which fields a client is actually allowed
to send.
"""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ---------- Users / auth ----------

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_superhost: bool


class SignupIn(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=4)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


# ---------- Amenities ----------

class AmenityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    icon: Optional[str] = None


# ---------- Photos ----------

class PhotoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    url: str
    position: int


# ---------- Reviews ----------

class ReviewIn(BaseModel):
    booking_id: Optional[int] = None
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    guest: UserOut


# ---------- Listings ----------

class ListingCardOut(BaseModel):
    """Slimmer shape used for the explore grid - no need to ship the
    full description / amenity list for every card."""
    id: int
    title: str
    property_type: str
    city: str
    state: Optional[str] = None
    country: str
    price_per_night: float
    cover_photo: Optional[str] = None
    rating: float
    review_count: int
    is_wishlisted: bool = False


class ListingDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: str
    property_type: str
    city: str
    state: Optional[str] = None
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_night: float
    cleaning_fee: float
    service_fee_pct: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float
    host: UserOut
    photos: list[PhotoOut]
    amenities: list[AmenityOut]
    rating: float
    review_count: int
    is_wishlisted: bool = False


class ListingCreateIn(BaseModel):
    title: str
    description: str
    property_type: str
    city: str
    state: Optional[str] = None
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_night: float = Field(gt=0)
    cleaning_fee: float = 0
    max_guests: int = Field(default=2, ge=1)
    bedrooms: int = Field(default=1, ge=0)
    beds: int = Field(default=1, ge=1)
    bathrooms: float = Field(default=1, ge=0.5)
    photo_urls: list[str] = []
    amenity_names: list[str] = []


class ListingUpdateIn(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    price_per_night: Optional[float] = Field(default=None, gt=0)
    cleaning_fee: Optional[float] = None
    max_guests: Optional[int] = Field(default=None, ge=1)
    bedrooms: Optional[int] = None
    beds: Optional[int] = None
    bathrooms: Optional[float] = None
    is_active: Optional[bool] = None
    photo_urls: Optional[list[str]] = None
    amenity_names: Optional[list[str]] = None


class PaginatedListings(BaseModel):
    items: list[ListingCardOut]
    total: int
    page: int
    page_size: int
    total_pages: int


# ---------- Bookings ----------

class BookingCreateIn(BaseModel):
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: int = Field(ge=1)


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    check_in: date
    check_out: date
    guests: int
    nights: int
    nightly_rate: float
    cleaning_fee: float
    service_fee: float
    total_price: float
    status: str
    created_at: datetime
    listing: ListingCardOut


class AvailabilityOut(BaseModel):
    booked_ranges: list[dict]


# ---------- Wishlist ----------

class WishlistIn(BaseModel):
    user_id: int
    listing_id: int
