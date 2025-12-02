# src/DTOs/eventstate.py
from pydantic import BaseModel, Field
from typing import Optional, List

# -- Api request/response models

# --- Pydantic Models ---
class ChatRequest(BaseModel): # the input from the user
    prompt: str


class ChatResponse(BaseModel): # the response from the ai
    response: str

# Event state 
class EventState(BaseModel):
    eventname: Optional[str] = Field(None, description="Name of the event")
    date: Optional[str] = Field(None, description="Date of the event in YYYY-MM-DD format")
    time: Optional[str] = Field(None, description="Time of the event in HH:MM format")
    location: Optional[str] = Field(None, description="Location of the event")
    participants: Optional[List[str]] = Field(None, description="List of participants' names or emails")

    def missing_fields(self) -> List[str]:
        missing = []
        if not self.eventname:
            missing.append("eventname")
        if not self.date:
            missing.append("date")
        if not self.time:
            missing.append("time")
        if not self.location:
            missing.append("location")
        if not self.participants:
            missing.append("participants")
        return missing
    @property # check if all required fields are present
    def is_complete(self) -> bool: 
        return len(self.missing_fields()) == 0 # if no missing fields, then complete. If any missing, then incomplete

# --- Database Event Models ---
# These are for creating and reading events from the database

class EventCreate(BaseModel):
    """Model for creating a new event"""
    customer_id: str = Field(..., description="ID of the customer creating the event")
    title: str = Field(..., description="Title of the event")
    description: str = Field(..., description="Description of the event")
    date: str = Field(..., description="Date of the event")
    location: str = Field(..., description="Location of the event")

class EventResponse(BaseModel):
    """Model for returning event data"""
    id: int
    customer_id: str
    title: str
    description: str
    date: str
    location: str
    status: str
    
    class Config:
        from_attributes = True  # Allows Pydantic to work with SQLAlchemy models

class SimulateAIRequest(BaseModel):
    """Model for simulating AI response"""
    event_id: int = Field(..., description="ID of the event to simulate response for")
    ai_response: str = Field(..., description="Simulated AI response text")