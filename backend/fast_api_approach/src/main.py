from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --- LOCAL IMPORTS ---
# 1. The agent
from .ai.gemini import process_chat_request

# 2. The Hands (Database & CRUD Helpers)
from .ai.event_handler import (
    list_all_events, 
    delete_event, 
    update_event_in_db,
    create_event_from_frontend,
    get_event_context_data,
    get_event_chat_history,
    update_event_field_from_sidebar
)
from .db.crud import create_participant, create_image, get_images_for_event
from .db.database import SessionLocal
from .db.models import Event, Participant
from .DTOs.eventstate import ParticipantCreate, EventImageCreate
from fastapi import UploadFile, File
from fastapi.responses import Response
import csv
import io
import os
from pathlib import Path
import base64

# =================================================================
# APP CONFIGURATION
# =================================================================
app = FastAPI(title="Event Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Backend is running"}

# =================================================================
# DATA MODELS
# =================================================================
class ChatRequest(BaseModel):
    message: str
    event_id: Optional[int] = None


class EventUpdatePayload(BaseModel):
    eventName: Optional[str] = None
    venue: Optional[str] = None
    sport: Optional[str] = None
    startDate: Optional[str] = None
    endDateTime: Optional[str] = None
    athletes: Optional[int] = None
    status: Optional[str] = None
    rules: Optional[str] = None
    description: Optional[str] = None
    scoringMode: Optional[str] = None
    audienceWeight: Optional[int] = None
    expertWeight: Optional[int] = None
    athleteWeight: Optional[int] = None
    
    class Config:
        extra = "allow"  # Allows extra fields if the frontend sends them

class EventCreatePayload(BaseModel):
    eventName: Optional[str] = None
    venue: Optional[str] = None
    startDateTime: Optional[str] = None
    endDateTime: Optional[str] = None
    rules: Optional[str] = None
    scoringMode: Optional[str] = None
    eventCode: Optional[str] = None
    
    class Config:
        extra = "allow"  # Allows extra fields if the frontend sends them

# =================================================================
# 1. AI & CHAT ROUTES
# =================================================================
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Main entry point for the AI Agent.
    Accepts JSON (message + event_id).
    """
    try:
        return process_chat_request(request.message, request.event_id)
    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/greeting")
async def chat_greeting_endpoint():
    """
    Generates an initial greeting from the AI Agent.
    """
    try:
        # We send a prompt to the agent to generate a greeting.
        # We don't verify event_id here as this is for a new session.
        # The prompt is phrased to get a welcoming response.
        response = process_chat_request(
            "You are the AI Event Planner. The user has just started the session. "
            "Give them a short, professional, enthusiastic welcome and ask what event they are planning. "
            "Address the user directly. Do not say 'Here is a message'.", 
            event_id=None,
            save_state=False
        )
        
        # We only want the text, not the full payload with event_id=None
        return {"message": response["message"]}
    except Exception as e:
        print(f"Greeting Error: {e}")
        # Fallback if AI fails
        return {"message": "Hello! I'm your AI Event Planner. improving."}


@app.post("/api/events/{event_id}/image")
async def upload_event_image(event_id: int, file: UploadFile = File(...)):
    """
    Uploads an image for an event and stores it in the database.
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image bytes
        image_bytes = await file.read()
        
        # Create image record
        image_data = EventImageCreate(
            event_id=event_id,
            image_bytes=image_bytes
        )
        
        with SessionLocal() as db:
            db_image = create_image(db, image_data)
        
        return {
            "status": "success",
            "message": "Image uploaded successfully",
            "image_id": db_image.id
        }
    except Exception as e:
        print(f"Image Upload Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")


@app.get("/api/events/{event_id}/image")
async def get_event_image(event_id: int):
    """
    Gets the most recent image for an event.
    Returns image as base64 data URL or 404 if no image exists.
    """
    try:
        with SessionLocal() as db:
            images = get_images_for_event(db, event_id)
            
            if not images or len(images) == 0:
                raise HTTPException(status_code=404, detail="No image found for this event")
            
            # Get the most recent image (last one)
            latest_image = images[-1]
            
            # Convert binary to base64
            image_base64 = base64.b64encode(latest_image.image).decode('utf-8')
            
            # Determine content type (default to jpeg)
            content_type = "image/jpeg"
            
            return {
                "image": f"data:{content_type};base64,{image_base64}",
                "image_id": latest_image.id
            }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get Image Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get image: {str(e)}")

# =================================================================
# 2. READ ROUTES (Dashboard & Setup)
# =================================================================
@app.get("/api/events")
def get_all_events():
    """Returns the table list for the Dashboard."""
    return list_all_events()

@app.get("/api/events/{event_id}/context")
def get_event_context(event_id: int):
    """
    Returns full event details for the Setup/Edit pages.
    Used to populate the sidebar and form fields.
    """
    payload = get_event_context_data(event_id)
    if not payload:
        raise HTTPException(status_code=404, detail="Event not found")
    return payload

# In src/main.py


@app.get("/api/events/{event_id}/history")
def get_history_endpoint(event_id: int):
    """
    Fetches the chat history for a specific event.
    """
    history = get_event_chat_history(event_id)
    return history

# =================================================================
# 3. WRITE ROUTES (Create, Updates & Deletes)
# =================================================================
@app.post("/api/events")
def create_event_endpoint(payload: EventCreatePayload):
    """
    Creates a new event from manual setup flow.
    """
    data_dict = payload.model_dump(exclude_unset=True)
    
    event = create_event_from_frontend(data_dict)
    
    if not event:
        raise HTTPException(status_code=500, detail="Failed to create event")
    
    return {
        "status": "success",
        "message": "Event created",
        "event_id": event.id,
        "eventCode": event.event_code
    }

@app.put("/api/events/{event_id}")
def update_event(event_id: int, payload: EventUpdatePayload):
    """
    Updates an event. Uses Pydantic to validate the input automatically.
    """
    # Convert Pydantic model to dict, excluding nulls
    data_dict = payload.model_dump(exclude_unset=True)
    
    success = update_event_in_db(event_id, data_dict)
    
    if not success:
        raise HTTPException(status_code=404, detail="Event not found")
        
    return {"status": "success", "message": "Event updated"}

@app.delete("/api/events/{event_id}")
def delete_event_endpoint(event_id: int):
    """Permanently deletes an event."""
    success = delete_event(event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"status": "success", "message": "Event deleted"}

class SidebarFieldUpdate(BaseModel):
    field_key: str
    field_value: str

@app.patch("/api/events/{event_id}/sidebar-field")
def update_sidebar_field(event_id: int, payload: SidebarFieldUpdate):
    """
    Updates a single field from sidebar edit and notifies AI subtly.
    """
    success = update_event_field_from_sidebar(event_id, payload.field_key, payload.field_value)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update field")
    
    return {"status": "success", "message": "Field updated"}

class StatusUpdate(BaseModel):
    status: str

@app.patch("/api/events/{event_id}/status")
def update_event_status(event_id: int, payload: StatusUpdate):
    """
    Updates event status. Only toggleable from dashboard.
    """
    with SessionLocal() as db:
        event = db.query(Event).filter(Event.id == event_id).first()
        
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Validate status
        valid_statuses = ["DRAFT", "OPEN", "FINISHED"]
        if payload.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(valid_statuses)}")
        
        event.status = payload.status
        
        try:
            db.commit()
            return {"status": "success", "message": "Status updated", "newStatus": payload.status}
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")

@app.post("/api/events/{event_id}/participants/upload")
async def upload_participants_csv(event_id: int, file: UploadFile = File(...)):
    """
    Uploads a CSV file to add participants to an event.
    CSV format: name,email (or just name)
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    try:
        # Read CSV content
        contents = await file.read()
        csv_content = contents.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_content))
        
        created_count = 0
        errors = []
        
        with SessionLocal() as db:
            bulk_data = []
            for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 (row 1 is header)
                try:
                    # Handle different CSV formats (Case insensitive matching)
                    name = row.get('name') or row.get('Name') or row.get('NAME') or row.get('participant')
                    email = row.get('email') or row.get('Email') or row.get('EMAIL') or ''
                    
                    # Fallback: If 'name' key lookup failed, try the first column if it looks like a name
                    if not name and len(list(row.values())) > 0:
                        # Heuristic: If there is no 'name' key found in dict, but row has values
                        # Just take the first value as the name.
                        # This handles cases where header might be "Full Name" or "Student" etc.
                        first_val = list(row.values())[0]
                        if first_val and len(first_val) > 1:
                           name = first_val

                    if not name or not name.strip():
                        # Still empty?
                        errors.append(f"Row {row_num}: Missing name")
                        continue
                    
                    # Add to bulk list
                    bulk_data.append({
                        "event_id": event_id,
                        "name": name.strip(),
                        "email": email.strip() if email else None
                    })
                    created_count += 1
                    
                except Exception as e:
                    errors.append(f"Row {row_num}: {str(e)}")
            
            if bulk_data:
                db.bulk_insert_mappings(Participant, bulk_data)
                db.commit()
        
        return {
            "status": "success",
            "message": f"Uploaded {created_count} participants",
            "created": created_count,
            "errors": errors if errors else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")

# =================================================================
# 4. PARTICIPANT CRUD ROUTES
# =================================================================

class ParticipantResponse(BaseModel):
    id: int
    event_id: int
    name: str
    email: Optional[str] = None

@app.get("/api/events/{event_id}/participants")
def get_event_participants(event_id: int, skip: int = 0, limit: int = 100):
    """
    Get all participants for an event.
    """
    with SessionLocal() as db:
        participants = get_participants_for_event(db, event_id, skip=skip, limit=limit)
        # Convert to dictionary explicitly if needed, or rely on ORM -> Object conversion
        return [
            {"id": p.id, "event_id": p.event_id, "name": p.name, "email": p.email}
            for p in participants
        ]

@app.post("/api/events/{event_id}/participants")
def add_participant_endpoint(event_id: int, payload: ParticipantCreate):
    """
    Add a single participant manually.
    """
    # Ensure URL event_id matches payload
    payload.event_id = event_id
    
    with SessionLocal() as db:
        new_p = create_participant(db, payload)
        return {
            "status": "success",
            "participant": {
                "id": new_p.id,
                "event_id": new_p.event_id,
                "name": new_p.name,
                "email": new_p.email
            }
        }

@app.delete("/api/events/{event_id}/participants/{participant_id}")
def delete_participant_endpoint(event_id: int, participant_id: int):
    """
    Delete a participant.
    """
    with SessionLocal() as db:
        try:
            delete_participant(db, participant_id)
            return {"status": "success", "message": "Participant deleted"}
        except AttributeError:
             raise HTTPException(status_code=404, detail="Participant not found")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))