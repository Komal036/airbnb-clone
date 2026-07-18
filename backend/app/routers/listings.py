from datetime import date
from math import ceil
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas, utils
from ..database import get_db

router = APIRouter(prefix="/listings", tags=["listings"])


def _base_query(db: Session):
    return db.query(models.Listing).options(
        joinedload(models.Listing.photos),
        joinedload(models.Listing.amenities),
        joinedload(models.Listing.reviews),
        joinedload(models.Listing.host),
    ).filter(models.Listing.is_active == True)  # noqa: E712


@router.get("", response_model=schemas.PaginatedListings)
def search_listings(
    db: Session = Depends(get_db),
    location: Optional[str] = Query(None, description="Matches city, state or country"),
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    guests: Optional[int] = Query(None, ge=1),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    property_type: Optional[str] = None,
    amenities: Optional[str] = Query(None, description="Comma-separated amenity names"),
    user_id: Optional[int] = Query(None, description="Used to flag wishlisted listings"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=48),
):
    q = _base_query(db)

    if location:
        like = f"%{location}%"
        q = q.filter(
            (models.Listing.city.ilike(like))
            | (models.Listing.state.ilike(like))
            | (models.Listing.country.ilike(like))
        )
    if guests:
        q = q.filter(models.Listing.max_guests >= guests)
    if min_price is not None:
        q = q.filter(models.Listing.price_per_night >= min_price)
    if max_price is not None:
        q = q.filter(models.Listing.price_per_night <= max_price)
    if property_type:
        q = q.filter(models.Listing.property_type == property_type)
    if amenities:
        names = [a.strip() for a in amenities.split(",") if a.strip()]
        for name in names:
            q = q.filter(models.Listing.amenities.any(models.Amenity.name == name))

    if check_in and check_out:
        if check_in >= check_out:
            raise HTTPException(status_code=400, detail="check_out must be after check_in")
        # Exclude listings that have a confirmed booking overlapping the requested range
        conflicting = (
            db.query(models.Booking.listing_id)
            .filter(
                models.Booking.status == "confirmed",
                models.Booking.check_in < check_out,
                models.Booking.check_out > check_in,
            )
            .subquery()
        )
        q = q.filter(~models.Listing.id.in_(conflicting))

    total = q.count()
    total_pages = max(1, ceil(total / page_size))
    listings = q.order_by(models.Listing.id).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [utils.to_card(l, db, user_id) for l in listings],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get("/property-types")
def property_types(db: Session = Depends(get_db)):
    rows = db.query(models.Listing.property_type).distinct().all()
    return sorted({r[0] for r in rows})


@router.get("/{listing_id}", response_model=schemas.ListingDetailOut)
def get_listing(listing_id: int, user_id: Optional[int] = None, db: Session = Depends(get_db)):
    listing = _base_query(db).filter(models.Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return utils.to_detail(listing, db, user_id)


@router.get("/{listing_id}/availability", response_model=schemas.AvailabilityOut)
def get_availability(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(models.Listing).get(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    bookings = (
        db.query(models.Booking)
        .filter(models.Booking.listing_id == listing_id, models.Booking.status == "confirmed")
        .all()
    )
    return {"booked_ranges": [{"check_in": b.check_in, "check_out": b.check_out} for b in bookings]}


def _apply_amenities(db: Session, listing: models.Listing, names: list[str]):
    listing.amenities = []
    for name in names:
        amenity = db.query(models.Amenity).filter(models.Amenity.name == name).first()
        if not amenity:
            amenity = models.Amenity(name=name)
            db.add(amenity)
            db.flush()
        listing.amenities.append(amenity)


@router.post("", response_model=schemas.ListingDetailOut)
def create_listing(
    payload: schemas.ListingCreateIn,
    host_id: int = Query(..., description="Id of the user creating this listing"),
    db: Session = Depends(get_db),
):
    host = db.query(models.User).get(host_id)
    if not host:
        raise HTTPException(status_code=404, detail="Host user not found")

    listing = models.Listing(
        host_id=host_id,
        title=payload.title,
        description=payload.description,
        property_type=payload.property_type,
        city=payload.city,
        state=payload.state,
        country=payload.country,
        latitude=payload.latitude,
        longitude=payload.longitude,
        price_per_night=payload.price_per_night,
        cleaning_fee=payload.cleaning_fee,
        max_guests=payload.max_guests,
        bedrooms=payload.bedrooms,
        beds=payload.beds,
        bathrooms=payload.bathrooms,
    )
    db.add(listing)
    db.flush()  # get listing.id before attaching children

    for i, url in enumerate(payload.photo_urls):
        db.add(models.ListingPhoto(listing_id=listing.id, url=url, position=i))
    _apply_amenities(db, listing, payload.amenity_names)

    db.commit()
    db.refresh(listing)
    return utils.to_detail(listing, db, host_id)


@router.put("/{listing_id}", response_model=schemas.ListingDetailOut)
def update_listing(
    listing_id: int,
    payload: schemas.ListingUpdateIn,
    host_id: int = Query(..., description="Must match the listing's host"),
    db: Session = Depends(get_db),
):
    listing = db.query(models.Listing).get(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != host_id:
        raise HTTPException(status_code=403, detail="Only the host who owns this listing can edit it")

    data = payload.model_dump(exclude_unset=True, exclude={"photo_urls", "amenity_names"})
    for field, value in data.items():
        setattr(listing, field, value)

    if payload.photo_urls is not None:
        listing.photos = []
        db.flush()
        for i, url in enumerate(payload.photo_urls):
            db.add(models.ListingPhoto(listing_id=listing.id, url=url, position=i))

    if payload.amenity_names is not None:
        _apply_amenities(db, listing, payload.amenity_names)

    db.commit()
    db.refresh(listing)
    return utils.to_detail(listing, db, host_id)


@router.delete("/{listing_id}")
def delete_listing(listing_id: int, host_id: int = Query(...), db: Session = Depends(get_db)):
    listing = db.query(models.Listing).get(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != host_id:
        raise HTTPException(status_code=403, detail="Only the host who owns this listing can delete it")

    db.delete(listing)
    db.commit()
    return {"detail": "Listing deleted"}
