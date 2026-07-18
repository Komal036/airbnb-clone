"""
Database engine + session setup for the app.

We use SQLite because the assignment asks for it and it needs zero
external setup - the whole DB is a single file (airbnb.db) that gets
created next to this file the first time the app runs.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'airbnb.db')}"

# check_same_thread=False is needed because FastAPI can talk to the
# same SQLite connection from different threads (SQLite itself is
# fine with this for our use case since each request gets its own
# session anyway).
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency - yields a session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
