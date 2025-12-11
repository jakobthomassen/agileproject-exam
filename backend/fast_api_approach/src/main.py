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
from src.DTOs.eventstate import ChatRequest, ChatResponse
from .db.database import Base, engine
from .ai.event_handler import get_event_ui_payload

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
def load_system_prompt() -> str | None:
    try:
        with open(PROMPT_PATH, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
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
# EVENTS API
# ---------------------------------------------------------
router = APIRouter()

@router.get("/api/events/{event_id}/details")
def get_details_endpoint(event_id: int):
    payload = get_event_ui_payload(event_id)
    if not payload:
        raise HTTPException(status_code=404, detail="Event not found")
    return payload

# ---------------------------------------------------------
# CSV UTIL
# ---------------------------------------------------------
ALLOWED_CSV_TYPES = [
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
    "text/plain",
]

async def validate_and_save_csv(file: UploadFile):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are allowed")

    if file.content_type not in ALLOWED_CSV_TYPES:
        pass

    safe_filename = f"{uuid.uuid4()}.csv"
    upload_path = os.path.join(UPLOAD_DIR, safe_filename)

    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return safe_filename
