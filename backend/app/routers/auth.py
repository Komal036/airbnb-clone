"""
Auth is intentionally simple, per the assignment brief ("real user
authentication may be simplified/mocked, but a notion of guest vs
host is needed"). There's no JWT/session cookie - login just checks
the email + password against the users table and returns the user
object. The frontend keeps that user in localStorage and sends the
user's id along with requests that need to know who's asking
(creating a listing, booking, wishlisting).

This is fine for a take-home demo. In a real product this would be
replaced with hashed passwords + signed tokens.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=schemas.UserOut)
def signup(payload: schemas.SignupIn, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user = models.User(name=payload.name, email=payload.email, password=payload.password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.UserOut)
def login(payload: schemas.LoginIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or user.password != payload.password:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return user


@router.get("/users/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
