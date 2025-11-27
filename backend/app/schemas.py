from pydantic import BaseModel

class EventCreate(BaseModel):
    event_type: str
    scoring_audience: float
    scoring_judge: float
    participant_count: int
    sponsor: str | None = None

class EventRead(BaseModel):
    id: int
    event_type: str
    scoring_audience: float
    scoring_judge: float
    participant_count: int
    sponsor: str | None

    class Config:
        from_attributes = True
