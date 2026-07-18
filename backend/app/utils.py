"""Small helpers shared across routers - mostly turning a Listing ORM
object into the response shapes defined in schemas.py, since that
logic (rating average, cover photo, wishlist flag) is needed in more
than one place."""

from sqlalchemy.orm import Session
from . import models


def listing_rating(listing: models.Listing) -> tuple[float, int]:
    reviews = listing.reviews
    if not reviews:
        return 0.0, 0
    avg = sum(r.rating for r in reviews) / len(reviews)
    return round(avg, 2), len(reviews)


def is_wishlisted(db: Session, listing_id: int, user_id: int | None) -> bool:
    if not user_id:
        return False
    return (
        db.query(models.Wishlist)
        .filter(models.Wishlist.listing_id == listing_id, models.Wishlist.user_id == user_id)
        .first()
        is not None
    )


def to_card(listing: models.Listing, db: Session, user_id: int | None = None) -> dict:
    rating, count = listing_rating(listing)
    cover = listing.photos[0].url if listing.photos else None
    return {
        "id": listing.id,
        "title": listing.title,
        "property_type": listing.property_type,
        "city": listing.city,
        "state": listing.state,
        "country": listing.country,
        "price_per_night": listing.price_per_night,
        "cover_photo": cover,
        "rating": rating,
        "review_count": count,
        "is_wishlisted": is_wishlisted(db, listing.id, user_id),
    }


def to_detail(listing: models.Listing, db: Session, user_id: int | None = None) -> dict:
    rating, count = listing_rating(listing)
    return {
        "id": listing.id,
        "title": listing.title,
        "description": listing.description,
        "property_type": listing.property_type,
        "city": listing.city,
        "state": listing.state,
        "country": listing.country,
        "latitude": listing.latitude,
        "longitude": listing.longitude,
        "price_per_night": listing.price_per_night,
        "cleaning_fee": listing.cleaning_fee,
        "service_fee_pct": listing.service_fee_pct,
        "max_guests": listing.max_guests,
        "bedrooms": listing.bedrooms,
        "beds": listing.beds,
        "bathrooms": listing.bathrooms,
        "host": listing.host,
        "photos": listing.photos,
        "amenities": listing.amenities,
        "rating": rating,
        "review_count": count,
        "is_wishlisted": is_wishlisted(db, listing.id, user_id),
    }


def dates_overlap(a_start, a_end, b_start, b_end) -> bool:
    """Two [start, end) ranges overlap if one starts before the other ends,
    both ways. Checkout day itself is not blocked (same-day turnover is
    how Airbnb actually works), hence the half-open ranges."""
    return a_start < b_end and b_start < a_end
