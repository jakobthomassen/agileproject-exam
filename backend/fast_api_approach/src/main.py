"""
FastAPI Backend for Event Management System.

This backend runs on both macOS and Windows.

How to run:
-----------
1. Create a virtual environment:
   - Mac/Linux: python3 -m venv venv && source venv/bin/activate
   - Windows:   python -m venv venv && venv\\Scripts\\activate

2. Install dependencies:
   pip install -r requirements.txt

3. Set environment variable for Gemini API key:
   - Mac/Linux: export GEMINI_API_KEY="your-key-here"
   - Windows (PowerShell): $env:GEMINI_API_KEY="your-key-here"
   - Windows (CMD): set GEMINI_API_KEY=your-key-here

4. Start the server (from the backend/fast_api_approach directory):
   uvicorn src.main:app --reload

The server will run on http://127.0.0.1:8000
"""
import os
import json
from typing import List, Dict, Any
from fastapi import Depends, FastAPI, HTTPException, APIRouter, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.genai import types
from fastapi.responses import StreamingResponse
import uuid
import shutil


#  internal imports
from .ai.gemini import Gemini
from .auth.dependencies import get_user_identifier
from .auth.throttling import apply_rate_limit
from src.DTOs.eventstate import ChatRequest, ChatResponse, ParticipantCreate, EventOut
from .db.database import Base, engine, SessionLocal
from .ai.event_handler import get_event_ui_payload
from .db.crud import get_single_event, create_participant, get_all_events, get_participants_for_event
from .utils.import_participants import (
    parse_csv_participants,
    parse_excel_participants,
    validate_participant_row
)

app = FastAPI()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")


# ---------------------------------------------------------
# 1. CONFIGURATION
# ---------------------------------------------------------
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

current_dir = os.path.dirname(os.path.realpath(__file__))
static_path = os.path.join(current_dir, "static")
if os.path.isdir(static_path):
    app.mount("/static", StaticFiles(directory=static_path), name="static")

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------
# 2. AGENT INITIALIZATION
# ---------------------------------------------------------
def load_system_prompt():
    """Load the system prompt file. Uses os.path.join for cross-platform compatibility."""
    try:
        # Use os.path.join for cross-platform path handling (Mac + Windows)
        prompt_path = os.path.join(BASE_DIR, "prompts", "system_prompt.md")
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        print(f"Warning: System prompt not found at {prompt_path}")
        return None
    
system_prompt = load_system_prompt()
gemini_api_key = os.getenv("GEMINI_API_KEY")

if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set.")

# Your single persistent Agent instance
ai_platform = Gemini(api_key=gemini_api_key, system_prompt=system_prompt)

# ---------------------------------------------------------
# 3. ENDPOINTS
# ---------------------------------------------------------

class ExtractionMessage(BaseModel):
    role: str
    content: str

class ExtractionRequest(BaseModel):
    messages: List[ExtractionMessage]
    knownFields: Dict[str, Any]

@app.post("/ai/extract")
async def extract_event_data(
    messages_json: str = Form(...),
    known_fields_json: str = Form(default="{}"),
    file: UploadFile = File(None) 
):
    """
    Handles Chat + Saves CSV Locally
    """
    # 1. Parse JSON inputs
    try:
        messages_data = json.loads(messages_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in form data")

    # 2. SAVE FILE LOCALLY (If present)
    saved_file_path = None
    
    if file:
        try:
            # Generate unique ID so "data.csv" doesn't overwrite previous "data.csv"
            file_ext = file.filename.split(".")[-1]
            unique_filename = f"{uuid.uuid4()}.{file_ext}"
            saved_file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            # Write the file to disk
            with open(saved_file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
                
            print(f"DEBUG: CSV saved locally at: {saved_file_path}")
            
        except Exception as e:
            print(f"ERROR: Failed to save file: {e}")
            # You can decide whether to stop or continue if save fails
            # raise HTTPException(status_code=500, detail="File save failed")

    # 3. Convert to Gemini History
    gemini_history = []
    for m in messages_data:
        role = "model" if m.get("role") == "assistant" else "user"
        gemini_history.append(types.Content(role=role, parts=[types.Part(text=m.get("content"))]))

    # 4. OPTIONAL: Tell the Agent about the file
    # Even though we aren't parsing it yet, we can tell the agent "A file was uploaded"
    if saved_file_path and gemini_history:
        # Check if the last message was from the user
        if gemini_history[-1].role == "user":
            original_text = gemini_history[-1].parts[0].text
            # Append a system note to the user's prompt
            gemini_history[-1].parts[0].text = f"{original_text}\n\n[SYSTEM: User uploaded a file saved at {unique_filename}]"

    # 5. Run Agent & Unpack Tuple
    response_text, ui_payload = ai_platform.generate_text(contents=gemini_history)
    
    # 6. Extract State & Return
    try:
        current_state = ai_platform.event_state.model_dump() 
    except:
        current_state = vars(ai_platform.event_state)

    response_payload = {
        "message": response_text,
        "ui_payload": ui_payload, 
        **current_state 
    }
    
    return response_payload


# --- EXISTING CHAT ENDPOINT (Unchanged) ---
chat_history = [] 
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, user_id: str = Depends(get_user_identifier)):
    apply_rate_limit(user_id)
    chat_history.append(types.Content(role="user", parts=[types.Part(text=request.prompt)]))
    response_text = ai_platform.generate_text(contents=chat_history)
    if not response_text: response_text = "Error: No response."
    chat_history.append(types.Content(role="model", parts=[types.Part(text=response_text)]))
    return ChatResponse(response=response_text)

@app.get("/")
async def root():
    return {"message": "API is running"}


# ---------------------------------------------------------
# LIST ALL EVENTS ENDPOINT (for My Events page)
# ---------------------------------------------------------
@app.get("/events", response_model=List[EventOut])
def list_all_events():
    """
    Return all events from the database.
    Used by the "My Events" page in the frontend.
    """
    db = SessionLocal()
    try:
        events = get_all_events(db)
        
        # Map each Event model to EventOut response
        result = []
        for event in events:
            # Count participants for this event
            participants = get_participants_for_event(db, event.id)
            athletes_count = len(participants) if participants else 0
            
            # Get event name - handle both possible attribute names
            event_name = getattr(event, 'event_name', None) or getattr(event, 'eventname', None)
            
            # Map the database fields to the response model
            result.append(EventOut(
                id=event.id,
                name=event_name,
                sport=None,  # Not in current model, placeholder
                format=None,  # Not in current model, placeholder
                status="DRAFT",  # Default status for now
                start_date=event.date,
                athletes=athletes_count,
                event_code=None,  # Not in current model, placeholder
                location=event.location
            ))
        
        return result
    finally:
        db.close()


router = APIRouter()

@router.get("/api/events/{event_id}/details")
def get_details_endpoint(event_id: int):
    # Pass the ID directly to the service
    payload = get_event_ui_payload(event_id)
    
    if not payload:
        raise HTTPException(status_code=404, detail="Event not found")
        
    return payload


# ---------------------------------------------------------
# 4. PARTICIPANT IMPORT ENDPOINT (CSV / Excel)
# ---------------------------------------------------------
# This endpoint is INDEPENDENT of the chat UI.
# Frontend can call it directly to import participants for an event.

# Allowed file types for participant import
ALLOWED_IMPORT_EXTENSIONS = [".csv", ".xlsx"]
ALLOWED_IMPORT_MIME_TYPES = [
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]


@app.post("/events/{event_id}/participants/import")
async def import_participants(event_id: int, file: UploadFile = File(...)):
    """
    Import participants from a CSV or Excel (XLSX) file for a specific event.
    
    This endpoint is separate from the chat UI and can be called directly.
    
    Expected file format:
        - CSV or XLSX file
        - Headers (case-insensitive): name, email, phone (optional)
        
    Returns:
        JSON summary of the import operation with counts and any errors.
    """
    # 1. Validate event exists
    db = SessionLocal()
    try:
        event = get_single_event(db, event_id)
        if not event:
            raise HTTPException(status_code=404, detail=f"Event with ID {event_id} not found")
    finally:
        db.close()
    
    # 2. Check file extension
    filename = file.filename.lower() if file.filename else ""
    file_ext = os.path.splitext(filename)[1]
    
    if file_ext not in ALLOWED_IMPORT_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file_ext}'. Only CSV and XLSX files are allowed."
        )
    
    # 3. Read file content
    try:
        file_content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")
    
    # 4. Parse the file based on extension
    try:
        if file_ext == ".csv":
            participants_data = parse_csv_participants(file_content)
        else:  # .xlsx
            participants_data = parse_excel_participants(file_content)
    except ImportError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")
    
    # 5. Process each row and create participants
    total_rows = len(participants_data)
    created_count = 0
    skipped_count = 0
    errors = []
    
    db = SessionLocal()
    try:
        for idx, row_data in enumerate(participants_data):
            row_number = idx + 2  # +2 because: idx is 0-based, and row 1 is headers
            
            # Validate the row
            error_msg = validate_participant_row(row_data, row_number)
            if error_msg:
                errors.append({"row": row_number, "reason": error_msg})
                skipped_count += 1
                continue
            
            # Create participant using existing CRUD function
            try:
                participant_dto = ParticipantCreate(
                    event_id=event_id,
                    name=row_data.get('name'),
                    email=row_data.get('email')
                )
                create_participant(db, participant_dto)
                created_count += 1
            except Exception as e:
                errors.append({"row": row_number, "reason": f"Database error: {str(e)[:50]}"})
                skipped_count += 1
    finally:
        db.close()
    
    # 6. Return summary
    return {
        "event_id": event_id,
        "total_rows": total_rows,
        "created": created_count,
        "skipped": skipped_count,
        "errors": errors
    }
# Update valid MIME types for CSV
# Note: Some browsers send 'application/vnd.ms-excel' or 'text/plain' for CSVs
ALLOWED_CSV_TYPES = ["text/csv", "application/csv", "application/vnd.ms-excel", "text/plain"]

async def validate_and_save_csv(file: UploadFile):
    # 1. Check Extension (Crucial for CSVs)
    if not file.filename.lower().endswith(".csv"):
         raise HTTPException(status_code=400, detail="Only .csv files are allowed")

    # 2. Check Content Type (MIME)
    # We are slightly more lenient here because browsers vary wildly on CSV mime types
    if file.content_type not in ALLOWED_CSV_TYPES:
        print(f"Warning: Unusual CSV mime type: {file.content_type}")
        # You can choose to raise an error here if strict security is required:
        # raise HTTPException(status_code=400, detail="Invalid file type")

    # 3. Sanitize Name (Use UUID)
    # We force the extension to be .csv since we validated it above
    safe_filename = f"{uuid.uuid4()}.csv"
    
    # 4. Save to secure directory (Ensure 'uploads' folder exists)
    # Use os.path.join for cross-platform compatibility
    upload_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return safe_filename


# Include the router in the app
app.include_router(router)
