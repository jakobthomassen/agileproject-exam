# src/DTOs/eventstate.py
from pydantic import BaseModel, Field
from typing import Optional, List


# --- Pydantic Models ---
class ChatRequest(BaseModel): # the input from the user
    prompt: str


class ChatResponse(BaseModel): # the response from the ai
    response: str


# Event State
class EventState(BaseModel):
    eventid: Optional[int] = Field(None, description="Unique identifier for the event")
    eventname: Optional[str] = Field(None, description="Name of the event")
    eventdescription: Optional[str] = Field(None, description="Description of the event")
    eventdate: Optional[str] = Field(None, description="Date of the event in YYYY-MM-DD format")
    eventtime: Optional[str] = Field(None, description="Time of the event in HH:MM format")
    eventlocation: Optional[str] = Field(None, description="Location of the event")
    eventjudgetype: Optional[str] = Field(None, description="Which of the three judging formats are chosen")
    eventaudienceweight: Optional[int] = Field(None, description="How much audience votes weigh")
    eventexpertweight: Optional[int] = Field(None, description="How much expert panel votes weigh")
    eventathleteweight: Optional[int] = Field(None, description="How much athlete votes weigh")

    # Function to return list of all missing fields that are required to create an event
    def missing_fields(self) -> List[str]:
        missing = []
        if not self.eventname:
            missing.append("eventname")
        #if not self.eventdate:
        #    missing.append("eventdate")
        #if not self.eventtime:
        #    missing.append("eventtime")
        #if not self.eventlocation:
        #    missing.append("eventlocation")
        #if not self.participants:
         #   missing.append("participants")
        return missing

    @property # check if all required fields are present
    def is_complete(self) -> bool: 
        #return len(self.missing_fields()) == 0 # if no missing fields, then complete. If any missing, then incomplete
        if len(self.missing_fields()) == 0:
            return "\nAll required event details are present."
        else:
            return "\nSome event details are missing."


# DTO to send to image creation
class EventImageCreate(BaseModel):
    event_id: int = Field(None, description="FK to events table")
    image_bytes: bytes = Field(None, description="Image stored in bytes")


# DTO for participant creation/update
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