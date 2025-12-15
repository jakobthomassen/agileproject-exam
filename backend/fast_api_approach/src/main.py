from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
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
from .db.models import Event
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
    allow_origins=["*"], # Relaxed for debugging
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

# Using a flexible dict model for updates allows us to send 
# partial updates (e.g. just changing the name) without strict schemas.
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
        extra = "allow" # Allows extra fields if the frontend sends them

class EventCreatePayload(BaseModel):
    eventName: Optional[str] = None #we'1 Event Name
    venue: Optional[str] = None # Venue
    startDateTime: Optional[str] = None # Start Date
    endDateTime: Optional[str] = None # End Date
    rules: Optional[str] = None # Rules
    scoringMode: Optional[str] = None # Scoring Mode
    eventCode: Optional[str] = None
    
    class Config:
        extra = "allow" # Allows extra fields if the frontend sends them

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

@app.post("/api/events/{event_id}/upload-file")
async def upload_file(event_id: int, file: UploadFile = File(...)):
    """
    Uploads a file and saves it to uploads/{event_id}/ directory.
    Returns the filename for later processing.
    """
    try:
        # Create uploads directory structure
        upload_dir = Path(f"uploads/{event_id}")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Save file
        file_path = upload_dir / file.filename
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        return {
            "status": "success",
            "message": "File uploaded successfully",
            "filename": file.filename,
            "path": f"uploads/{event_id}/{file.filename}"
        }
    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

class ProcessFileRequest(BaseModel):
    filename: str

@app.post("/api/events/{event_id}/process-file")
async def process_uploaded_file(event_id: int, request: ProcessFileRequest):
    """
    Processes a CSV file that was previously uploaded to uploads/{event_id}/
    Reads the file, extracts data, and sends it to AI for processing.
    """
    try:
        file_path = Path(f"uploads/{event_id}/{request.filename}")
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail=f"File not found: {request.filename}")
        
        # Read file content
        with open(file_path, "r", encoding="utf-8") as f:
            file_content = f.read()
        
        # Create message with CSV content
        message = f"Process this CSV file: {request.filename}\n\nCSV Content:\n{file_content}"
        
        # Process with AI
        return process_chat_request(message, event_id)
        
    except Exception as e:
        print(f"File Processing Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
            content_type = "image/jpeg"  # Could be enhanced to detect actual type
            
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
            for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 (row 1 is header)
                try:
                    # Handle different CSV formats
                    name = row.get('name') or row.get('Name') or row.get('NAME') or row.get('participant') or ''
                    email = row.get('email') or row.get('Email') or row.get('EMAIL') or ''
                    
                    if not name.strip():
                        errors.append(f"Row {row_num}: Missing name")
                        continue
                    
                    # Create participant
                    participant_data = ParticipantCreate(
                        event_id=event_id,
                        name=name.strip(),
                        email=email.strip() if email else None
                    )
                    
                    create_participant(db, participant_data)
                    created_count += 1
                    
                except Exception as e:
                    errors.append(f"Row {row_num}: {str(e)}")
            
            db.commit()
        
        return {
            "status": "success",
            "message": f"Uploaded {created_count} participants",
            "created": created_count,
            "errors": errors if errors else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")