from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas, utils
from ..database import get_db

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{user_id}/listings", response_model=list[schemas.ListingCardOut])
def host_listings(user_id: int, db: Session = Depends(get_db)):
    """Every listing this user hosts, including inactive ones -
    the host dashboard needs to show drafts/paused listings too,
    unlike the public explore grid."""
    listings = (
        db.query(models.Listing)
        .options(
            joinedload(models.Listing.photos),
            joinedload(models.Listing.reviews),
        )
        .filter(models.Listing.host_id == user_id)
        .order_by(models.Listing.created_at.desc())
        .all()
    )
    return [utils.to_card(l, db, user_id) for l in listings]


@router.get("/{user_id}/wishlist", response_model=list[schemas.ListingCardOut])
def wishlist(user_id: int, db: Session = Depends(get_db)):
    items = (
        db.query(models.Wishlist)
        .options(
            joinedload(models.Wishlist.listing).joinedload(models.Listing.photos),
            joinedload(models.Wishlist.listing).joinedload(models.Listing.reviews),
        )
        .filter(models.Wishlist.user_id == user_id)
        .all()
    )
    return [utils.to_card(item.listing, db, user_id) for item in items]
