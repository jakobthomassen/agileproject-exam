import os
from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session
from .ai.gemini import Gemini
from .auth.dependencies import get_user_identifier
from .auth.throttling import apply_rate_limit
from src.DTOs.eventstate import ChatRequest, ChatResponse, EventState, EventCreate, EventResponse, SimulateAIRequest
from google.genai import types
from .db.database import get_db, init_db
from .db import crud

app = FastAPI()

# Initialize the database when the app starts
@app.on_event("startup")
def startup_event():
    """This runs when the app starts - it creates the database tables"""
    init_db()
    print("✅ Database initialized!")

# --- AI Configuration ---
def load_system_prompt():
    """Load the system prompt from file. Uses UTF-8 encoding to handle special characters."""
    try:
        # encoding='utf-8' tells Python to read special characters correctly
        with open("src/prompts/system_prompt.md", "r", encoding="utf-8") as f:
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

# ======================================
# DATABASE ENDPOINTS
# ======================================

@app.post("/events", response_model=EventResponse)
async def create_new_event(event: EventCreate, db: Session = Depends(get_db)):
    """
    Create a new event in the database
    
    This endpoint takes event data and saves it to the database.
    Returns the created event with its ID.
    """
    try:
        db_event = crud.create_event(
            db=db,
            customer_id=event.customer_id,
            title=event.title,
            description=event.description,
            date=event.date,
            location=event.location
        )
        return db_event
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating event: {str(e)}")

@app.get("/events", response_model=list[EventResponse])
async def get_all_events(db: Session = Depends(get_db)):
    """
    Get all events from the database
    
    Returns a list of all events.
    """
    events = crud.get_all_events(db)
    return events

@app.get("/events/{event_id}", response_model=EventResponse)
async def get_event_by_id(event_id: int, db: Session = Depends(get_db)):
    """
    Get a specific event by its ID
    
    Returns the event if found, or 404 error if not found.
    """
    event = crud.get_event(db, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@app.get("/events/customer/{customer_id}", response_model=list[EventResponse])
async def get_events_by_customer_id(customer_id: str, db: Session = Depends(get_db)):
    """
    Get all events for a specific customer
    
    Returns a list of events created by this customer.
    """
    events = crud.get_events_by_customer(db, customer_id)
    return events

@app.post("/simulate-ai-response")
async def simulate_ai_response(request: SimulateAIRequest, db: Session = Depends(get_db)):
    """
    Simulate an AI response for an event
    
    This is for testing purposes - it simulates the AI processing an event
    and updates the event status to CONFIRMED.
    """
    result = crud.simulate_ai_response(db, request.event_id, request.ai_response)
    if result is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return {
        "message": "AI response simulated successfully",
        "event": result["event"],
        "ai_response": result["ai_response"]
    }


