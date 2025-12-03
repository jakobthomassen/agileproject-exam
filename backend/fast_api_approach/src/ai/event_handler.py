from ..DTOs.eventstate import EventState
from ..db.database import SessionLocal
from ..db.crud import create_event, get_all_events


# Saves output EventState object from AI to database
def save_ai_generated_event(event_state: EventState):
    db = SessionLocal()
    try:
        saved_event = create_event(db, event_state)
        return saved_event
    finally:
        db.close()


# Read all events from database
def debug_read_all_events():
    db = SessionLocal()
    try:
        all_events = get_all_events(db)
        return all_events
    finally:
        db.close()
