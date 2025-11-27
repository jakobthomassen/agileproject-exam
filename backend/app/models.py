from sqlalchemy import Column, Integer, String, Float
from .db import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False)
    scoring_audience = Column(Float, nullable=False)
    scoring_judge = Column(Float, nullable=False)
    participant_count = Column(Integer, nullable=False)
    sponsor = Column(String, nullable=True)
