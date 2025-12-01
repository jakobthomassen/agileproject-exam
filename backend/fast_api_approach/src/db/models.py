from sqlalchemy import Column, Integer, String
from database import Base
from sqlalchemy.types import DateTime
import enum

class EventStatus(enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    SUCCESS = "success"

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, index=True)
    title = Column(String, index=True)
    description = Column(String, index=True)
    date = Column(DateTime, index=True)
    location = Column(String, index=True)
    status = Column(enum.Enum(EventStatus), default=EventStatus.PENDING)