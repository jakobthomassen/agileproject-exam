from ..DTOs.eventstate import EventState, EventImageCreate
from ..db.database import SessionLocal
from ..db.crud import create_event, get_all_events, create_image, update_event
from ..db.models import Event as EventModel
from ..pages.ai_sidebar import SIDEBAR_CONFIG


# Saves output EventState object from AI to database

def b_save_ai_generated_event(event_state: EventState):
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





# Save image DTO in DB
def save_event_image(image_data: EventImageCreate):
    db = SessionLocal()
    try:
        saved_event = create_image(db, image_data)
        return saved_event
    finally:
        db.close()


def save_ai_generated_event(event_state: EventState):
    db = SessionLocal()
    try:
        if event_state.eventid is None: # meaning this is a new event to be created add it to the db then get the id and insert it back into the event state
        
            saved_event = create_event(db, event_state)
            event_state.eventid = saved_event.id
            return saved_event
        
        else:# existing event just update it
            updated_event = update_event(db, event_state)
            return updated_event
    finally:
        db.close()


# In src/ai/event_handler.py

def get_event_ui_payload(event_id: int):
    db = SessionLocal()
    try:
        # 1. Fetch the row
        event_row = db.query(EventModel).filter(EventModel.id == event_id).first()
        
        if not event_row:
            print(f"DEBUG: Event {event_id} not found in DB.")
            return None

        # 2. USE YOUR MODEL'S to_dict() METHOD
        # This is much safer than __dict__. It ensures you get the clean data.
        event_data = event_row.to_dict()
        
        # Debug: See exactly what Python sees
        print(f"DEBUG: Data for UI Extraction: {event_data}")

        ui_payload = []
        for field in SIDEBAR_CONFIG:
            key = field["key"]
            val = event_data.get(key)

            # Debug: Track every field check
            # print(f"Checking {key}: {val}") 

            # 3. Skip if empty
            if val is None or val == "":
                continue

            # 4. FIX THE ENUM (Critical Step)
            # You must extract the string value ("text") from the Enum object
            comp_type = field["component"]
            if hasattr(comp_type, "value"):
                comp_type = comp_type.value # Becomes "text", "date", etc.

            ui_payload.append({
                "label": field["label"],
                "value": val,
                "type": comp_type # Send the string, not the Class Object
            })
            
        return ui_payload

    finally:
        db.close()

