from sqlalchemy import Column, Integer, String, ForeignKey, LargeBinary, Enum
from .database import Base
from sqlalchemy.types import JSON


class Event(Base):
    __tablename__ = "events"

    # Required fields
    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String, nullable=False)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    location = Column(String, nullable=False)

    description = Column(String, nullable=True)
    judging_type = Column(String, nullable=True)
    audience_weight = Column(Integer, nullable=True)
    expert_weight = Column(Integer, nullable=True)
    athlete_weight = Column(Integer, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "event_name": self.event_name,
            "date": self.date,
            "time": self.time,
            "location": self.location,
            "description": self.description,
            "judging_type": self.judging_type,
            "audience_weight": self.audience_weight,
            "expert_weight": self.expert_weight,
            "athlete_weight": self.athlete_weight
        }


class EventImage(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    image = Column(LargeBinary, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "event_id": self.event_id
            # "image": self.image
        }
