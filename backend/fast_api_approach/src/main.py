import os
from fastapi import Depends, FastAPI
from .ai.gemini import Gemini
from .auth.dependencies import get_user_identifier
from .auth.throttling import apply_rate_limit
from src.DTOs.eventstate import ChatRequest, ChatResponse, EventState
from google.genai import types
from .db.database import Base, engine

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


