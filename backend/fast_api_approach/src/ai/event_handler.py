from ..DTOs.eventstate import EventState, EventImageCreate, ParticipantCreate
from ..db.database import SessionLocal
from ..db.crud import create_event, get_all_events, create_image, update_event
from ..db.models import Event as EventModel
from ..pages.ai_sidebar import SIDEBAR_CONFIG
from ..db.crud import (create_event, get_all_events, create_image, get_single_event, update_event,
                       delete_event, get_single_image, get_all_images, get_images_for_event, update_image,
                       delete_images, create_participant, get_single_participant, get_all_participants,
                       get_participants_for_event, update_participant, delete_participant)



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
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()





# Save image DTO in DB
def save_event_image(image_data: EventImageCreate):
    db = SessionLocal()
    try:
        saved_event = create_image(db, image_data)
        return saved_event
    except Exception as e:
        print(f"Error: {str(e)}")
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



def debug_read_single_event(id: int):
    db = SessionLocal()
    try:
        single_event = get_single_event(db, id)
        return single_event
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


def debug_update_event(event_state: EventState):
    db = SessionLocal()
    try:
        event_to_update = update_event(db, event_state)
        return event_to_update
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


def debug_delete_event(id: int):
    db = SessionLocal()
    try:
        delete_event(db, id)
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


# Save image DTO in DB
def save_event_image(image_data: EventImageCreate):
    db = SessionLocal()
    try:
        saved_event = create_image(db, image_data)
        return saved_event
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


# READ (single)
def debug_read_event_image(id: int):
    db = SessionLocal()
    try:
        return get_single_image(db, id)
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


# READ (all)
def debug_read_all_images():
    db = SessionLocal()
    try:
        return get_all_images(db)
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


# UPDATE
def debug_update_image(image_data: EventImageCreate, id: int):
    db = SessionLocal()
    try:
        return update_image(db, id, image_data)
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


#  DELETE
def debug_delete_event_image(id: int):
    db = SessionLocal()
    try:
        return delete_images(db, id) # returns True/False
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


# --- Participant wrapper functions ---

# CREATE
def save_participant(participant_data: ParticipantCreate):
    db = SessionLocal()
    try:
        saved_participant = create_participant(db, participant_data)
        return saved_participant
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


# READ (single)
def debug_read_single_participant(id: int):
    db = SessionLocal()
    try:
        return get_single_participant(db, id)
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


# READ (all)
def debug_read_all_participants():
    db = SessionLocal()
    try:
        return get_all_participants(db)
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


# READ (for event)
def debug_read_participants_for_event(event_id: int):
    db = SessionLocal()
    try:
        return get_participants_for_event(db, event_id)
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


# UPDATE
def debug_update_participant(participant_data: ParticipantCreate, id: int):
    db = SessionLocal()
    try:
        return update_participant(db, id, participant_data)
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


# DELETE
def debug_delete_participant(id: int):
    db = SessionLocal()
    try:
        delete_participant(db, id)
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()