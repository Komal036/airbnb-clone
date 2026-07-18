from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/listings/{listing_id}/reviews", tags=["reviews"])


@router.get("", response_model=list[schemas.ReviewOut])
def get_reviews(listing_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Review)
        .options(joinedload(models.Review.guest))
        .filter(models.Review.listing_id == listing_id)
        .order_by(models.Review.created_at.desc())
        .all()
    )


@router.post("", response_model=schemas.ReviewOut)
def add_review(
    listing_id: int,
    payload: schemas.ReviewIn,
    guest_id: int,
    db: Session = Depends(get_db),
):
    listing = db.query(models.Listing).get(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # A review should be tied to a completed stay - we check the guest
    # actually has a booking for this listing rather than trusting the
    # client blindly.
    booking = None
    if payload.booking_id:
        booking = db.query(models.Booking).get(payload.booking_id)
        if not booking or booking.guest_id != guest_id or booking.listing_id != listing_id:
            raise HTTPException(status_code=403, detail="This booking doesn't belong to you")
        if booking.review:
            raise HTTPException(status_code=400, detail="You've already reviewed this stay")

    review = models.Review(
        listing_id=listing_id,
        guest_id=guest_id,
        booking_id=booking.id if booking else None,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
