from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from .db import Base, engine
from .models import Event
from .schemas import EventCreate, EventRead
from .deps import get_db
from .chatbot.engine import extract_event_data


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

Base.metadata.create_all(bind=engine)


class AIMessage(BaseModel):
    role: str
    content: str


class AIExtractRequest(BaseModel):
    messages: List[AIMessage]
    knownFields: Dict[str, Any]


class AIExtractResponse(BaseModel):
    eventName: Optional[str] = None
    eventType: Optional[str] = None
    participants: Optional[int] = None

    scoringMode: Optional[str] = None
    scoringAudience: Optional[float] = None
    scoringJudge: Optional[float] = None

    venue: Optional[str] = None
    startDateTime: Optional[str] = None
    endDateTime: Optional[str] = None
    sponsor: Optional[str] = None
    rules: Optional[str] = None
    audienceLimit: Optional[int] = None


@app.post("/ai/extract", response_model=AIExtractResponse)
async def ai_extract(req: AIExtractRequest):
    messages = [{"role": m.role, "content": m.content} for m in req.messages]
    snapshot = await extract_event_data(messages, req.knownFields)

    return AIExtractResponse(
        eventName=snapshot["event_name"],
        eventType=snapshot["event_type"],
        participants=snapshot["participant_count"],
        scoringMode=snapshot["scoring_mode"],
        scoringAudience=snapshot["scoring_audience"],
        scoringJudge=snapshot["scoring_judge"],
        venue=snapshot["venue"],
        startDateTime=snapshot["start_date_time"],
        endDateTime=snapshot["end_date_time"],
        sponsor=snapshot["sponsor"],
        rules=snapshot["rules"],
        audienceLimit=snapshot["audience_limit"]
    )


@app.post("/events", response_model=EventRead)
def create_event(data: EventCreate, db: Session = Depends(get_db)):
    event = Event(
        event_type=data.event_type,
        scoring_audience=data.scoring_audience,
        scoring_judge=data.scoring_judge,
        participant_count=data.participant_count,
        sponsor=data.sponsor
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@app.get("/events/{event_id}", response_model=EventRead)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
