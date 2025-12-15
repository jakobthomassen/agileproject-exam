# src/DTOs/eventstate.py
from pydantic import BaseModel, Field
from typing import Optional, List


# --- Pydantic Models ---
class ChatRequest(BaseModel):
    prompt: str


class ChatResponse(BaseModel):
    response: str


# Event State
class EventState(BaseModel):
    eventid: Optional[int] = Field(None, description="Unique identifier for the event")
    eventname: Optional[str] = Field(None, description="Name of the event")
    eventdescription: Optional[str] = Field(None, description="Description of the event")
    eventdate: Optional[str] = Field(None, description="Date of the event in YYYY-MM-DD format")
    eventtime: Optional[str] = Field(None, description="Time of the event in HH:MM format")
    eventenddate: Optional[str] = Field(None, description="End date of the event in YYYY-MM-DD format")
    eventendtime: Optional[str] = Field(None, description="End time of the event in HH:MM format")
    eventlocation: Optional[str] = Field(None, description="Location of the event")
    eventjudgetype: Optional[str] = Field(None, description="Which of the three judging formats are chosen")
    eventaudienceweight: Optional[int] = Field(None, description="How much audience votes weigh")
    eventexpertweight: Optional[int] = Field(None, description="How much expert panel votes weigh")
    eventathleteweight: Optional[int] = Field(None, description="How much athlete votes weigh")

    def missing_fields(self) -> List[str]:
        """
        Returns list of missing required fields for event creation.
        Only eventname is required. Other fields are optional but recommended.
        """
        missing = []
        if not self.eventname:
            missing.append("eventname")
        return missing

    @property
    def is_complete(self) -> bool:
        """Returns True if all required fields are present."""
        return len(self.missing_fields()) == 0

# Data transfer object for event image creation
class EventImageCreate(BaseModel):
    event_id: int = Field(None, description="FK to events table")
    image_bytes: bytes = Field(None, description="Image stored in bytes")


# Data transfer object for participant creation/update
class ParticipantCreate(BaseModel):
    event_id: Optional[int] = Field(None, description="FK to events table")
    name: Optional[str] = Field(None, description="Name of the participant")
    email: Optional[str] = Field(None, description="Email of the participant")


# DTO for returning event data to frontend (My Events page)
class EventOut(BaseModel):
    """Response model for returning event data to the frontend."""
    id: int
    name: Optional[str] = None
    sport: Optional[str] = None
    format: Optional[str] = None
    status: str = "DRAFT"
    start_date: Optional[str] = None
    athletes: int = 0
    event_code: Optional[str] = None
    location: Optional[str] = None

    class Config:
        from_attributes = True  # Allows creating from SQLAlchemy models