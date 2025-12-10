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
from src.DTOs.eventstate import ChatRequest, ChatResponse
from .db.database import Base, engine
from .ai.event_handler import get_event_ui_payload

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
    try:
        with open("src/prompts/system_prompt.md", "r") as f:
            return f.read()
    except FileNotFoundError:
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

router = APIRouter()

@router.get("/api/events/{event_id}/details")
def get_details_endpoint(event_id: int):
    # Pass the ID directly to the service
    payload = get_event_ui_payload(event_id)
    
    if not payload:
        raise HTTPException(status_code=404, detail="Event not found")
        
    return payload
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
    upload_path = f"uploads/{safe_filename}"
    
    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return safe_filename