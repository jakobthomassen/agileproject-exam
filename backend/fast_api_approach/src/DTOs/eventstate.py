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
    eventdate: Optional[str] = Field(None, description="Date of the event in YYYY-MM-DD format")
    eventtime: Optional[str] = Field(None, description="Time of the event in HH:MM format")
    eventlocation: Optional[str] = Field(None, description="Location of the event")
    participants: Optional[List[str]] = Field(None, description="List of participants' names or emails")

    def missing_fields(self) -> List[str]:
        missing = []
        if not self.eventname:
            missing.append("eventname")
        if not self.eventdate:
            missing.append("eventdate")
        if not self.eventtime:
            missing.append("eventtime")
        if not self.eventlocation:
            missing.append("eventlocation")
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
    event_id: int = Field(None, description="FK to events table")
    name: Optional[str] = Field(None, description="Name of the participant")
    email: Optional[str] = Field(None, description="Email of the participant")


# DTO for import error details
class ImportError(BaseModel):
    row: int = Field(..., description="Row number in the file (1-indexed)")
    reason: str = Field(..., description="Why this row was skipped")


# DTO for participant import result
class ParticipantImportResult(BaseModel):
    event_id: int = Field(..., description="The event ID participants were imported to")
    total_rows: int = Field(..., description="Total rows found in the file")
    created: int = Field(..., description="Number of participants created")
    skipped: int = Field(..., description="Number of rows skipped")
    errors: List[ImportError] = Field(default_factory=list, description="List of errors for skipped rows")