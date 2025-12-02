from sqlalchemy import Column, Integer, String, DateTime, Enum
from .database import Base
import enum

# Enum for event status
# This defines the possible states an event can be in
class EventStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    SUCCESS = "success"

# Event model - represents an event in the database
# This is like a blueprint for the "events" table
class Event(Base):
    __tablename__ = "events"  # Name of the table in the database

    # Columns in the table
    id = Column(Integer, primary_key=True, index=True)  # Unique ID for each event
    customer_id = Column(String, index=True)  # Who created the event
    title = Column(String, index=True)  # Event title
    description = Column(String)  # Event description
    date = Column(String)  # Event date (stored as string for simplicity)
    location = Column(String)  # Event location
    status = Column(String, default=EventStatus.PENDING.value)  # Current status