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
import uuid
import shutil
from typing import List, Dict, Any

from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    APIRouter,
    UploadFile,
    File,
    Form,
)
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from google.genai import types

# internal imports
from .ai.gemini import Gemini
from .auth.dependencies import get_user_identifier
from .auth.throttling import apply_rate_limit
from src.DTOs.eventstate import ChatRequest, ChatResponse, ParticipantCreate, EventOut
from .db.database import Base, engine, SessionLocal
from .ai.event_handler import get_event_ui_payload
from .db.crud import get_single_event, create_participant, get_all_events, get_participants_for_event, delete_event
from .utils.import_participants import (
    parse_csv_participants,
    parse_excel_participants,
    validate_participant_row
)

# ---------------------------------------------------------
# APP SETUP
# ---------------------------------------------------------
app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
PROMPT_PATH = os.path.join(BASE_DIR, "prompts", "system_prompt.md")

os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---------------------------------------------------------
# CONFIGURATION
# ---------------------------------------------------------
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_path = os.path.join(BASE_DIR, "static")
if os.path.isdir(static_path):
    app.mount("/static", StaticFiles(directory=static_path), name="static")

# ---------------------------------------------------------
# GLOBAL STATE
# ---------------------------------------------------------
ai_platform: Gemini | None = None
chat_history: list = []

GENERIC_FAILURE_MESSAGE = "The service is temporarily unavailable."
MISSING_API_KEY_MESSAGE = "AI service is not configured. Missing API key."

# ---------------------------------------------------------
# UTILITIES
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

# ---------------------------------------------------------
# STARTUP
# ---------------------------------------------------------
@app.on_event("startup")
def startup_event():
    global ai_platform

    Base.metadata.create_all(bind=engine)

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        ai_platform = None
        return

    system_prompt = load_system_prompt()
    ai_platform = Gemini(
        api_key=api_key,
        system_prompt=system_prompt,
    )

# ---------------------------------------------------------
# MODELS
# ---------------------------------------------------------
class ExtractionMessage(BaseModel):
    role: str
    content: str

class ExtractionRequest(BaseModel):
    messages: List[ExtractionMessage]
    knownFields: Dict[str, Any]

# ---------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------
@app.post("/ai/extract")
async def extract_event_data(
    messages_json: str = Form(...),
    known_fields_json: str = Form(default="{}"),
    file: UploadFile = File(None),
):
    if ai_platform is None:
        raise HTTPException(status_code=503, detail=MISSING_API_KEY_MESSAGE)

    try:
        messages_data = json.loads(messages_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in form data")

    saved_file_path = None
    unique_filename = None

    if file:
        try:
            file_ext = file.filename.split(".")[-1]
            unique_filename = f"{uuid.uuid4()}.{file_ext}"
            saved_file_path = os.path.join(UPLOAD_DIR, unique_filename)

            with open(saved_file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception:
            pass

    gemini_history = []
    for m in messages_data:
        role = "model" if m.get("role") == "assistant" else "user"
        gemini_history.append(
            types.Content(
                role=role,
                parts=[types.Part(text=m.get("content"))],
            )
        )

    if saved_file_path and gemini_history and gemini_history[-1].role == "user":
        original_text = gemini_history[-1].parts[0].text
        gemini_history[-1].parts[0].text = (
            f"{original_text}\n\n"
            f"[SYSTEM: User uploaded a file saved at {unique_filename}]"
        )

    try:
        response_text, ui_payload = ai_platform.generate_text(contents=gemini_history)
    except Exception:
        raise HTTPException(status_code=500, detail=GENERIC_FAILURE_MESSAGE)

    try:
        current_state = ai_platform.event_state.model_dump()
    except Exception:
        current_state = vars(ai_platform.event_state)

    return {
        "message": response_text,
        "ui_payload": ui_payload,
        **current_state,
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user_id: str = Depends(get_user_identifier),
):
    apply_rate_limit(user_id)

    if ai_platform is None:
        return ChatResponse(response=MISSING_API_KEY_MESSAGE)

    try:
        chat_history.append(
            types.Content(
                role="user",
                parts=[types.Part(text=request.prompt)],
            )
        )
        response_text = ai_platform.generate_text(contents=chat_history)
    except Exception:
        return ChatResponse(response=GENERIC_FAILURE_MESSAGE)

    if not response_text:
        response_text = GENERIC_FAILURE_MESSAGE

    chat_history.append(
        types.Content(
            role="model",
            parts=[types.Part(text=response_text)],
        )
    )
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


@app.delete("/events/{event_id}")
def delete_event_endpoint(event_id: int):
    """
    Delete an event by ID.
    Used by the "My Events" page for the delete action.
    """
    db = SessionLocal()
    try:
        event = get_single_event(db, event_id)
        if not event:
            raise HTTPException(status_code=404, detail=f"Event with ID {event_id} not found")
        
        delete_event(db, event_id)
        return {"message": f"Event {event_id} deleted successfully"}
    except AttributeError as e:
        raise HTTPException(status_code=404, detail=str(e))
    finally:
        db.close()


router = APIRouter()

@router.get("/api/events/{event_id}/details")
def get_details_endpoint(event_id: int):
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
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are allowed")

    if file.content_type not in ALLOWED_CSV_TYPES:
        pass

    safe_filename = f"{uuid.uuid4()}.csv"
    
    # 4. Save to secure directory (Ensure 'uploads' folder exists)
    # Use os.path.join for cross-platform compatibility
    upload_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return safe_filename


# Include the router in the app
app.include_router(router)
