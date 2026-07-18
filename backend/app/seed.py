"""
Seeds the database with hosts, guests, listings, photos, amenities,
a few bookings, and reviews, so the app is immediately usable after
setup instead of showing empty screens everywhere.

Run with:  python -m app.seed
Safe to re-run - it wipes and recreates all tables first.

Photos use picsum.photos with fixed seeds, so the same listing
always gets the same-looking placeholder images across runs.
"""

import random
from datetime import date, timedelta

from .database import Base, engine, SessionLocal
from . import models

random.seed(42)


def photo(seed: str, i: int) -> str:
    return f"https://picsum.photos/seed/{seed}-{i}/1024/768"


AMENITY_POOL = [
    ("Wifi", "wifi"),
    ("Kitchen", "chef-hat"),
    ("Free parking", "car"),
    ("Washer", "washing-machine"),
    ("Air conditioning", "wind"),
    ("Pool", "waves"),
    ("Hot tub", "droplets"),
    ("Dedicated workspace", "laptop"),
    ("TV", "tv"),
    ("Fireplace", "flame"),
    ("Pet friendly", "paw-print"),
    ("Gym", "dumbbell"),
    ("Beach access", "umbrella"),
    ("Mountain view", "mountain"),
    ("Breakfast included", "coffee"),
]

LISTINGS_DATA = [
    dict(title="Sunlit A-frame cabin in the pines", property_type="Cabin", city="Big Bear Lake", state="California", country="United States", price=189, guests=4, bedrooms=2, beds=3, baths=1),
    dict(title="Modern loft in the heart of downtown", property_type="Entire apartment", city="Austin", state="Texas", country="United States", price=142, guests=3, bedrooms=1, beds=1, baths=1),
    dict(title="Oceanfront villa with private beach steps", property_type="Villa", city="Goa", state="Goa", country="India", price=210, guests=8, bedrooms=4, beds=5, baths=3),
    dict(title="Cozy studio near Eiffel Tower", property_type="Entire apartment", city="Paris", state=None, country="France", price=165, guests=2, bedrooms=1, beds=1, baths=1),
    dict(title="Charming cottage with a garden view", property_type="Cottage", city="Cotswolds", state=None, country="United Kingdom", price=134, guests=4, bedrooms=2, beds=2, baths=1),
    dict(title="Minimalist treehouse retreat", property_type="Treehouse", city="Wayanad", state="Kerala", country="India", price=98, guests=2, bedrooms=1, beds=1, baths=1),
    dict(title="Skyline penthouse with wraparound terrace", property_type="Entire apartment", city="New York", state="New York", country="United States", price=340, guests=5, bedrooms=2, beds=3, baths=2),
    dict(title="Rustic farmhouse surrounded by vineyards", property_type="Farmhouse", city="Nashik", state="Maharashtra", country="India", price=112, guests=6, bedrooms=3, beds=4, baths=2),
    dict(title="Private room in a quiet artist's home", property_type="Private room", city="Lisbon", state=None, country="Portugal", price=54, guests=1, bedrooms=1, beds=1, baths=1),
    dict(title="Lakeside cabin with a canoe included", property_type="Cabin", city="Nainital", state="Uttarakhand", country="India", price=87, guests=4, bedrooms=2, beds=2, baths=1),
    dict(title="Desert dome under the stars", property_type="Unique stay", city="Jaisalmer", state="Rajasthan", country="India", price=121, guests=2, bedrooms=1, beds=1, baths=1),
    dict(title="Sleek high-rise apartment near the beach", property_type="Entire apartment", city="Miami", state="Florida", country="United States", price=198, guests=4, bedrooms=2, beds=2, baths=2),
    dict(title="Traditional houseboat on the backwaters", property_type="Houseboat", city="Alleppey", state="Kerala", country="India", price=156, guests=4, bedrooms=2, beds=2, baths=1),
    dict(title="Hillside bungalow with valley views", property_type="Bungalow", city="Manali", state="Himachal Pradesh", country="India", price=79, guests=5, bedrooms=3, beds=3, baths=2),
    dict(title="Chic Kyoto machiya near the old town", property_type="Entire house", city="Kyoto", state=None, country="Japan", price=176, guests=3, bedrooms=2, beds=2, baths=1),
    dict(title="Beachfront bamboo bungalow", property_type="Bungalow", city="Gokarna", state="Karnataka", country="India", price=68, guests=2, bedrooms=1, beds=1, baths=1),
]

REVIEW_COMMENTS = [
    "Exactly as pictured, and the host checked in without being intrusive.",
    "Great location, would book again in a heartbeat.",
    "Comfortable stay, a couple of small things could be improved but overall solid.",
    "Loved waking up to that view every morning.",
    "Check-in was smooth and the place was spotless.",
    "Quiet, clean, and close to everything we wanted to see.",
    "Host was super responsive whenever we had questions.",
    "Better than the photos honestly, will be back.",
]


def run():
    print("Dropping and recreating all tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    print("Creating amenities...")
    amenities = []
    for name, icon in AMENITY_POOL:
        a = models.Amenity(name=name, icon=icon)
        db.add(a)
        amenities.append(a)
    db.flush()

    print("Creating users...")
    hosts = [
        models.User(name="Priya Nair", email="priya@example.com", password="password123",
                     avatar_url=photo("host1", 0), bio="Hosting since 2019, I love showing guests the quiet side of every city.", is_superhost=True),
        models.User(name="Daniel Cohen", email="daniel@example.com", password="password123",
                     avatar_url=photo("host2", 0), bio="Architect by day, host by weekend.", is_superhost=True),
        models.User(name="Meera Iyer", email="meera@example.com", password="password123",
                     avatar_url=photo("host3", 0), bio="Third-generation innkeeper.", is_superhost=False),
        models.User(name="Tom Whitfield", email="tom@example.com", password="password123",
                     avatar_url=photo("host4", 0), bio="I restore old buildings and rent out the nicest ones.", is_superhost=False),
    ]
    guests = [
        models.User(name="Aarav Sharma", email="aarav@example.com", password="password123", avatar_url=photo("guest1", 0)),
        models.User(name="Sophia Turner", email="sophia@example.com", password="password123", avatar_url=photo("guest2", 0)),
        models.User(name="Kabir Malhotra", email="kabir@example.com", password="password123", avatar_url=photo("guest3", 0)),
    ]
    # Demo account - easy to remember for the interview/demo
    demo = models.User(name="Demo User", email="demo@example.com", password="demo1234", avatar_url=photo("demo", 0))

    for u in hosts + guests + [demo]:
        db.add(u)
    db.flush()

    print("Creating listings...")
    listings = []
    for i, data in enumerate(LISTINGS_DATA):
        host = hosts[i % len(hosts)]
        listing = models.Listing(
            host_id=host.id,
            title=data["title"],
            description=(
                f"A {data['property_type'].lower()} in {data['city']} that comfortably fits "
                f"{data['guests']} guests. Close to local cafes, markets, and the sights that "
                f"make {data['city']} worth visiting. Fully stocked kitchen, fast wifi, and a "
                f"host who's quick to respond if you need anything during your stay."
            ),
            property_type=data["property_type"],
            city=data["city"],
            state=data["state"],
            country=data["country"],
            latitude=round(random.uniform(-60, 60), 4),
            longitude=round(random.uniform(-160, 160), 4),
            price_per_night=data["price"],
            cleaning_fee=round(data["price"] * 0.15, 2),
            max_guests=data["guests"],
            bedrooms=data["bedrooms"],
            beds=data["beds"],
            bathrooms=data["baths"],
        )
        db.add(listing)
        db.flush()

        for p in range(5):
            db.add(models.ListingPhoto(listing_id=listing.id, url=photo(f"listing{i}", p), position=p))

        for a in random.sample(amenities, k=random.randint(4, 8)):
            listing.amenities.append(a)

        listings.append(listing)
    db.flush()

    print("Creating bookings and reviews...")
    today = date.today()
    for listing in listings:
        # A past (completed-feeling) booking with a review
        past_start = today - timedelta(days=random.randint(40, 120))
        past_end = past_start + timedelta(days=random.randint(2, 6))
        guest = random.choice(guests)
        nights = (past_end - past_start).days
        subtotal = nights * listing.price_per_night
        service_fee = round(subtotal * listing.service_fee_pct, 2)
        booking = models.Booking(
            listing_id=listing.id, guest_id=guest.id,
            check_in=past_start, check_out=past_end, guests=random.randint(1, listing.max_guests),
            nights=nights, nightly_rate=listing.price_per_night,
            cleaning_fee=listing.cleaning_fee, service_fee=service_fee,
            total_price=round(subtotal + listing.cleaning_fee + service_fee, 2),
            status="completed",
        )
        db.add(booking)
        db.flush()

        for _ in range(random.randint(1, 3)):
            reviewer = random.choice(guests)
            db.add(models.Review(
                listing_id=listing.id, guest_id=reviewer.id,
                booking_id=booking.id if reviewer.id == guest.id else None,
                rating=random.choice([4, 4, 5, 5, 5, 3]),
                comment=random.choice(REVIEW_COMMENTS),
            ))

        # An upcoming confirmed booking that blocks real dates on the calendar
        if random.random() < 0.6:
            future_start = today + timedelta(days=random.randint(10, 60))
            future_end = future_start + timedelta(days=random.randint(2, 5))
            f_nights = (future_end - future_start).days
            f_subtotal = f_nights * listing.price_per_night
            f_service = round(f_subtotal * listing.service_fee_pct, 2)
            db.add(models.Booking(
                listing_id=listing.id, guest_id=random.choice(guests).id,
                check_in=future_start, check_out=future_end, guests=random.randint(1, listing.max_guests),
                nights=f_nights, nightly_rate=listing.price_per_night,
                cleaning_fee=listing.cleaning_fee, service_fee=f_service,
                total_price=round(f_subtotal + listing.cleaning_fee + f_service, 2),
                status="confirmed",
            ))

    # Give the demo user a couple of wishlisted listings and one upcoming trip
    db.add(models.Wishlist(user_id=demo.id, listing_id=listings[2].id))
    db.add(models.Wishlist(user_id=demo.id, listing_id=listings[6].id))
    demo_start = today + timedelta(days=21)
    demo_end = demo_start + timedelta(days=4)
    demo_listing = listings[0]
    d_nights = (demo_end - demo_start).days
    d_subtotal = d_nights * demo_listing.price_per_night
    d_service = round(d_subtotal * demo_listing.service_fee_pct, 2)
    db.add(models.Booking(
        listing_id=demo_listing.id, guest_id=demo.id,
        check_in=demo_start, check_out=demo_end, guests=2,
        nights=d_nights, nightly_rate=demo_listing.price_per_night,
        cleaning_fee=demo_listing.cleaning_fee, service_fee=d_service,
        total_price=round(d_subtotal + demo_listing.cleaning_fee + d_service, 2),
        status="confirmed",
    ))

    db.commit()
    db.close()
    print(f"Seeded {len(listings)} listings, {len(hosts)} hosts, {len(guests) + 1} guests.")
    print("Demo login -> email: demo@example.com  password: demo1234")


if __name__ == "__main__":
    run()
