import os
from fastapi import Depends, FastAPI, UploadFile, File, HTTPException
from .ai.gemini import Gemini
from .auth.dependencies import get_user_identifier
from .auth.throttling import apply_rate_limit
from src.DTOs.eventstate import ChatRequest, ChatResponse, ParticipantCreate, ParticipantImportResult, ImportError
from google.genai import types
from .db.database import Base, engine, SessionLocal
from .db.crud import get_single_event, create_participant
from .utils.import_participants import parse_csv_participants, parse_excel_participants, is_row_valid

app = FastAPI()

# Initialize database on app startup
@app.on_event("startup")
def startup_event():
    print("Initializing database...")
    Base.metadata.create_all(bind=engine)
    print("Database ready.")


# --- AI Configuration ---
def load_system_prompt():
    try:
        with open("src/prompts/system_prompt.md", "r") as f:
            return f.read()
    except FileNotFoundError:
        return None
    
system_prompt = load_system_prompt()
gemini_api_key = os.getenv("GEMINI_API_KEY")

if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set.")

ai_platform = Gemini(api_key=gemini_api_key, system_prompt=system_prompt)




# --- Chat history storage (in-memory for simplicity) --- change to persistent storage later
chat_history = [] # currently no session management, all users share same history - to be improved later

# --- API Endpoints ---
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, user_id: str = Depends(get_user_identifier)):
    apply_rate_limit(user_id)

    #1. Append user message to chat history, using sdk to format message correctly
    chat_history.append(
        types.Content(
            role="user", 
            parts=[types.Part(request.prompt)]) # promt is the user message from the frontend/endpoint
    )
    #2. Call the class (passing the entire chat history)
    # The sdk will examine the history and decide if any tool needs to be called
    # The final response will be returned after tool execution if any
    response_text = ai_platform.generate_text(contents=chat_history)
    if response_text is None:
        # check if tool calling was attempted but failed
        print("Tool calling attempted but no response received.")
        response_text = "I am attempting to use a tool, but was. unable to get comfirmation."
    #3. add ai response to chat history(so that context is maintained in future calls)
    chat_history.append(
        types.Content(
            role="model",
            parts=[types.Part(response_text)]
        )
    )
    return ChatResponse(response=response_text)




@app.get("/")
async def root():
    return {"message": "API is running"}


# --- Participant Import Endpoint ---
@app.post("/events/{event_id}/participants/import", response_model=ParticipantImportResult)
async def import_participants(event_id: int, file: UploadFile = File(...)):
    """
    Import participants from a CSV or Excel (XLSX) file for a specific event.
    
    Expected columns in the file:
    - name: Participant's name
    - email: Participant's email
    
    At least one of 'name' or 'email' must be present for a row to be imported.
    """
    # Check file extension
    filename = file.filename or ""
    filename_lower = filename.lower()
    
    if filename_lower.endswith(".csv"):
        file_type = "csv"
    elif filename_lower.endswith(".xlsx"):
        file_type = "xlsx"
    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload a CSV (.csv) or Excel (.xlsx) file."
        )
    
    # Read file content
    file_content = await file.read()
    
    # Check if event exists
    db = SessionLocal()
    try:
        event = get_single_event(db, event_id)
        if not event:
            raise HTTPException(
                status_code=404,
                detail=f"Event with ID {event_id} not found."
            )
        
        # Parse file based on type
        if file_type == "csv":
            rows = parse_csv_participants(file_content)
        else:
            rows = parse_excel_participants(file_content)
        
        # Process rows and create participants
        total_rows = len(rows)
        created = 0
        skipped = 0
        errors = []
        
        for idx, row in enumerate(rows):
            row_number = idx + 2  # +2 because: idx is 0-based, and row 1 is the header
            
            # Validate row
            is_valid, reason = is_row_valid(row)
            if not is_valid:
                skipped += 1
                errors.append(ImportError(row=row_number, reason=reason))
                continue
            
            # Build ParticipantCreate DTO
            participant_data = ParticipantCreate(
                event_id=event_id,
                name=row.get("name", "").strip() or None,
                email=row.get("email", "").strip() or None
            )
            
            # Use existing CRUD function to create participant
            try:
                create_participant(db, participant_data)
                created += 1
            except Exception as e:
                skipped += 1
                errors.append(ImportError(row=row_number, reason=f"Database error: {str(e)}"))
        
        return ParticipantImportResult(
            event_id=event_id,
            total_rows=total_rows,
            created=created,
            skipped=skipped,
            errors=errors
        )
    
    finally:
        db.close()

