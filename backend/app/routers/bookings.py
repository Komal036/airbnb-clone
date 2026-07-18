from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas, utils
from ..database import get_db

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=schemas.BookingOut)
def create_booking(payload: schemas.BookingCreateIn, db: Session = Depends(get_db)):
    if payload.check_in >= payload.check_out:
        raise HTTPException(status_code=400, detail="check_out must be after check_in")

    listing = db.query(models.Listing).get(payload.listing_id)
    if not listing or not listing.is_active:
        raise HTTPException(status_code=404, detail="Listing not found")

    guest = db.query(models.User).get(payload.guest_id)
    if not guest:
        raise HTTPException(status_code=404, detail="Guest user not found")

    if payload.guests > listing.max_guests:
        raise HTTPException(
            status_code=400,
            detail=f"This listing sleeps a maximum of {listing.max_guests} guests",
        )

    # The overlap check is the important bit here - two confirmed
    # bookings on the same listing must never share a night.
    existing = (
        db.query(models.Booking)
        .filter(models.Booking.listing_id == payload.listing_id, models.Booking.status == "confirmed")
        .all()
    )
    for b in existing:
        if utils.dates_overlap(payload.check_in, payload.check_out, b.check_in, b.check_out):
            raise HTTPException(
                status_code=409,
                detail="These dates are no longer available for this listing",
            )

    nights = (payload.check_out - payload.check_in).days
    subtotal = nights * listing.price_per_night
    service_fee = round(subtotal * listing.service_fee_pct, 2)
    total = round(subtotal + listing.cleaning_fee + service_fee, 2)

    booking = models.Booking(
        listing_id=listing.id,
        guest_id=guest.id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        guests=payload.guests,
        nights=nights,
        nightly_rate=listing.price_per_night,
        cleaning_fee=listing.cleaning_fee,
        service_fee=service_fee,
        total_price=total,
        status="confirmed",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _serialize(booking, db)


def _serialize(booking: models.Booking, db: Session) -> dict:
    """Builds the dict by hand rather than pydantic's model_validate on
    the ORM object, because the nested `listing` field needs computed
    values (rating, review_count) that don't exist as real columns."""
    listing = db.query(models.Listing).options(
        joinedload(models.Listing.photos), joinedload(models.Listing.reviews)
    ).get(booking.listing_id)
    return {
        "id": booking.id,
        "check_in": booking.check_in,
        "check_out": booking.check_out,
        "guests": booking.guests,
        "nights": booking.nights,
        "nightly_rate": booking.nightly_rate,
        "cleaning_fee": booking.cleaning_fee,
        "service_fee": booking.service_fee,
        "total_price": booking.total_price,
        "status": booking.status,
        "created_at": booking.created_at,
        "listing": utils.to_card(listing, db),
    }


@router.get("/user/{user_id}", response_model=list[schemas.BookingOut])
def my_trips(user_id: int, db: Session = Depends(get_db)):
    bookings = (
        db.query(models.Booking)
        .filter(models.Booking.guest_id == user_id)
        .order_by(models.Booking.check_in.desc())
        .all()
    )
    return [_serialize(b, db) for b in bookings]


@router.get("/listing/{listing_id}", response_model=list[schemas.BookingOut])
def listing_bookings(listing_id: int, host_id: int, db: Session = Depends(get_db)):
    listing = db.query(models.Listing).get(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != host_id:
        raise HTTPException(status_code=403, detail="Only the host can view this listing's bookings")

    bookings = (
        db.query(models.Booking)
        .filter(models.Booking.listing_id == listing_id)
        .order_by(models.Booking.check_in.desc())
        .all()
    )
    return [_serialize(b, db) for b in bookings]


@router.post("/{booking_id}/cancel", response_model=schemas.BookingOut)
def cancel_booking(booking_id: int, guest_id: int, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.guest_id != guest_id:
        raise HTTPException(status_code=403, detail="You can only cancel your own bookings")

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return _serialize(booking, db)
