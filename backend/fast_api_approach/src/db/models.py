from sqlalchemy import Column, Integer, String, ForeignKey, LargeBinary, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Event(Base):
    __tablename__ = "events"

    # Required fields
    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String, nullable=True)
    date = Column(String, nullable=True)
    time = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    end_time = Column(String, nullable=True)
    location = Column(String, nullable=True)

    description = Column(String, nullable=True)
    judging_type = Column(String, nullable=True)
    audience_weight = Column(Integer, nullable=True)
    expert_weight = Column(Integer, nullable=True)
    athlete_weight = Column(Integer, nullable=True)
    event_code = Column(String, nullable=True)
    status = Column(String, nullable=True, default="DRAFT")  # DRAFT, OPEN, FINISHED
    # back_populates matches the property name 'event' in ConversationModel below
    conversation_history = relationship("ConversationModel", back_populates="event", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "event_name": self.event_name,
            "date": self.date,
            "time": self.time,
            "end_date": self.end_date,
            "end_time": self.end_time,
            "location": self.location,
            "description": self.description,
            "judging_type": self.judging_type,
            "audience_weight": self.audience_weight,
            "expert_weight": self.expert_weight,
            "athlete_weight": self.athlete_weight,
            "event_code": self.event_code,
            "status": self.status or "DRAFT"
        }


class EventImage(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"))
    image = Column(LargeBinary, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "event_id": self.event_id
            # "image": self.image
        }


class Participant(Base):
    """
    Normalized Participants table.
    TODO: The Event.participants JSON column still exists for backwards compatibility.
          Consider migrating data and removing the JSON column in the future.
    """
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "event_id": self.event_id,
            "name": self.name,
            "email": self.email
        }
class ConversationModel(Base):
    __tablename__ = "conversation_history"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    
    role = Column(String)  # 'user' or 'assistant'
    content = Column(Text) # The actual message text
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Link back to the parent Event
    event = relationship("Event", back_populates="conversation_history")