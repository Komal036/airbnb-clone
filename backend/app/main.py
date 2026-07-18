from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import auth, listings, bookings, users, wishlist, reviews

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Airbnb Clone API",
    description="Backend for the Airbnb clone assignment - browse, search, book, and host listings.",
    version="1.0.0",
)

# Wide open CORS since this is a take-home demo hit from a Next.js
# dev server and later a deployed frontend on a different domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(users.router)
app.include_router(wishlist.router)
app.include_router(reviews.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "airbnb-clone-api"}
