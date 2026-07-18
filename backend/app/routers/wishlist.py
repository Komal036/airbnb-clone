from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


@router.post("")
def add_to_wishlist(payload: schemas.WishlistIn, db: Session = Depends(get_db)):
    existing = (
        db.query(models.Wishlist)
        .filter(models.Wishlist.user_id == payload.user_id, models.Wishlist.listing_id == payload.listing_id)
        .first()
    )
    if existing:
        return {"detail": "Already wishlisted"}

    listing = db.query(models.Listing).get(payload.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    db.add(models.Wishlist(user_id=payload.user_id, listing_id=payload.listing_id))
    db.commit()
    return {"detail": "Added to wishlist"}


@router.delete("")
def remove_from_wishlist(user_id: int, listing_id: int, db: Session = Depends(get_db)):
    item = (
        db.query(models.Wishlist)
        .filter(models.Wishlist.user_id == user_id, models.Wishlist.listing_id == listing_id)
        .first()
    )
    if item:
        db.delete(item)
        db.commit()
    return {"detail": "Removed from wishlist"}
